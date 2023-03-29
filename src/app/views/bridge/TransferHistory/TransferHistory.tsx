import React, { Fragment, useMemo, useState } from "react";
import { Box, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import AddIcon from '@material-ui/icons/AddRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import RefreshIcon from '@material-ui/icons/RefreshRounded';
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Blockchain } from "carbon-js-sdk";
import { BridgeMobileDialog, CurrencyLogo, HelpInfo, ResumeTransferDialog, RevealMnemonic, Text } from 'app/components';
import BridgeCard from "app/layouts/BridgeCard";
import { actions } from "app/store";
import { BridgeState, BridgeTx, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { CHAIN_NAMES, hexToRGBA, useBridgeableTokenFinder } from "app/utils";
import { toHumanNumber } from "app/utils";
import TransactionDetail from "app/views/bridge/TransactionDetail";
import ChainLogo from 'app/views/main/Bridge/components/ChainLogo/ChainLogo'


// TODO: remove any, type the props properly
const TransferHistory = (props: any) => {
    const { className, ...rest } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const bridgeableTokenFinder = useBridgeableTokenFinder();

    const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
    const previewTx = useSelector<RootState, BridgeTx | undefined>(state => state.bridge.previewBridgeTx);
    const bridgeTxs = bridgeState.bridgeTxs;
    const pendingBridgeTx = bridgeState.activeBridgeTx;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    // prevent disabling for users resizing on desktop
    const disableButton = useMemo(() => {
        return isMobile;

        // eslint-disable-next-line
    }, []);

    const [showMobileDialog, setShowMobileDialog] = useState<boolean>(isMobile);

    const handleNewTransfer = () => {
        if (pendingBridgeTx) {
            dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx));
        }
        dispatch(actions.Layout.showTransferConfirmation(false));
    }

    const handleResumeTransfer = () => {
        dispatch(actions.Layout.toggleShowResumeTransfer("open"));
    }

    const getTransferStage = (tx: BridgeTx) => {
        if (tx?.withdrawTxHash) {
            return "Stage 3.1"
        }

        if (tx?.depositTxConfirmedAt) {
            return "Stage 2.2"
        }

        if (tx?.sourceTxHash) {
            return "Stage 2.1"
        }

        return "Stage 1.2"
    }

    const getTransferStatus = (tx: BridgeTx) => {
        // Failed tx
        if (tx?.depositFailedAt) {
            return (
                <Chip
                    className={cls(classes.chip, classes.failedChip)}
                    label={
                        <Fragment>
                            <Typography align="center"><strong>Failed</strong></Typography>
                            <Typography align="center" variant="body1">{getTransferStage(tx)}</Typography>
                        </Fragment>
                    }
                />
            )
        }

        // Completed tx
        if (tx?.destinationTxHash) {
            return (
                <Chip
                    className={cls(classes.chip, classes.completeChip)}
                    label={
                        <Typography align="center"><strong>Complete</strong></Typography>
                    }
                />
            )
        }

        // Ongoing tx
        return (
            <Chip
                className={cls(classes.chip, classes.ongoingChip)}
                label={
                    <Fragment>
                        <Typography align="center"><strong>Ongoing</strong></Typography>
                        <Typography align="center" variant="body1">{getTransferStage(tx)}</Typography>
                    </Fragment>
                }
            />
        )
    }

    const setDisplayTx = (tx: BridgeTx) => {
        dispatch(actions.Bridge.setPreviewBridgeTx(tx));
    }

    const clearPreview = () => {
        dispatch(actions.Bridge.setPreviewBridgeTx(undefined));
    }

    const getLogoToken = (tx: BridgeTx) => {
        return bridgeableTokenFinder(tx.srcChain === Blockchain.Zilliqa ? tx.srcToken : tx.dstToken, Blockchain.Zilliqa);
    }

    return (
        <BridgeCard {...rest} className={cls(classes.root, className)}>
            {!previewTx && (
                <Box overflow="hidden" display="flex" flexDirection="column" className={classes.container}>
                    <Box display="flex" justifyContent="space-between" mt={2} pl={2} className={classes.headerBox}>
                        <Box display="flex" flexDirection="column" className={classes.titleBox}>
                            <Text variant="h2">
                                Zil<span className={classes.textColoured}>Bridge</span>
                            </Text>

                            <Text variant="h3">
                                Your Transfer History
                            </Text>
                        </Box>

                        <Box display="flex" pt={0} pb={0} className={classes.buttonBox}>
                            <Button component={Link} to="/bridge" color="primary" variant="contained" className={classes.newTransferButton} onClick={handleNewTransfer} disabled={disableButton}>
                                <AddIcon fontSize="small" className={classes.addIcon} />
                                <Text variant="button" className={classes.newTransferText}>New Transfer</Text>
                            </Button>

                            <Button color="primary" variant="contained" className={classes.resumeTransferButton} onClick={handleResumeTransfer} disabled={disableButton}>
                                <RefreshIcon fontSize="small" className={classes.refreshIcon} />
                                <Text variant="button" className={classes.resumeTransferText}>Resume Transfer</Text>
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer className={classes.tableContainer}>
                        <Table className={classes.table}>
                            <TableHead className={classes.tableHead}>
                                <TableRow>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Transfer</Text>
                                            <Text>Date</Text>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="left">
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Network</Text>
                                            <Text>From - To</Text>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Transfer</Text>
                                            <Text>Amount</Text>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Transfer</Text>
                                            <Text>Status</Text>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Transfer</Text>
                                            <Text>Key <HelpInfo className={classes.helpInfo} placement="top" title="You may use your Transfer Key to recover failed transfers that failed in Stage 2." /></Text>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" flexDirection="column">
                                            <Text variant="h6">Transfer</Text>
                                            <Text>Status</Text>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bridgeTxs.slice().reverse().map((tx: BridgeTx, index: number) => (
                                    <TableRow key={index} className={classes.tableRow}>
                                        <TableCell component="th" scope="row">
                                            <Text>
                                                {tx.depositDispatchedAt?.format('DD MMM YYYY')}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <Text className={classes.transferNetwork}>
                                                {
                                                tx.srcChain === Blockchain.Zilliqa
                                                    ? <ChainLogo chain={tx.srcChain} style={cls(classes.chainLogo, classes.zilLogo)} />
                                                    : <ChainLogo chain={tx.srcChain} style={classes.chainLogo} />
                                                }
                                                {CHAIN_NAMES[tx.srcChain]}
                                                {" "}
                                                &mdash;

                                                {tx.dstChain === Blockchain.Ethereum
                                                    ? <ChainLogo chain={tx.dstChain} style={classes.chainLogo} />
                                                    : <ChainLogo chain={tx.dstChain} style={cls(classes.chainLogo, classes.zilLogo)} />
                                                }
                                                {CHAIN_NAMES[tx.dstChain]}
                                            </Text>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Text className={classes.transferAmount}>
                                                {toHumanNumber(tx.inputAmount)}
                                                <CurrencyLogo className={classes.currencyLogo} address={getLogoToken(tx)?.address} />
                                            </Text>
                                        </TableCell>
                                        <TableCell align="center">
                                            {getTransferStatus(tx)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <RevealMnemonic mnemonic={tx.interimAddrMnemonics} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                className={classes.button}
                                                onClick={() => setDisplayTx(tx)}
                                                endIcon={<ArrowRightRoundedIcon className={classes.arrowRightIcon} />}
                                            >
                                                <Text>Show Details</Text>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {!bridgeTxs.length && (
                            <Typography align="center" variant="body2" className={classes.noTransaction}>No transactions found.</Typography>
                        )}
                    </TableContainer>
                </Box>
            )}
            {previewTx && (
                <TransactionDetail onBack={clearPreview} currentTx={previewTx} approvalHash="" isHistory={true} />
            )}

            <BridgeMobileDialog open={showMobileDialog} onCloseDialog={setShowMobileDialog} />
            <ResumeTransferDialog />
        </BridgeCard>
    )
}

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        "&.Mui-disabled": {
            "& .MuiButton-label": {
                opacity: 0.5,
                "& .MuiTypography-colorTextPrimary": {
                    opacity: 0.5,
                }
            }
        },
    },
    container: {
        margin: "0 auto",
        boxShadow: theme.palette.mainBoxShadow,
        borderRadius: 12,
        background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
        border: theme.palette.border,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(2, 8, 2),
        maxWidth: 1100,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            maxWidth: 450,
        },
        "& .MuiChip-root": {
            borderRadius: 12,
            color: theme.palette.primary.main
        },
        "& .MuiChip-label": {
            paddingLeft: 0,
            paddingRight: 0
        },
        "& .MuiChip-label>p:first-child": {
            fontSize: "12px"
        },
        "& .MuiChip-label>p:not(:first-child)": {
            fontSize: "11px"
        },
        "& .MuiTableCell-stickyHeader": {
            backgroundColor: "transparent"
        },
        "& .MuiTypography-body1": {
            fontSize: "14px"
        },
    },
    headerBox: {
        [theme.breakpoints.down("xs")]: {
            flexDirection: "column",
        },
    },
    titleBox: {
        [theme.breakpoints.down("xs")]: {
            alignItems: "center",
            marginBottom: theme.spacing(2)
        },
    },
    buttonBox: {
        [theme.breakpoints.down("xs")]: {
            flexDirection: "column",
        },
    },
    textColoured: {
        color: theme.palette.primary.dark
    },
    refreshIcon: {
        marginRight: theme.spacing(0.5),
        verticalAlign: "middle",
    },
    addIcon: {
        marginRight: theme.spacing(0.5),
        verticalAlign: "middle",
    },
    resumeTransferButton: {
        color: theme.palette.action?.disabled,
        backgroundColor: theme.palette.action?.disabledBackground,
        textAlign: "center",
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#003340" : "rgba(0, 51, 64, 0.5)", 0.8)}`,
        },
        [theme.breakpoints.down("xs")]: {
            height: 46
        },
        "&.Mui-disabled": {
            "& .MuiButton-label": {
                opacity: 0.5,
            }
        },
    },
    resumeTransferText: {
        color: theme.palette.primary.contrastText,
        paddingRight: theme.spacing(0.5),
    },
    newTransferButton: {
        color: theme.palette.action?.disabled,
        backgroundColor: theme.palette.action?.disabledBackground,
        textAlign: "center",
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#003340" : "rgba(0, 51, 64, 0.5)", 0.8)}`,
        },
        marginRight: theme.spacing(1),
        [theme.breakpoints.down("xs")]: {
            marginRight: 0,
            marginBottom: theme.spacing(1),
            height: 46
        },
        "&.Mui-disabled": {
            "& .MuiButton-label": {
                opacity: 0.5,
            }
        },
    },
    newTransferText: {
        color: theme.palette.primary.contrastText,
        paddingRight: theme.spacing(0.5),
    },
    tableContainer: {
        '&::-webkit-scrollbar': {
            width: '0.4rem',
            height: '0.4rem'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
            borderRadius: 12,
        },
        // if vertical scrollbar present
        // padding: theme.spacing(0, 0.5),
    },
    table: {
        borderCollapse: "separate",
        borderSpacing: theme.spacing(0, 1)
    },
    tableHead: {
        "& th.MuiTableCell-root": {
            borderBottom: "none",
        },
    },
    tableRow: {
        "& .MuiTableCell-root": {
            whiteSpace: "nowrap",
            border: "1px transparent",
            borderRadius: 12,
            "&:first-child": {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
            },
            "&:not(:first-child):not(:last-child)": {
                borderRadius: 0
            },
            "&:last-child": {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
            }
        },
        backgroundColor: theme.palette.background?.contrast,
    },
    helpInfo: {
        verticalAlign: "top!important",
        marginLeft: "2px!important"
    },
    arrowRightIcon: {
        color: theme.palette.label,
        marginLeft: "-8px",
        marginRight: "-4px"
    },
    button: {
        borderRadius: 12,
        height: "32px",
        "& .MuiButton-text": {
            padding: "6px 16px"
        }
    },
    chip: {
        width: "75px"
    },
    failedChip: {
        backgroundColor: "#FF5252"
    },
    ongoingChip: {
        backgroundColor: "#FFDF6B"
    },
    completeChip: {
        backgroundColor: "#00FFB0"
    },
    currencyLogo: {
        height: "20px",
        width: "20px",
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        marginBottom: theme.spacing(0.2)
    },
    transferAmount: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    transferNetwork: {
        display: "flex",
        alignItems: "center"
    },
    noTransaction: {
        color: theme.palette?.label,
        marginBottom: theme.spacing(4)
    },
    chainLogo: {
        height: "16px",
        width: "16px",
        marginBottom: theme.spacing(0.2)
    },
    zilLogo: {
        marginRight: "2px"
    }
}));

export default TransferHistory;
