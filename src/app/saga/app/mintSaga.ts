import { call, delay, fork, put, select, race, take } from "redux-saga/effects";
import dayjs from "dayjs";
import { ArkClient, logger } from "core/utilities";
import { actions } from "app/store";
import { PollIntervals } from "app/utils/constants";
import { getBlockchain, getMarketplace, getMint, getWallet } from "../selectors";

function* pollMintStatus() {
  while (true) {
    logger("mint saga", "poll mint status");
    try {
      const { activeMintContract } = getMint(yield select());

      if (activeMintContract) {
        const { wallet } = getWallet(yield select());
        const { network } = getBlockchain(yield select());
        let { oAuth } = getMarketplace(yield select());
        let newOAuth = oAuth;
    
        const arkClient = new ArkClient(network);
        if (!wallet) throw new Error("invalid wallet");
        
        if (!newOAuth?.access_token || (newOAuth?.expires_at && dayjs(newOAuth.expires_at * 1000).isBefore(dayjs()))) {
          const { result } = (yield call(arkClient.arkLogin, wallet!, window.location.hostname));
          yield put(actions.MarketPlace.updateAccessToken(result));
          newOAuth = result;
        }
    
        const { result } = (yield call(arkClient.mintDetail, activeMintContract.id, newOAuth?.access_token as string));

        logger("mint result: ", result);

        if (result?.mint) yield put(actions.Mint.updateMintContract(result.mint));
      }
    } catch (error) {
      console.error("poll mint status failed, Error:")
      console.error(error)
    } finally {
      yield race({
        delay: delay(PollIntervals.MintPollStatus),
        mintContractUpdated: take(actions.Mint.MintActionTypes.UPDATE_MINT_CONTRACT),
      })
    }
  }
}

export default function* mintSaga() {
  logger("init mint saga");
  yield fork(pollMintStatus);
}
  