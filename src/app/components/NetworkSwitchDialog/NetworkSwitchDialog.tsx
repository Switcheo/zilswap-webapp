import { makeStyles } from "@material-ui/core";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useNetwork } from "app/utils";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { Network } from "zilswap-sdk/lib/constants";
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
    const [chainName, setChainName] = useState<string>('');
    const showNetworkSwitchDialog = useSelector<RootState, boolean>(state => state.layout.showNetworkSwitchDialog);
    const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet); // zil wallet
    const bridgeWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets[Blockchain.Ethereum]); // eth wallet
    const isWalletTestNet = useMemo(() => {
        if (wallet?.network) {
            return wallet.network === Network.TestNet;
        }

        return true;
    }, [wallet]);

    useEffect(() => {
        if (bridgeWallet && Number(bridgeWallet.chainId) !== 3) {
            getChainName();
            dispatch(actions.Layout.toggleShowNetworkSwitch("open"));
        }

        // eslint-disable-next-line
    }, [bridgeWallet]);

    useEffect(() => {
        if (wallet && network !== Network.TestNet) {
            setChainName('');
            dispatch(actions.Layout.toggleShowNetworkSwitch("open"));
        }
    
        // eslint-disable-next-line
    }, [network, isWalletTestNet, window.location.pathname]);

    const getChainName = async () => {
        const response = await fetch("https://chainid.network/chains.json");
        const data = await response.json();
        const chain = data.filter((obj: any) => obj.chainId === Number(bridgeWallet?.chainId));
        setChainName(chain[0]?.name);
    }

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
            <NetworkSwitchBox chainName={chainName} network={network} />
        </DialogModal>
    )
}

export default NetworkSwitchDialog;
