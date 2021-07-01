import { actions } from "app/store";
import { BridgeableToken, BridgeTx, RootState } from "app/store/types";
import { SimpleMap } from "app/utils";
import { PollIntervals } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import { Bridge, logger } from "core/utilities";
import { FeesData } from "core/utilities/bridge";
import dayjs from "dayjs";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { Blockchain, ConnectedTradeHubSDK, RestModels, SWTHAddress, TradeHubSDK, TradeHubTx } from "tradehub-api-js";
import { getBridge } from '../selectors';

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

function* queryTokenFees() {
  let lastCheckedToken: BridgeableToken | undefined = undefined;
  while (true) {
    logger("bridge saga", "query withdraw fees");
    try {
      const { formState } = getBridge(yield select());
      const bridgeToken = formState.token;
      const network = TradeHubSDK.Network.DevNet;
      if ((!lastCheckedToken || lastCheckedToken !== bridgeToken) && bridgeToken) {
        const sdk = new TradeHubSDK({ network });
        yield call([sdk, sdk.initialize]);
        const tradehubToken = Object.values(sdk.token.tokens).find(token => token.denom === bridgeToken.toDenom);

        if (!tradehubToken) {
          throw new Error(`token not found ${bridgeToken.toDenom}`);
        }
  
        const feeEst = (yield call(Bridge.getEstimatedFees, { denom: tradehubToken.denom })) as FeesData | undefined;
        const price = bnOrZero(yield sdk.token.getUSDValue(tradehubToken.denom))
  
        logger("bridge saga", "withdraw fees", tradehubToken.denom, feeEst?.withdrawalFee?.toString(10), price.toString(10))
        if (feeEst && tradehubToken) {
          yield put(actions.Bridge.updateFee({
            amount: new BigNumber(feeEst.withdrawalFee!).shiftedBy(-tradehubToken!.decimals),
            value: new BigNumber(feeEst.withdrawalFee!).shiftedBy(-tradehubToken!.decimals).times(price),
            token: tradehubToken
          }));
        } else {
          yield put(actions.Bridge.updateFee({
            amount: new BigNumber(0),
            value: new BigNumber(0),
            token: undefined
          }));
        }

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
}
