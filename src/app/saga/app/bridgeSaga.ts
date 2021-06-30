import { actions } from "app/store";
import { BridgeTx, RootState } from "app/store/types";
import { SimpleMap } from "app/utils";
import { bnOrZero } from "app/utils/strings/strings";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import { logger, Bridge } from "core/utilities";
import { call, delay, fork, put, race, select, take, takeLatest } from "redux-saga/effects";
import { TradeHubSDK, ConnectedTradeHubSDK, RestModels, TradeHubTx, SWTHAddress, Blockchain } from "tradehub-api-js";
import dayjs from "dayjs";
import { PollIntervals } from "app/utils/constants";
import { BridgeActionTypes } from "app/store/bridge/actions";
import { FeesData } from "core/utilities/bridge";
import { getBridge, getTokens } from '../selectors'
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";

export enum Status {
  NotStarted,
  // DepositApproved,
  DepositTxStarted,
  DepositTxConfirmed,
  WithdrawTxStarted,
  WithdrawTxConfirmed,
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
  const getFilteredTx = makeTxFilter([Status.DepositTxStarted, Status.DepositTxConfirmed]);
  while (true) {
    try {
      // watch and update relevant txs
      const bridgeTxs = (yield select(getFilteredTx)) as BridgeTx[];
      logger("bridge saga", "watch deposit confirmation", bridgeTxs.length);

      const updatedTxs: SimpleMap<BridgeTx> = {};
      const network = TradeHubSDK.Network.DevNet
      for (const tx of bridgeTxs) {
        try {
          const sdk = new TradeHubSDK({ network });

          const swthAddress = SWTHAddress.generateAddress(tx.interimAddrMnemonics, undefined, { network });

          // check if deposit is confirmed
          if (!tx.depositTxConfirmedAt) {
            const extTransfers = (yield call([sdk.api, sdk.api.getTransfers], { account: swthAddress })) as RestModels.Transfer[];

            const depositTransfer = extTransfers.find((transfer) => transfer.transfer_type === 'deposit' && transfer.blockchain === tx.srcChain);

            if (depositTransfer?.status === 'success') {
              tx.depositTxConfirmedAt = dayjs();
              updatedTxs[tx.sourceTxHash!] = tx;

              logger("bridge saga", "confirmed tx deposit", tx.sourceTxHash);
            }
          }

          // trigger withdraw tx if deposit confirmed
          if (tx.depositTxConfirmedAt) {

            const connectedSDK = (yield call([sdk, sdk.connectWithMnemonic], tx.interimAddrMnemonics)) as ConnectedTradeHubSDK
            const balance = (yield call([sdk.api, sdk.api.getWalletBalance], { account: swthAddress })) as RestModels.Balances;

            const balanceDenom = tx.srcChain === Blockchain.Zilliqa ? tx.srcToken : tx.dstToken;

            logger("bridge saga", "detected balance to withdraw", balance, balanceDenom)
            const withdrawAmount = bnOrZero(balance?.[balanceDenom]?.available);
            if (withdrawAmount.isZero()) {
              throw new Error(`tradehub address balance not found`)
            }

            const withdrawResult = (yield call([connectedSDK.coin, connectedSDK.coin.withdraw], {
              amount: withdrawAmount.toString(10),
              denom: tx.dstToken,
              to_address: tx.dstAddr.toLowerCase().replace(/^0x/i, ""),
              fee_address: BridgeParamConstants.SWTH_FEE_ADDRESS,
              fee_amount: tx.withdrawFee.toString(10),
              originator: swthAddress,
            })) as TradeHubTx.TxResponse;

            tx.withdrawTxHash = withdrawResult.txhash;
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
      logger("bridge saga", "watch withdraw confirmation", bridgeTxs.length);

      const updatedTxs: SimpleMap<BridgeTx> = {};
      const network = TradeHubSDK.Network.DevNet;
      for (const tx of bridgeTxs) {
        logger("bridge saga", "checking tx withdraw", tx.withdrawTxHash);
        try {
          const sdk = new TradeHubSDK({ network });
          const swthAddress = SWTHAddress.generateAddress(tx.interimAddrMnemonics, undefined, { network });
          const extTransfers = (yield call([sdk.api, sdk.api.getTransfers], { account: swthAddress })) as RestModels.Transfer[];

          const withdrawTransfer = extTransfers.find((transfer) => transfer.transfer_type === 'withdrawal' && transfer.blockchain === tx.dstChain);

          // update destination chain tx hash if success
          if (withdrawTransfer?.status === 'success') {
            tx.destinationTxHash = withdrawTransfer.transaction_hash;
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
function* getFee() {
  try {
    const { formState, tokens: toke } = getBridge(yield select());
    const { tokens } = getTokens(yield select());
    const { token } = formState;
    const network = TradeHubSDK.Network.DevNet;
    if (token) {
      const { blockchain } = token;

      const denom = blockchain === Blockchain.Zilliqa ? token.toDenom : token.denom;

      let address = blockchain === Blockchain.Zilliqa ? token.toTokenAddress : token.tokenAddress;
      address = address.toLowerCase();
      if (blockchain === Blockchain.Zilliqa && !address.startsWith("zil")) {
        address = toBech32Address(address);
      } else if (blockchain === Blockchain.Ethereum && address.startsWith("zil")) {
        address = fromBech32Address(address);
      }

      if (blockchain === Blockchain.Ethereum && !address.startsWith("0x")) {
        address = `0x${address}`;
      }

      const feeToken = tokens[address];

      const swthAddrMnemonic = SWTHAddress.newMnemonic();
      const sdk = new TradeHubSDK({ network });
      (yield call([sdk, sdk.connectWithMnemonic], swthAddrMnemonic)) as ConnectedTradeHubSDK
      const prices = (yield sdk.token.reloadUSDValues([denom])) as SimpleMap<BigNumber>;
      const feeEst = (yield call(Bridge.getEstimatedFees, { denom })) as FeesData | undefined;
      if (feeEst && feeToken) {
        yield put(actions.Bridge.updateFee(new BigNumber(feeEst.withdrawalFee!).div(new BigNumber(10).pow(feeToken!.decimals)).times(prices[feeToken?.blockchain])));
      } else {
        yield put(actions.Bridge.updateFee(new BigNumber(0)));
      }
    }

  } catch (e) {
    console.warn('Fetch failed, will automatically retry later. Error:')
    console.warn(e)
  }
}

function* queryTokenFees() {
  while (true) {
    // logger("bridge saga", "query token fees");
    try {
      yield fork(getFee);

    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      yield delay(PollIntervals.BridgeTokenFee);
    }
  }
}


export default function* bridgeSaga() {
  logger("init bridge saga");
  yield fork(watchDepositConfirmation);
  yield fork(watchWithdrawConfirmation);
  yield fork(queryTokenFees);
  yield takeLatest(BridgeActionTypes.UPDATE_FORM, getFee)
}