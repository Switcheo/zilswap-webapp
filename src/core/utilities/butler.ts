import { actions } from "app/store";
import { useAsyncTask, useNetwork } from "app/utils";
import {
  LocalStorageKeys,
} from "app/utils/constants";
import {
  connectWalletPrivateKey, connectWalletZeeves,
  connectWalletZilPay,
} from "core/wallet";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logger } from "./logger";
import { getConnectedZilPay } from "./zilpay";
import {getConnectedZeeves} from "./zeeves";

/**
 * Component constructor properties for {@link AppButler}
 *
 */
export type AppButlerProps = {};

/**
 * Mock component to initialize saved wallet on app load.
 */
export const AppButler: React.FC<AppButlerProps> = (_props: AppButlerProps) => {
  const network = useNetwork();
  const [runInitWallet] = useAsyncTask<void>("initWallet");
  const dispatch = useDispatch();


  const initWithPrivateKey = async (privateKey: string) => {
    logger("butler", "initWithPrivateKey");
    try {
      const walletResult = await connectWalletPrivateKey(privateKey);
      if (walletResult?.wallet) {
        const { wallet } = walletResult;
        dispatch(actions.Blockchain.initialize({ wallet, network }));
        return
      }
    } catch (e) { }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithZeeves = async () => {
    logger("butler", "initWithZeeves");
    try {
      const zeeves = await getConnectedZeeves();
      if (zeeves) {
        const walletInfo = await connectWalletZeeves(zeeves);
        if (walletInfo?.wallet) {
          const { wallet } = walletInfo;
          const { network } = wallet;
          dispatch(actions.Blockchain.initialize({ wallet, network }));
          return
        }
      }
    } catch (e) { }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithZilPay = async () => {
    logger("butler", "initWithZilPay");
    try {
      const zilPay = await getConnectedZilPay();
      if (zilPay) {
        const walletResult = await connectWalletZilPay(zilPay);
        if (walletResult?.wallet) {
          const { wallet } = walletResult;
          const { network } = wallet;
          dispatch(actions.Blockchain.initialize({ wallet, network }));
          return
        }
      }
    } catch (e) { }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithoutWallet = async () => {
    logger("butler", "initWithoutWallet");
    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };


  useEffect(() => {
    logger("butler mount");

    const privateKey = localStorage.getItem(LocalStorageKeys.PrivateKey);
    const savedZilpay = localStorage.getItem(LocalStorageKeys.ZilPayConnected);
    const zeevesConnected = localStorage.getItem(LocalStorageKeys.ZeevesConnected);

    runInitWallet(async () => {
      if (typeof privateKey === "string") {
        initWithPrivateKey(privateKey);
      } else if (savedZilpay === "true") {
        initWithZilPay();
      } else if (zeevesConnected === 'true') {
        initWithZeeves();
      } else {
        initWithoutWallet();
      }
    });

    // eslint-disable-next-line
  }, []);

  return null;
};
