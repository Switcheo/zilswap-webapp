import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWalletBoltX,
  connectWalletPrivateKey,
  connectWalletZeeves,
  connectWalletZilPay,
  connectWalletZ3Wallet,
} from "core/wallet";
import { actions } from "app/store";
import { BlockchainState, RootState } from "app/store/types";
import { useAsyncTask, useNetwork } from "app/utils";
import { LocalStorageKeys } from "app/utils/constants";
import { logger } from "./logger";
import { getConnectedZeeves } from "./zeeves";
import { getConnectedZilPay } from "./zilpay";
import { getConnectedZ3Wallet } from "./z3wallet";
import { getConnectedBoltX } from "./boltx";

const privateKey = localStorage.getItem(LocalStorageKeys.PrivateKey);
const savedZilpay = localStorage.getItem(LocalStorageKeys.ZilPayConnected);
const savedZ3Wallet = localStorage.getItem(LocalStorageKeys.Z3WalletConnected);
const savedBoltX = localStorage.getItem(LocalStorageKeys.BoltXConnected);
const zeevesConnected = localStorage.getItem(LocalStorageKeys.ZeevesConnected);

/**
 * Mock component to initialize saved wallet on app load.
 */
export const AppButler: React.FC<{}> = (_props: {}) => {
  const network = useNetwork();
  const { ready } = useSelector<RootState, BlockchainState>(
    (state) => state.blockchain
  );
  const [runInitWallet] = useAsyncTask<void>("initWallet");
  const dispatch = useDispatch();

  const initWithPrivateKey = async (privateKey: string) => {
    logger("butler", "initWithPrivateKey");
    try {
      const walletResult = await connectWalletPrivateKey(privateKey);
      if (walletResult?.wallet) {
        const { wallet } = walletResult;
        dispatch(actions.Blockchain.initialize({ wallet, network }));
        return;
      }
    } catch (e) {
      console.error(e);
    }

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
          return;
        }
      }
    } catch (e) {}

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
          return;
        }
        console.warn("Failed to connect ZilPay!");
      }
      console.warn("Failed to get ZilPay!");
    } catch (e) {
      console.error(e);
    }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithZ3Wallet = async () => {
    logger("butler", "initWithZ3Wallet");
    try {
      const z3Wallet = await getConnectedZ3Wallet();
      if (z3Wallet) {
        const walletResult = await connectWalletZ3Wallet(z3Wallet);
        if (walletResult?.wallet) {
          const { wallet } = walletResult;
          const { network } = wallet;
          dispatch(actions.Blockchain.initialize({ wallet, network }));
          return;
        }
        console.warn("Failed to connect Z3Wallet!");
      }
      console.warn("Failed to get Z3Wallet!");
    } catch (e) {
      console.error(e);
    }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithBoltX = async () => {
    logger("butler", "initWithBoltX");
    try {
      const boltX = await getConnectedBoltX();
      if (boltX) {
        const walletResult = await connectWalletBoltX(boltX);
        if (walletResult?.wallet) {
          const { wallet } = walletResult;
          const { network } = wallet;
          dispatch(actions.Blockchain.initialize({ wallet, network }));
          return;
        }
        console.warn("Failed to connect BoltX!");
      }
      console.warn("Failed to get BoltX!");
    } catch (e) {
      console.error(e);
    }

    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  const initWithoutWallet = async () => {
    logger("butler", "initWithoutWallet");
    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
  };

  useEffect(() => {
    if (!ready) return;

    logger("butler init");

    runInitWallet(async () => {
      if (typeof privateKey === "string") {
        initWithPrivateKey(privateKey);
      } else if (savedZilpay === "true") {
        initWithZilPay();
      } else if (savedZ3Wallet === "true") {
        initWithZ3Wallet();
      } else if (savedBoltX === "true") {
        initWithBoltX();
      } else if (zeevesConnected === "true") {
        initWithZeeves();
      } else {
        initWithoutWallet();
      }
    });

    // eslint-disable-next-line
  }, [ready]);

  return null;
};
