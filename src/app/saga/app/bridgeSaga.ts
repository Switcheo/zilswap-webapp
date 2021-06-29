import { actions } from "app/store";
import { BridgeTx, RootState } from "app/store/types";
import { SimpleMap } from "app/utils";
import { bnOrZero } from "app/utils/strings/strings";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import { logger } from "core/utilities";
import { call, delay, fork, race, select, take } from "redux-saga/effects";
import { TradeHubSDK, ConnectedTradeHubSDK, RestModels, TradeHubTx, SWTHAddress, Blockchain } from "tradehub-api-js";
import dayjs from "dayjs";
import { PollIntervals } from "app/utils/constants";

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

            logger("bridge saga", "initiated tx withdraw", tx.sourceTxHash);
          }
        } catch (error) {
          console.error('process deposit tx error');
          console.error(error);
        }
      }

      // update redux updatedTxs
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
        logger("bridge saga", "checking tx withdraw", tx.sourceTxHash);
        try {
          const sdk = new TradeHubSDK({ network });
          const swthAddress = SWTHAddress.generateAddress(tx.interimAddrMnemonics, undefined, { network });
          const extTransfers = (yield call([sdk.api, sdk.api.getTransfers], { account: swthAddress })) as RestModels.Transfer[];

          const withdrawTransfer = extTransfers.find((transfer) => transfer.transfer_type === 'withdrawal' && transfer.blockchain === tx.dstChain);

          // update destination chain tx hash if success
          if (withdrawTransfer?.status === 'success') {
            tx.destinationTxHash = withdrawTransfer.transaction_hash;
            updatedTxs[tx.sourceTxHash!] = tx;

            logger("bridge saga", "confirmed tx withdraw", tx.sourceTxHash);
          }

          // possible extension: validate tx on dest chain 
          // tx.destinationTxConfirmedAt = dstChainTx.blocktime
        } catch (error) {
          console.error('process withdraw tx error');
          console.error(error);
        }
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

export default function* bridgeSaga() {
  logger("init bridge saga");
  yield fork(watchDepositConfirmation);
  yield fork(watchWithdrawConfirmation);
}
