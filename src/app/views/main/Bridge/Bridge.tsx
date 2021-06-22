/* eslint-disable @typescript-eslint/no-unused-vars */
// temp lint override to allow staging deployment for WIP file
import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Wallet } from '@zilliqa-js/account';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { ConfirmTransfer, CurrencyInput, FancyButton, Text } from 'app/components';
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import MainCard from 'app/layouts/MainCard';
import { actions } from "app/store";
import { BridgeFormState } from 'app/store/bridge/types';
import { LayoutState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useNetwork } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/constants";
import BigNumber from 'bignumber.js';
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZILClient, ZILClientOpts } from 'tradehub-api-js';
import { ApproveZRC2Params, ZILLockParams } from 'tradehub-api-js/build/main/lib/tradehub/clients';
import { Blockchain, Network, NetworkConfigProvider, NetworkConfigs, SWTHAddress } from 'tradehub-api-js/build/main/lib/tradehub/utils';
import { ZILLockToken } from './components/tokens';

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {},
    container: {
        padding: theme.spacing(4, 4, 0),
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(2, 2, 0),
        },
        marginBottom: 12
    },
    actionButton: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
        height: 46
    },
    connectWalletButton: {
        marginTop: theme.spacing(2),
        height: 46,
    },
    connectedWalletButton: {
        backgroundColor: "transparent",
        border: `1px solid ${theme.palette.currencyInput}`,
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.2)}`
        }
    },
    textColoured: {
        color: theme.palette.primary.dark
    },
    textSpacing: {
        letterSpacing: "0.5px"
    },
    box: {
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "#D2E5DF"}`,
        borderRadius: 12,
        padding: theme.spacing(1)
    },
    dotIcon: {
        marginRight: theme.spacing(1)
      }
}))

