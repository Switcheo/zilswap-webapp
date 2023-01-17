import React, { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { Blockchain } from "carbon-js-sdk";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { useNetwork } from "app/utils";
import { AppTheme } from "app/theme/types";
import { RootState } from "app/store/types";
import { actions } from "app/store";
import { DialogModal } from "app/components";
import NetworkSwitchBox from "./NetworkSwitchBox";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
}));

const NetworkSwitchDialog = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();
    const network = useNetwork();
    const dispatch = useDispatch();
    const showNetworkSwitchDialog = useSelector<RootState, boolean>(state => state.layout.showNetworkSwitchDialog);
    const zilWallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
    const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets[Blockchain.Ethereum]);
    const srcChain = useSelector<RootState, Blockchain>(state => state.bridge.formState.fromBlockchain);

    const isMainNet = useMemo(() => {
      if (srcChain === Blockchain.Ethereum) {
        if (Number(ethWallet?.chainId) === 5) return false;
        // set to mainnet even if currently set to some random net
        return true;
      } else if (srcChain === Blockchain.Arbitrum) {
        if (Number(ethWallet?.chainId) === 5) return false;
        // set to mainnet even if currently set to some random net
        return true;
      } else if (srcChain === Blockchain.Zilliqa) {
        return network === Network.MainNet
      }
    }, [ethWallet?.chainId, network, srcChain])

    const [requiredChainName, requiredChainID, walletToChange, currentChainName] = useMemo(() => {
      const getEthChainName = (chainId: number) => {
        switch (chainId) {
          case 1: return 'Ethereum Network'
          case 5: return 'Goerli Test Network'
          case 42161: return 'Arbitrum One Network'
          default: return 'Unknown Network'
        }
      }
      const getEthWalletName = () => {
        if (ethWallet?.provider.isBoltX) {
            return 'BoltX';
        } else if (ethWallet?.provider.isMetamask) {
            return 'Metamask';
        }
        return 'Your Wallet';
      }

      const getZilWalletName = () => {
        switch (zilWallet?.type) {
          case WalletConnectType.Zeeves: return "Zeeves Wallet";
          case WalletConnectType.ZilPay: return "ZilPay";
          case WalletConnectType.BoltX: return "BoltX";
          default: return "Your Wallet";
        }
      }

      if (!ethWallet || !zilWallet) {
        return [null, null, null, null]
      }

      const ethChainID = Number(ethWallet?.chainId)
      if (isMainNet) {
        if (ethChainID !== 1 && srcChain === Blockchain.Ethereum) {
          dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
          return [getEthChainName(1), `0x${(1).toString(16)}`, getEthWalletName(), getEthChainName(ethChainID)]
        } else if (ethChainID !== 42161 && srcChain === Blockchain.Arbitrum) {
          dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
          return [getEthChainName(42161), `0x${(42161).toString(16)}`, getEthWalletName(), getEthChainName(ethChainID)]
        } else if (zilWallet?.network !== Network.MainNet) {
          dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
          return ['Zilliqa MainNet', null, getZilWalletName(), 'Zilliqa TestNet']
        }
      } else {
        if (ethChainID !== 5) {
          dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
          return [getEthChainName(5), '0x5', getEthWalletName(), getEthChainName(ethChainID)]
        } else if (zilWallet?.network !== Network.TestNet) {
          dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
          return ['Zilliqa TestNet', null, getZilWalletName(), 'Zilliqa MainNet']
        }
      }
      return [null, null, null, null]
    }, [dispatch, ethWallet, zilWallet, isMainNet, srcChain])

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowNetworkSwitch("close"));
    };

    return (
        <DialogModal
            open={showNetworkSwitchDialog}
            onClose={onCloseDialog}
            {...rest}
            className={cls(classes.root, className)}
        >
            <NetworkSwitchBox ethWallet={ethWallet} requiredChainName={requiredChainName} requiredChainID={requiredChainID} walletToChange={walletToChange} currentChainName={currentChainName} />
        </DialogModal>
    )
}

export default NetworkSwitchDialog;
