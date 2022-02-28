import { Transaction } from "@zilliqa-js/account";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { Transaction as EthTransaction, ethers } from "ethers";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { CarbonWallet, Blockchain, Models, AddressUtils, CarbonSDK, ConnectedCarbonSDK } from "carbon-js-sdk";
import { GetDetailedTransfersResponse, GetTransfersRequest } from "carbon-js-sdk/lib/hydrogen";
import { APIS, Network } from "zilswap-sdk/lib/constants";
import { FeesData } from "core/utilities/bridge";
import { Bridge, logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import { BIG_ONE, BRIDGE_TX_DEPOSIT_CONFIRM_ETH, BRIDGE_TX_DEPOSIT_CONFIRM_ZIL, PollIntervals } from "app/utils/constants";
import { SimpleMap, bnOrZero, netZilToCarbon } from "app/utils";
import { BridgeTx, BridgeableToken, BridgeableTokenMapping, RootState } from "app/store/types";
import { actions } from "app/store";
import { getBlockchain, getBridge } from '../selectors';

export enum Status {
  NotStarted,
  // DepositApproved,
  DepositTxStarted,
  DepositTxConfirmed,
  WithdrawTxStarted,
  WithdrawTxConfirmed,
}

export interface EthTransactionResponse extends EthTransaction {
  confirmations?: number
}

function getBridgeTxStatus(tx: BridgeTx): Status {
  if (tx.destinationTxHash) {
    return Status.WithdrawTxConfirmed;
  }

  if (tx.withdrawTxHash) {
    return Status.WithdrawTxStarted;
  }

  if (tx.depositTxConfirmedAt) {
    return Status.DepositTxConfirmed;
  }

  if (tx.sourceTxHash) {
    return Status.DepositTxStarted;
  }

  return Status.NotStarted;
}

const makeTxFilter = (statuses: Status[]) => {
  return (state: RootState) => {
    return state.bridge.bridgeTxs.filter((tx) => statuses.includes(getBridgeTxStatus(tx)));
  }
}

function* watchDepositConfirmation() {
  const getFilteredTx = makeTxFilter([Status.NotStarted, Status.DepositTxStarted, Status.DepositTxConfirmed]);
  while (true) {
    try {
      // watch and update relevant txs
      const bridgeTxs = (yield select(getFilteredTx)) as BridgeTx[];
      const zilNetwork = (yield select((state: RootState) => state.wallet.wallet?.network)) as Network;
      const bridgeableTokensMap = (yield select((state: RootState) => state.bridge.tokens)) as BridgeableTokenMapping;
      logger("bridge saga", "watch deposit confirmation", bridgeTxs.length);

      const updatedTxs: SimpleMap<BridgeTx> = {};
      for (const tx of bridgeTxs) {
        try {
          const network = netZilToCarbon(tx.network ?? Network.TestNet);
          const sdk = (yield CarbonSDK.instance({ network })) as CarbonSDK;

          const swthAddress = AddressUtils.SWTHAddress.generateAddress(tx.interimAddrMnemonics, undefined, { network });

          // check if deposit is confirmed
          if (!tx.depositTxConfirmedAt) {
            const queryOpts: GetTransfersRequest = {
              to_address: swthAddress,
              limit: 100,
            };
            const result = (yield call([sdk.hydrogen, sdk.hydrogen.getDetailedTransfers], queryOpts)) as GetDetailedTransfersResponse;

            console.log("bridge saga", result)

            const depositTransfer = result.data.find((transfer) => transfer.from_address?.toLowerCase() === tx.srcAddr && transfer.source_blockchain === tx.srcChain);

            if (depositTransfer?.destination_transaction !== null) {
              if (!tx.sourceTxHash) {
                tx.sourceTxHash = depositTransfer?.source_transaction?.tx_hash;
              }

              tx.depositTxConfirmedAt = dayjs();
              updatedTxs[tx.sourceTxHash!] = tx;

              logger("bridge saga", "confirmed tx deposit", tx.sourceTxHash);
            }
          }

          if (!tx.depositTxConfirmedAt) {
            if (tx.srcChain === Blockchain.Zilliqa) {
              try {
                const rpcEndpoint = APIS[zilNetwork] ?? APIS.TestNet;
                const zilliqa = new Zilliqa(rpcEndpoint);
                const transaction = (yield call([zilliqa.blockchain, zilliqa.blockchain.getTransaction], tx.sourceTxHash!)) as Transaction | undefined;

                logger("bridge saga", tx.sourceTxHash, transaction?.status);
                if (transaction?.isPending()) continue;
                if (transaction?.isRejected()) {
                  tx.depositFailedAt = dayjs();
                  updatedTxs[tx.sourceTxHash!] = tx;
                } else {
                  tx.depositTxConfirmedAt = dayjs();
                }
              } catch (error) {
                if (error?.message !== "Txn Hash not Present") {
                  console.error("check tx status failed, will try again later");
                  console.error(error);
                }
              }
            } else {
              try {
                const carbonNetwork = netZilToCarbon(tx.network);
                const sdk = (yield CarbonSDK.instance({ network: carbonNetwork })) as CarbonSDK;
                const provider = sdk.eth.getProvider();
                const transaction = (yield call([provider, provider.getTransactionReceipt], tx.sourceTxHash!)) as ethers.providers.TransactionReceipt
                logger("bridge saga", tx.sourceTxHash, transaction?.confirmations);
                if (!transaction?.confirmations) continue;
                if (transaction.status === 0) {
                  tx.depositFailedAt = dayjs();
                  updatedTxs[tx.sourceTxHash!] = tx;
                }
              } catch (error) {
                console.error("check tx status failed, will try again later");
                console.error(error);
              }
            }
          }

          logger("bridge saga", "tx", tx)

          // trigger withdraw tx if deposit confirmed
          if (tx.depositTxConfirmedAt) {
            const bridgeTokens = tx.srcChain === Blockchain.Zilliqa ? bridgeableTokensMap.zil : bridgeableTokensMap.eth;
            const bridgeToken = bridgeTokens.find(t => t.denom === tx.srcToken);
            const balanceDenom = bridgeToken?.balDenom ?? "";

            logger("bridge saga", "bridgeTokens", bridgeTokens)
            logger("bridge saga", "balance denom", swthAddress, balanceDenom)
            const balanceResult = (yield call([sdk.query.bank, sdk.query.bank.Balance], { address: swthAddress, denom: balanceDenom })) as Models.Bank.QueryBalanceResponse;

            logger("bridge saga", "detected balance to withdraw", swthAddress, balanceResult, balanceDenom)
            const withdrawAmount = bnOrZero(balanceResult.balance?.amount);
            if (withdrawAmount.isZero()) {
              throw new Error(`carbon address balance not found`)
            }

            const decimals = sdk.token.getDecimals(balanceDenom) ?? 0;
            const withdrawAmountHuman = withdrawAmount.shiftedBy(-decimals);
            const connectedSDK = (yield call([sdk, sdk.connectWithMnemonic], tx.interimAddrMnemonics)) as ConnectedCarbonSDK
            const withdrawResult = (yield call([connectedSDK.coin, connectedSDK.coin.createWithdrawal], {
              amount: withdrawAmountHuman,
              denom: tx.dstToken,
              toAddress: tx.dstAddr.toLowerCase().replace(/^0x/i, ""),
              feeAddress: BridgeParamConstants.SWTH_FEE_ADDRESS,
              feeAmount: tx.withdrawFee,
            })) as CarbonWallet.SendTxResponse;

            tx.withdrawTxHash = withdrawResult.transactionHash;
            updatedTxs[tx.sourceTxHash!] = tx;

            logger("bridge saga", "initiated tx withdraw", tx.withdrawTxHash);
          }
        } catch (error) {
          console.error('process deposit tx error');
          console.error(error);
        }
      }

      // update redux updatedTxs
      const updatedTxList = Object.values(updatedTxs);
      if (updatedTxList.length) {
        yield put(actions.Bridge.addBridgeTx(updatedTxList));
      }
    } catch (error) {
      console.error("watchDepositConfirmation error")
      console.error(error)
    } finally {
      yield race({
        bridgeTxUpdated: take(actions.Bridge.BridgeActionTypes.ADD_BRIDGE_TXS),
        pollTimeout: delay(PollIntervals.BridgeDepositWatcher),
      });

      // if tx count === 0, stop polling
      const bridgeTxs = (yield select(getFilteredTx)) as BridgeTx[];
      if (!bridgeTxs.length) {
        yield take(actions.Bridge.BridgeActionTypes.ADD_BRIDGE_TXS);
      }
    }
  }
}

function* watchWithdrawConfirmation() {
  const getFilteredTx = makeTxFilter([Status.WithdrawTxStarted]);
  while (true) {
    try {
      // watch and update relevant txs
      const bridgeTxs = (yield select(getFilteredTx)) as BridgeTx[];
      const { network } = getBlockchain(yield select());
      logger("bridge saga", "watch withdraw confirmation", bridgeTxs.length);

      const updatedTxs: SimpleMap<BridgeTx> = {};
      const carbonNetwork = netZilToCarbon(network)
      for (const tx of bridgeTxs) {
        logger("bridge saga", "checking tx withdraw", tx.withdrawTxHash);
        try {
          const sdk = (yield CarbonSDK.instance({ network: carbonNetwork })) as CarbonSDK;
          const swthAddress = AddressUtils.SWTHAddress.generateAddress(tx.interimAddrMnemonics, undefined, { network: carbonNetwork });

          const queryOpts = Models.QueryGetExternalTransfersRequest.fromPartial({
            address: swthAddress,
            status: "success",
            blockchain: tx.dstChain,
            transferType: "withdrawal",
          });
          const result = (yield call([sdk.query.coin, sdk.query.coin.ExternalTransfers], queryOpts)) as Models.QueryGetExternalTransfersResponse;

          const withdrawTransfer = result.externalTransfers.find((transfer) => transfer.transferType === 'withdrawal' && transfer.blockchain === tx.dstChain);

          // update destination chain tx hash if success
          if (withdrawTransfer?.status === 'success') {
            tx.destinationTxHash = withdrawTransfer.transactionHash;
            updatedTxs[tx.sourceTxHash!] = tx;

            logger("bridge saga", "confirmed tx withdraw", tx.withdrawTxHash);
          }

          // possible extension: validate tx on dest chain
          // tx.destinationTxConfirmedAt = dstChainTx.blocktime
        } catch (error) {
          console.error('process withdraw tx error');
          console.error(error);
        }
      }

      // update redux updatedTxs
      const updatedTxList = Object.values(updatedTxs);
      if (updatedTxList.length) {
        yield put(actions.Bridge.addBridgeTx(updatedTxList));
      }
    } catch (error) {
      console.error("watchDepositConfirmation error")
      console.error(error)
    } finally {
      yield race({
        bridgeTxUpdated: take(actions.Bridge.BridgeActionTypes.ADD_BRIDGE_TXS),
        pollTimeout: delay(PollIntervals.BridgeWithdrawWatcher),
      });

      // if tx count === 0, stop polling
      const bridgeTxs = (yield select(getFilteredTx)) as BridgeTx[];
      if (!bridgeTxs.length) {
        yield take(actions.Bridge.BridgeActionTypes.ADD_BRIDGE_TXS);
      }
    }
  }
}

function* watchActiveTxConfirmations() {
  while (true) {
    logger("bridge saga", "query block confirmations");
    try {
      const { activeBridgeTx, previewBridgeTx } = getBridge(yield select());
      const { network } = getBlockchain(yield select());

      const bridgeTx = previewBridgeTx ?? activeBridgeTx; // previewTx will show on top of activeBridgeTx

      const requiredConfirmations = bridgeTx?.srcChain === Blockchain.Zilliqa ? BRIDGE_TX_DEPOSIT_CONFIRM_ZIL : BRIDGE_TX_DEPOSIT_CONFIRM_ETH;
      if (bridgeTx?.sourceTxHash && (bridgeTx.depositConfirmations ?? 0) <= requiredConfirmations) {
        try {
          switch (bridgeTx.srcChain) {
            case Blockchain.Zilliqa: {
              const zilswapSdk = ZilswapConnector.getSDK();
              const sourceTx: Transaction = yield zilswapSdk.zilliqa.blockchain.getTransaction(bridgeTx.sourceTxHash)
              if (sourceTx.blockConfirmation) {
                yield put(actions.Bridge.addBridgeTx([{
                  sourceTxHash: bridgeTx.sourceTxHash,
                  depositConfirmations: sourceTx.blockConfirmation,
                }]));
              }
              break;
            };
            case Blockchain.Ethereum: {
              const carbonNetwork = netZilToCarbon(network);
              const sdk: CarbonSDK = yield CarbonSDK.instance({ network: carbonNetwork });

              const sourceTx: EthTransactionResponse = yield sdk.eth.getProvider().getTransaction(bridgeTx.sourceTxHash);
              if (sourceTx.confirmations) {
                yield put(actions.Bridge.addBridgeTx([{
                  sourceTxHash: bridgeTx.sourceTxHash,
                  depositConfirmations: sourceTx.confirmations,
                }]));
              }
              break;
            };
          }
        } catch (error) {
          console.error("error retrieving carbon confirmation info");
          console.error(error);
        }
      }
    } catch (error) {
      console.error("watchActiveTxConfirmations error")
      console.error(error)
    } finally {
      yield delay(PollIntervals.BridgeDepositWatcher);
    }
  }
}

function* queryTokenFees() {
  let lastCheckedToken: BridgeableToken | undefined = undefined;
  while (true) {
    logger("bridge saga", "query withdraw fees");
    try {
      const { formState } = getBridge(yield select());
      const { network: zilNetwork } = getBlockchain(yield select());
      const bridgeToken = formState.token;
      const network = zilNetwork === Network.MainNet ? CarbonSDK.Network.MainNet : CarbonSDK.Network.DevNet;
      if (lastCheckedToken !== bridgeToken) {
        yield put(actions.Bridge.updateFee());
      }

      logger("bridge saga", lastCheckedToken?.toDenom, bridgeToken?.toDenom)
      if ((!lastCheckedToken || lastCheckedToken !== bridgeToken) && bridgeToken) {
        logger("bridge saga", "query", bridgeToken?.toDenom)
        const sdk = (yield CarbonSDK.instance({ network })) as CarbonSDK;
        yield call([sdk, sdk.initialize]);
        const carbonToken = Object.values(sdk.token.tokens).find(token => token.denom === bridgeToken.toDenom);

        if (!carbonToken) {
          throw new Error(`token not found ${bridgeToken.toDenom}`);
        }

        const retrievedFees = (yield call(Bridge.getEstimatedFees, { denom: carbonToken.denom, network: zilNetwork })) as FeesData | undefined;
        const feeEst = retrievedFees ?? { withdrawalFee: BIG_ONE.shiftedBy(3 - carbonToken.decimals.toInt()) }; // 1000 sat to bypass min fee check
        const price = bnOrZero(yield sdk.token.getUSDValue(carbonToken.denom));

        logger("bridge saga", "withdraw fees", carbonToken.denom, feeEst?.withdrawalFee?.toString(10), price.toString(10))

        yield put(actions.Bridge.updateFee({
          amount: new BigNumber(feeEst.withdrawalFee!).shiftedBy(-carbonToken!.decimals),
          value: new BigNumber(feeEst.withdrawalFee!).shiftedBy(-carbonToken!.decimals).times(price),
          token: carbonToken
        }));

        lastCheckedToken = bridgeToken;
      }

    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      yield race({
        delay: delay(PollIntervals.BridgeTokenFee),
        tokenUpdated: take(actions.Bridge.BridgeActionTypes.UPDATE_FORM),
      })
    }
  }
}

export default function* bridgeSaga() {
  logger("init bridge saga");
  yield fork(watchDepositConfirmation);
  yield fork(watchWithdrawConfirmation);
  yield fork(queryTokenFees);
  yield fork(watchActiveTxConfirmations);
}