const initialFormState = {
    zilPrivateKey: '',
    swthAddress: '',
    sourceAddress: '',
    destAddress: '',
    transferAmount: '0'
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();

    const dispatch = useDispatch();
    const network = useNetwork();

    const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
    const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
    const tokenState = useSelector<RootState, TokenState>(store => store.token);
    const bridgeFormState: BridgeFormState = useSelector<RootState, BridgeFormState>(store => store.bridge);
    const layoutState = useSelector<RootState, LayoutState>(store => store.layout);

    const onPrivateKeyChange = (key: string = "") => {
        setFormState({
            ...formState,
            zilPrivateKey: key,
        });
    }

    const onSourceAddressChange = (address: string = "") => {
        setFormState({
            ...formState,
            sourceAddress: address,
        });
    }

    const onDestAddressChange = (address: string = "") => {
        setFormState({
            ...formState,
            destAddress: address,
        });
    }

    const onExecute = async () => {
        console.log("bridge execute");
        console.log("source address: %o\n", formState.sourceAddress);
        console.log("dest address: %o\n", formState.destAddress);

        const polynetConfig = NetworkConfigs[Network.DevNet];

        const polynetConfigProvider: NetworkConfigProvider = {
            getConfig: () => polynetConfig
        }

        const options: ZILClientOpts = {
            configProvider: polynetConfigProvider,
            blockchain: Blockchain.Zilliqa,
        }

        const tradehubZILClient = ZILClient.instance(options);

        const zilliqa = new Zilliqa(tradehubZILClient.getProviderUrl())
        const wallet  = new Wallet(zilliqa.network.provider)
        wallet.addByPrivateKey(formState.zilPrivateKey)

        const approveZRC2Params: ApproveZRC2Params = {
            token: ZILLockToken,
            gasPrice: new BigNumber("2000000000"),
            gasLimit : new BigNumber(25000),
            zilAddress: formState.sourceAddress,
            signer: wallet
        }

        console.log("approve zrc2 token params: %o\n", approveZRC2Params);

        const approve_tx = await tradehubZILClient.approveZRC2(approveZRC2Params);
        console.log(approve_tx);

        const lockDepositParams: ZILLockParams = {
            address: SWTHAddress.getAddressBytes("swth1pacamg4ey0nx6mrhr7qyhfj0g3pw359cnjyv6d", Network.DevNet),
            amount: new BigNumber("1000000000000"),
            token: ZILLockToken,
            gasPrice: new BigNumber("2000000000"),
            zilAddress: formState.sourceAddress,
            gasLimit: new BigNumber(25000),
            signer: wallet,
        }

        const lock_tx = await tradehubZILClient.lockDeposit(lockDepositParams)
        console.log(lock_tx);
    }

    const onConnectWallet = () => {
        dispatch(actions.Layout.toggleShowWallet());
    };

    const onClickConnect = async () => {
        try {
            const ethereum = (window as any).ethereum;
            const metamask = await ethereum.request({ method: 'eth_requestAccounts' });
            setFormState({
                ...formState,
                sourceAddress: metamask[0]
            })
            dispatch(actions.Bridge.update({
                sourceAddress: metamask[0]
            }))
        } catch (error) {
            console.error(error);
        }
    };

    const onTransferAmountChange = (amount: string = "0") => {
        let transferAmount = new BigNumber(amount);
        if (transferAmount.isNaN() || transferAmount.isNegative() || !transferAmount.isFinite()) transferAmount = BIG_ZERO;
        
        setFormState({
            ...formState,
            transferAmount: transferAmount.toString()
        })

        dispatch(actions.Bridge.update({
            forNetwork: network,
            token: tokenState.tokens[ZIL_TOKEN_NAME],
            transferAmount
        }));
    }

    const onCurrencyChange = (token: TokenInfo) => {
        if (bridgeFormState.token === token) return;
    
        dispatch(actions.Bridge.update({
          forNetwork: network,
          token
        }));
    };
    
    const showTransfer = () => {
        dispatch(actions.Layout.showTransferConfirmation(!layoutState.showTransferConfirmation))
    }

    return (
        <MainCard {...rest} className={cls(classes.root, className)}>
            {!layoutState.showTransferConfirmation && (
                <Box display="flex" flexDirection="column" className={classes.container}>
                    <Text variant="h2" align="center" marginTop={2}>
                        ZilSwap
                        <span className={classes.textColoured}>Bridge</span>
                    </Text>
                    <Text margin={1} align="center" color="textSecondary" className={classes.textSpacing}>Powered by Switcheo TradeHub</Text>
                    <Box mt={2} mb={2} display="flex" justifyContent="space-between">
                        <Box className={classes.box} flex={1} bgcolor="background.contrast">
                            <Text variant="h4" align="center">From</Text>
                            <Button
                                onClick={onClickConnect}
                                className={cls(classes.connectWalletButton, formState.sourceAddress ? classes.connectedWalletButton : "")}
                                variant="contained"
                                color="primary">
                                {!formState.sourceAddress 
                                    ? "Connect Wallet"
                                    : <Box display="flex" flexDirection="column">
                                        <Text variant="button">{truncate(formState.sourceAddress, 5, 4)}</Text>
                                        <Text color="textSecondary"><DotIcon className={classes.dotIcon}/>Connected</Text>
                                    </Box>
                                }
                            </Button>
                        </Box>
                        <Box flex={0.2}></Box>
                        <Box className={classes.box} flex={1} bgcolor="background.contrast">
                            <Text variant="h4" align="center">To</Text>
                            <FancyButton walletRequired
                                className={cls(classes.connectWalletButton, !!wallet ? classes.connectedWalletButton : "")}
                                variant="contained"
                                color="primary"
                                onClick={onConnectWallet}>
                                <Box display="flex" flexDirection="column">
                                    <Text variant="button">{truncate(wallet?.addressInfo.bech32, 5, 4)}</Text>
                                    <Text color="textSecondary"><DotIcon className={classes.dotIcon}/>Connected</Text>
                                </Box>
                            </FancyButton>
                        </Box>
                    </Box>

                    <CurrencyInput 
                        label="Transfer Amount"
                        disabled={!wallet || !formState.sourceAddress}
                        token={tokenState.tokens[ZIL_TOKEN_NAME]}
                        amount={formState.transferAmount}
                        onAmountChange={onTransferAmountChange} />

                    <Button 
                        onClick={showTransfer}
                        disabled={!wallet || !formState.sourceAddress || formState.transferAmount === "0" || formState.transferAmount === ""}
                        className={classes.actionButton} 
                        color="primary" 
                        variant="contained">
                        { !wallet && !formState.sourceAddress 
                            ? "Connect Wallet"
                            : formState.transferAmount === "0" || formState.transferAmount === ""
                                ? "Enter Amount"
                                : "Head to Confirmation"
                        }
                    </Button>

                    {/* <TextInput 
                        label="Zilliqa Private Key (Wallet)" 
                        placeholder="e.g. 1ab23..."
                        text={formState.zilPrivateKey}
                        onInputChange={onPrivateKeyChange} />
                    <TextInput 
                        label="Zilliqa Address (Source)" 
                        placeholder="e.g. zil1xxxx..."
                        text={formState.destAddress}
                        onInputChange={onSourceAddressChange} />
                    <TextInput 
                        label="Ethereum Address (Destination)" 
                        placeholder="e.g. 0x91a23ab..."
                        text={formState.sourceAddress}
                        onInputChange={onDestAddressChange} />
                    <FancyButton
                        className={classes.actionButton}
                        variant="contained"
                        color="primary"
                        onClick={onExecute}>
                        Execute
                    </FancyButton> */}
                </Box>
            )}
            <ConfirmTransfer showTransfer={layoutState.showTransferConfirmation} />
        </MainCard>
    )
}

export default BridgeView
