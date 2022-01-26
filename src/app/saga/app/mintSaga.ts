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
    
        const arkClient = new ArkClient(network);
        if (!wallet) throw new Error("invalid wallet");
        
        // need to check
        const accessTokenValid = oAuth?.expires_at && dayjs.unix(oAuth.expires_at).isAfter(dayjs().add(30, "second"));
        if (wallet.addressInfo.bech32 !== oAuth?.address || !accessTokenValid)
          oAuth = undefined;
    
        const { result: { mint } } = (yield call(arkClient.mintDetail, activeMintContract.id, oAuth?.access_token as string));

        yield put(actions.Mint.updateMintContract(mint));
      }
    } catch (error) {
      console.error("poll mint status failed, Error:")
      console.error(error)
    } finally {
      yield race({
        delay: delay(PollIntervals.MintPollStatus),
        mintContractUpdated: take(actions.Mint.MintActionTypes.UPDATE_MINT_CONTRACT),
      })

      // need to check
      const { activeMintContract } = getMint(yield select());
      if (!activeMintContract || activeMintContract.status === "completed") {
        yield take(actions.Mint.MintActionTypes.UPDATE_MINT_CONTRACT);
      }
    }
  }
}

export default function* mintSaga() {
  logger("init mint saga");
  yield fork(pollMintStatus);
}
  