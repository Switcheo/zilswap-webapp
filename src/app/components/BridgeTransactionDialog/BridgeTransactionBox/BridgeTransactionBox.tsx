import { Box, Button, Chip, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/AddRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import { CurrencyLogo, HelpInfo, RevealMnemonic, Text } from 'app/components';
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { BridgeState, BridgeTx, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useBridgeableTokenFinder } from "app/utils";
import { toHumanNumber } from "app/utils/strings/strings";
import cls from "classnames";
import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { ReactComponent as EthereumLogo } from "../../../views/main/Bridge/ethereum-logo.svg";
import { ReactComponent as ZilliqaLogo } from "../../../views/main/Bridge/zilliqa-logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(2, 8, 2),
        minWidth: 510,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
        "& .MuiChip-root": {
            borderRadius: 12,
            color: theme.palette.primary.main
        },
        "& .MuiChip-label>p:first-child": {
            fontSize: "11px"
        },
        "& .MuiChip-label>p:not(:first-child)": {
            fontSize: "10px"
        }
    },
    textColoured: {
        color: theme.palette.primary.dark
    },
    addIcon: {
        marginRight: theme.spacing(0.5),
        verticalAlign: "middle",
    },
    newTransferButton: {
        color: theme.palette.action?.disabled,
        backgroundColor: theme.palette.action?.disabledBackground,
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ?  "#003340" : "rgba(0, 51, 64, 0.5)", 0.8)}`,
        },
    },
    textWhite: {
        color: theme.palette.primary.contrastText
    },
    tableContainer: {
        '&::-webkit-scrollbar': {
            width: '0.4rem'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
            borderRadius: 12,
        },
        padding: theme.spacing(0, 0.5)
    },
    tableHead: {
        "& th.MuiTableCell-root": {
            borderBottom: "none",
        },
    },
    tableRow: {
        "& .MuiTableCell-root": {
            whiteSpace: "nowrap",
            borderBottom: `5px solid ${theme.palette.background.default}`,
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
        verticalAlign: "top",
        marginLeft: theme.spacing(0.1)
    },
    newLinkIcon: {
        "& path": {
          fill: theme.palette.label
        }
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
        marginRight: theme.spacing(0.5)
    },
    transferAmount: {
        display: "inline-flex",
        alignItems: "center"
    },
    noTransaction: {
        color: theme.palette?.label
    },
    chainLogo: {
        height: "18px",
        width: "18px",
    },
    zilLogo: {
        marginRight: "2px"
    }
}));

const CHAIN_NAMES = {
    [Blockchain.Zilliqa]: "Zilliqa",
    [Blockchain.Ethereum]: "Ethereum",
    [Blockchain.Neo]: "Neo",
    [Blockchain.BinanceSmartChain]: "Binance Smart Chain",
}

const BridgeTransactionBox = (props: any) => {
    const { className} = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const bridgeableTokenFinder = useBridgeableTokenFinder();
    
    const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
    const bridgeTxs = bridgeState.bridgeTxs;

    const handleNewTransfer = () => {
        dispatch(actions.Layout.toggleShowBridgeTransactions("close"));
        dispatch(actions.Layout.showTransferConfirmation(false));
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

    return (
        <Box overflow="hidden" display="flex" flexDirection="column" className={cls(classes.root, className)}>
            <Box display="flex" justifyContent="space-between" mt={1} pl={2.5} pr={2.5}>
                <Box display="flex" flexDirection="column">
                    <Text variant="h2">
                        Zil<span className={classes.textColoured}>Bridge</span>
                    </Text>
                    
                    <Text variant="h6">
                        Your Transfer History
                    </Text>
                </Box>

                <Box display="flex" pt={0.5} pb={0.5}>
                    <Button color="primary" variant="contained" className={classes.newTransferButton} onClick={handleNewTransfer}>
                        <AddIcon fontSize="small" className={classes.addIcon} />
                        <Text variant="button" className={classes.textWhite}>New Transfer</Text>
                    </Button>
                </Box>
            </Box>

            <TableContainer className={classes.tableContainer}>
                <Table stickyHeader>
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
                                    <Text variant="h6">Mnemonic</Text>
                                    <Text>Phrase <HelpInfo className={classes.helpInfo} placement="top" title="You may use your Mnemonic Phrase to recover failed transfers. Only failed transfers that have successfuly passed Stage 1 are available for recovery." /></Text>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Recover</Text>
                                    <Text>Transfer <HelpInfo className={classes.helpInfo} placement="top" title="You may use your Mnemonic Phrase to recover failed transfers. Only failed transfers that have successfuly passed Stage 1 are available for recovery." /></Text>
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
                    {bridgeTxs.map((tx: BridgeTx, index: number) => (
                        <TableRow key={index} className={classes.tableRow}>
                            <TableCell component="th" scope="row">
                                {/* Incomplete */}
                                {tx?.depositFailedAt
                                    ? tx.depositFailedAt.format('DD MMM YYYY')
                                    : tx?.depositTxConfirmedAt?.format('DD MMM YYYY')
                                }
                            </TableCell>
                            <TableCell>
                                <Text className={classes.transferAmount}>
                                    {tx.srcChain === Blockchain.Zilliqa
                                        ? <ZilliqaLogo className={cls(classes.chainLogo, classes.zilLogo)}/>
                                        : <EthereumLogo className={classes.chainLogo}/>
                                    }
                                    {CHAIN_NAMES[tx.srcChain]}
                                    {" "}
                                    &mdash;

                                    {tx.dstChain === Blockchain.Ethereum
                                        ? <EthereumLogo className={classes.chainLogo}/>
                                        : <ZilliqaLogo className={cls(classes.chainLogo, classes.zilLogo)}/>
                                    }
                                    {CHAIN_NAMES[tx.dstChain]}
                                </Text>
                            </TableCell>
                            <TableCell align="center">
                                <Text className={classes.transferAmount}>
                                    {toHumanNumber(tx.inputAmount, 2)}
                                    {/* <CurrencyLogo className={classes.currencyLogo} currency={"ZWAP"} address={ZWAP_TOKEN_ADDRESS}/> */}
                                    <CurrencyLogo className={classes.currencyLogo} address={bridgeableTokenFinder(tx.srcToken, tx.srcChain)?.tokenAddress} />
                                </Text>
                            </TableCell>
                            <TableCell>
                                {getTransferStatus(tx)}
                            </TableCell>
                            <TableCell align="center">
                                <RevealMnemonic mnemonic={tx.interimAddrMnemonics} />
                            </TableCell>
                            <TableCell>
                                <Button
                                    href="https://app.dem.exchange/reset_password"
                                    target="_blank"
                                    className={classes.button}
                                    endIcon={<NewLinkIcon className={classes.newLinkIcon} />}
                                    >
                                    <Text>Recover</Text>
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    className={classes.button}
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
    )
}

export default BridgeTransactionBox;
