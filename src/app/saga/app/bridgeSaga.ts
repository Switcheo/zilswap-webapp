import { actions } from "app/store";
import { BridgeTx, RootState } from "app/store/types";
import { logger } from "core/utilities";
import { fork, race, select, take } from "redux-saga/effects";

export enum Status {
  NotStarted,
  // DepositApproved,
  DepositTxStarted,
  DepositTxConfirmed,
  WithdrawTxStarted,
  WithdrawTxConfirmed,
}

function getBridgeTxStatus(tx: BridgeTx): Status {
  if (tx.destinationTxConfirmedAt) {
    return Status.WithdrawTxConfirmed;
  }

  if (tx.withdrawTxHash) {
    return Status.WithdrawTxStarted;
  }

  if (tx.depositTxHash) {
    return Status.DepositTxConfirmed;
  }

  if (tx.sourceTxHash) {
    return Status.DepositTxStarted;
  }

  return Status.NotStarted;
}

function* watchDepositConfirmation() {
  while (true) {
    try {

    } catch (error) {
      console.error("watchDepositConfirmation error")
      console.error(error)
    } finally {
      yield race({
        bridgeTxUpdated: take(actions.Bridge.addBridgeTx),
      });
    }
  }
}
function* watchWithdrawConfirmation() {
  while (true) {
    try {
      const bridgeTxs = (yield select((state: RootState) => state.bridge.bridgeTxs)) as BridgeTx[];
      
    } catch (error) {
      console.error("watchDepositConfirmation error")
      console.error(error)
    } finally {
      yield race({
        bridgeTxUpdated: take(actions.Bridge.addBridgeTx),
      });
    }
  }
}

export default function* bridgeSaga() {
  logger("init bridge saga");
  yield fork(watchDepositConfirmation);
  yield fork(watchWithdrawConfirmation);
}
