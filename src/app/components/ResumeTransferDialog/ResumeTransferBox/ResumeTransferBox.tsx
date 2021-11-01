import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Grid, OutlinedInput, makeStyles } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import CheckCircleIcon from "@material-ui/icons/CheckCircleOutlineRounded";
import RefreshIcon from '@material-ui/icons/RefreshRounded';
import BigNumber from 'bignumber.js';
import cls from "classnames";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Blockchain, RestModels, SWTHAddress, TradeHubSDK } from "tradehub-api-js";
import Web3Modal from 'web3modal';
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ConnectedWallet } from "core/wallet";
import { Bridge } from "core/utilities";
import { providerOptions } from "core/ethereum";
import { ConnectButton } from "app/views/main/Bridge/components";
import { hexToRGBA, netZilToTradeHub, useAsyncTask, useNetwork } from "app/utils";
import { AppTheme } from "app/theme/types";
import { RootState } from "app/store/types";
import { BridgeState, BridgeTx, BridgeableTokenMapping } from "app/store/bridge/types";
import { actions } from "app/store";
import { ConnectETHPopper, Text } from 'app/components';

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.border,
        borderRight: theme.palette.border,
        borderBottom: theme.palette.border,
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(0, 7, 2),
        maxWidth: 510,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(0, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
        "& .MuiOutlinedInput-input": {
            padding: theme.spacing(1),
            fontSize: "16px",
            textAlign: "center"
        },
        "& .MuiButton-endIcon": {
            marginLeft: "6px"
        },
    },
    button: {
        borderRadius: 12,
        width: "32%",
        "& .MuiButton-text": {
            padding: "6px 16px"
        },
        border: "none",
        [theme.breakpoints.down("xs")]: {
            width: "auto",
        },
    },
    visibilityIcon: {
        color: theme.palette.label
    },
    warning: {
        color: theme.palette.warning.main
    },
    actionButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
        height: 46,
    },
    refreshIcon: {
        verticalAlign: "bottom",
        color: theme.palette.primary.light
    },
    warningLink: {
        color: theme.palette.warning.main,
        textDecoration: "underline"
    },
    inputWord: {
        height: 38,
        backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF",
        borderColor: "transparent",
        '&.Mui-focused': {
            borderColor: theme.palette.primary.dark,
            caretColor: theme.palette.primary.dark,
        },
        "&.Mui-disabled": {
            color: theme.palette.primary.dark
        }
    },
    connectButton: {
        marginTop: theme.spacing(1.5)
    },
    progress: {
        color: "rgba(255,255,255,.5)",
        marginRight: theme.spacing(1)
    },
    verified: {
        backgroundColor: "transparent",
        border: `1px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`,
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.2)}`
        },
        "&.Mui-disabled": {
            backgroundColor: "transparent",
        }
    },
    checkIcon: {
        color: theme.palette.primary.dark,
        verticalAlign: "text-top",
        marginTop: "1px",
        marginRight: theme.spacing(0.8),
        fontSize: "1.2rem"
    },
    clearAllButton: {
        padding: "inherit",
        minWidth: "auto",
        "&:hover": {
            backgroundColor: "transparent"
        }
    },
    step: {
        [theme.breakpoints.down("xs")]: {
            fontSize: "11px"
        },
    }
}));

const ResumeTransferBox = (props: any) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const network = useNetwork();
    const history = useHistory();
    const [showPhrase, setShowPhrase] = useState<boolean>(false);
    const [mnemonic, setMnemonic] = useState<Array<string>>(Array(12).fill(""));
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [swthAddress, setSwthAddress] = useState<string | null>(null);
    const bridgeableTokens = useSelector<RootState, BridgeableTokenMapping>(store => store.bridge.tokens);
    const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet); // zil wallet
    const bridgeWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets[Blockchain.Ethereum]); // eth wallet
    const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
    const pendingBridgeTx = bridgeState.activeBridgeTx;

    const [depositTransfer, setDepositTransfer] = useState<RestModels.Transfer | null>(null);
    const [sdk, setSdk] = useState<TradeHubSDK | null>(null);

    const [runGetTransfer, loading, error] = useAsyncTask("getTransfer");
    const [runResumeTransfer, loadingResume] = useAsyncTask("resumeTransfer", (error) => setErrorMsg(error?.message));
    const [showMenu, setShowMenu] = useState<MutableRefObject<undefined>>();

    const buttonRef = useRef();

    const isMnemonicFilled = useMemo(() => {
        return mnemonic.indexOf("") === -1;
    }, [mnemonic])

    useEffect(() => {
        const tradehubNetwork = netZilToTradeHub(network);
        const sdk = new TradeHubSDK({ network: tradehubNetwork });
        sdk.token.reloadTokens();
        setSdk(sdk);
    }, [network])

    const dstChain = useMemo(() => {
        if (depositTransfer) {
            return depositTransfer.blockchain === Blockchain.Zilliqa ? Blockchain.Ethereum : Blockchain.Zilliqa;
        }

        return null;
    }, [depositTransfer])

    const dstWalletAddr = useMemo(() => {
        if (dstChain) {
            if (dstChain === Blockchain.Zilliqa && wallet) {
                return wallet.addressInfo.byte20;
            }

            if (dstChain === Blockchain.Ethereum && bridgeWallet) {
                return bridgeWallet.address;
            }
        }

        return "";
    }, [dstChain, wallet, bridgeWallet])

    const handleShowPhrase = () => {
        setShowPhrase(!showPhrase);
    }

    // TODO: add validation to ensure only string input
    const handleWordChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const mnemonicCopy = mnemonic.slice();
        mnemonicCopy[index] = e.target.value;
        setMnemonic(mnemonicCopy);
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const mnemonic = e.clipboardData.getData("text").split(" ");

        if (mnemonic.length === 12) {
            setMnemonic(mnemonic);
        }
    }

    const handleClearAll = () => {
        setMnemonic(Array(12).fill(""));
        setDepositTransfer(null);
        setSwthAddress(null);
    }

    const handleGetTransfer = () => {
        runGetTransfer(async () => {
            if (!sdk) return;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mnemonicString = mnemonic.join(" ");
            const tradehubNetwork = sdk.network;
            const swthAddress = SWTHAddress.generateAddress(mnemonicString, undefined, { network: tradehubNetwork });

            // find deposit confirmation tx
            const extTransfers = await sdk.api.getTransfers({ account: swthAddress }) as RestModels.Transfer[];
            const depositTransfer = extTransfers.find((transfer) => transfer.transfer_type === 'deposit');

            if (depositTransfer) {
                setErrorMsg("");
                setDepositTransfer(depositTransfer);
                setSwthAddress(swthAddress);
            } else {
                setErrorMsg("Please enter a valid transfer key.");
                setDepositTransfer(null);
                setSwthAddress(swthAddress);
            }
        })
    }

    const handleResumeTransfer = () => {
        // tx found and status success - build bridgeTx
        if (depositTransfer && dstChain) {
            const srcChain = depositTransfer.blockchain as Blockchain.Zilliqa | Blockchain.Ethereum;
            const bridgeToken = bridgeableTokens[srcChain].find(token => token.denom === depositTransfer.denom);

            if (!bridgeToken || !sdk) return;
            runResumeTransfer(async () => {
                const fee = await Bridge.getEstimatedFees({ denom: bridgeToken.toDenom, network });
                if (!fee.withdrawalFee?.gt(0))
                    throw new Error("Could not retrieve withdraw fee");
                const decimals = sdk.token.getDecimals(bridgeToken.toDenom) ?? 0;
                const feeAmount = fee.withdrawalFee.shiftedBy(-decimals);

                if (new BigNumber(depositTransfer.amount).lt(feeAmount))
                    throw new Error("Transferred amount insufficient to pay for withdraw fees.");

                const bridgeTx: BridgeTx = {
                    srcChain,
                    dstChain,
                    srcAddr: "",
                    dstAddr: dstWalletAddr,
                    srcToken: depositTransfer.denom,
                    dstToken: bridgeToken.toDenom,
                    inputAmount: new BigNumber(depositTransfer.amount),
                    interimAddrMnemonics: mnemonic.join(" "),
                    withdrawFee: feeAmount, // need to check
                    sourceTxHash: depositTransfer.transaction_hash,
                    depositDispatchedAt: dayjs(),
                    network,
                }

                if (pendingBridgeTx) {
                    dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx));
                }

                dispatch(actions.Bridge.addBridgeTx([bridgeTx]));
                dispatch(actions.Layout.toggleShowResumeTransfer("close"));
                history.push('/bridge');
            });
        }
    }

    // TODO: option to change/disconnect wallet
    const onClickConnectETH = async () => {
        const web3Modal = new Web3Modal({
            cacheProvider: true,
            disableInjectedProvider: false,
            providerOptions
        });

        const provider = await web3Modal.connect();
        const ethersProvider = new ethers.providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner();
        const ethAddress = await signer.getAddress();
        const chainId = (await ethersProvider.getNetwork()).chainId;

        dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: { provider: provider, address: ethAddress, chainId: chainId } }));
    };

    const onClickConnectZIL = () => {
        dispatch(actions.Layout.toggleShowWallet());
    };

    const handleConnectWallet = () => {
        if (dstChain === Blockchain.Zilliqa) {
            return onClickConnectZIL();
        } else {
            if (bridgeWallet) {
                setShowMenu(buttonRef)
            } else {
                return onClickConnectETH();
            }
        }
    }

    const onDisconnectEthWallet = (clear?: boolean) => {
        const web3Modal = new Web3Modal({
            cacheProvider: true,
            disableInjectedProvider: false,
            network: "ropsten",
            providerOptions
        });
        if (clear) {
            web3Modal.clearCachedProvider();
        }
        setShowMenu(undefined)
        dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: null }));
    }

    const verifyButtonText = () => {
        if (depositTransfer) {
            return (
                <Text variant="h4">
                    <CheckCircleIcon className={classes.checkIcon} />
                    Transfer Key Verified
                    <Text variant="body2">{swthAddress}</Text>
                </Text>
            )
        } else {
            return loading
                ? "Verifying..."
                : "Verify Transfer Key"
        }
    }

    // Successful depositTx found
    const isConnectWalletEnabled = useMemo(() => {
        return !!depositTransfer;
    }, [depositTransfer])

    // Dst wallet connected
    const isResumeTransferEnabled = useMemo(() => {
        return !!dstWalletAddr;
    }, [dstWalletAddr])

    return (
        <Box overflow="auto" display="flex" flexDirection="column" className={classes.root}>
            <Text variant="h2" align="center">
                <RefreshIcon fontSize="large" className={classes.refreshIcon} />
                {" "}
                Resume Transfer
            </Text>

            <Text marginTop={2} marginBottom={2.5} variant="h6" align="center">
                Enter your transfer key and connect your wallet <br /> to resume your paused transfer.
            </Text>

            <Box display="flex" justifyContent="space-evenly" mb={1.5}>
                <Box flex={1} />

                <Box display="flex" justifyContent="center" flex={1}>
                    <Text className={classes.step}>
                        <strong>Step 1:</strong> Transfer Key
                    </Text>
                </Box>

                <Box display="flex" justifyContent="flex-end" flex={1}>
                    <Button className={classes.clearAllButton} onClick={handleClearAll} disableRipple>
                        <Text color="textSecondary">
                            Clear All
                        </Text>
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={1}>
                {mnemonic.map((word: string, index) => (
                    <Grid item xs={4}>
                        <OutlinedInput
                            className={classes.inputWord}
                            disabled={!!depositTransfer}
                            value={word}
                            onChange={handleWordChange(index)}
                            onPaste={index === 0 ? handlePaste : () => { }}
                            type={showPhrase ? 'text' : 'password'}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box display="flex" justifyContent="center" mt={1}>
                <Button
                    onClick={handleShowPhrase}
                    className={classes.button}
                    variant="outlined"
                    endIcon={showPhrase ? <VisibilityOff className={classes.visibilityIcon} /> : <Visibility className={classes.visibilityIcon} />}
                    focusRipple={false}
                    disableRipple
                >
                    <Text>{showPhrase ? "Hide Phrase" : "Show Phrase"}</Text>
                </Button>
            </Box>

            <Box>
                <Button
                    onClick={handleGetTransfer}
                    variant="contained"
                    color="primary"
                    className={cls(classes.actionButton, { [classes.verified]: !!depositTransfer })}
                    disabled={!isMnemonicFilled || loading || !!depositTransfer}
                    fullWidth
                >
                    {loading && <CircularProgress size={20} className={classes.progress} />}
                    {verifyButtonText()}
                </Button>
            </Box>

            {(errorMsg || error) &&
                <Box display="flex" flexDirection="column" justifyContent="center" mb={0.5}>
                    <Text color="error" variant="body1">
                        <strong>Error:</strong> {errorMsg ?? error?.message ?? "Please enter a valid transfer key."}
                    </Text>
                    {swthAddress && !depositTransfer && (
                        <Text color="error" variant="body2" marginTop={0.5}>No transactions found for Carbon address: {swthAddress}.</Text>
                    )}
                </Box>
            }

            <Box mt={1} mb={.5} display="flex" flexDirection="column">
                <Text align="center" className={classes.step}>
                    <strong>Step 2:</strong> Destination Wallet Address
                </Text>

                <ConnectButton buttonRef={buttonRef} address={dstWalletAddr} chain={dstChain} className={classes.connectButton} onClick={handleConnectWallet} disabled={!isConnectWalletEnabled} />
            </Box>

            <Box mt={1}>
                <Button
                    onClick={handleResumeTransfer}
                    variant="contained"
                    color="primary"
                    className={classes.actionButton}
                    disabled={!isResumeTransferEnabled}
                    fullWidth
                >
                    {loadingResume && <CircularProgress size={20} className={classes.progress} />}
                    Resume Transfer
                </Button>
            </Box>
            <ConnectETHPopper
                open={!!showMenu?.current}
                anchorEl={showMenu?.current}
                onClickaway={() => setShowMenu(undefined)}
                onDisconnectEth={() => onDisconnectEthWallet()}
                onChangeWallet={() => { onDisconnectEthWallet(true); onClickConnectETH() }}
            >
            </ConnectETHPopper>
        </Box>
    )
}

export default ResumeTransferBox;
