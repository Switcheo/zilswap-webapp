import { Box, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { FancyButton } from "app/components";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { RootState, Transaction, TransactionState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate, useNetwork } from "app/utils";
import cls from "classnames";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
    },
    transaction: {
        marginBottom: theme.spacing(1)
    },
    showTransactions: {
      padding: theme.spacing(2, 4, 2),
      flex: 1,
      backgroundColor: "rgba(1, 1, 1, 0.0)",
    },
    actionButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        height: 46
    },
    copy: {
        "& svg": {
            "& path": {
                fill: theme.palette.primary.light
            }
        }
    },
    newLinkTransaction: {
        marginLeft: 6,
        "& svg": {
            "& path": {
                fill: theme.palette.primary.light
            }
        }
    },
    text: {
        color: theme.palette?.label
    }
}));

type CopyMap = {
    [key: string]: boolean
};

const TransactionBox = (props: any) => {
    const { className } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const network = useNetwork();
    const transactionState = useSelector<RootState, TransactionState>(state => state.transaction);
    // const [includeCompleted, setIncludeCompleted] = useState(true);
    const [copyMap, setCopyMap] = useState<CopyMap>({});

    // const filterTXs = (transaction: Transaction) => {
    //     return transaction.status !== "confirmed";
    // };

    const formatStatusLabel = (status: string) => {
        if (!status) return "Unknown";
        return `${status.charAt(0).toUpperCase()}${status.substring(1)}`;
    };

    const onCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyMap({ ...copyMap, [text]: true });
        setTimeout(() => {
          setCopyMap({ ...copyMap, [text]: false });
        }, 500)
    }

    const transactions = transactionState.transactions;

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowTransactions("close"));
    };

    return (
        <Box overflow="hidden"  display="flex" flexDirection="column" className={cls(classes.root, className)}>
            <Box mt={2} mb={1}>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Typography color="textPrimary" variant="h6">Transaction ID</Typography>
                    <Typography color="textPrimary" variant="h6">Status</Typography>
                </Box>
            </Box>
            <Box mb={8}>
                {transactions.map((transaction: Transaction, index: number) => (
                    <Box key={index} className={classes.transaction}>
                        <Box display="flex" flexDirection="row" justifyContent="space-between">
                            <Box display="flex" flexDirection="row" alignItems="center">
                            <Typography variant="body2" className={classes.text}>0x{truncate(transaction.hash, 10, 10)}</Typography>
                            <IconButton target="_blank" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=${network.toLowerCase()}`} className={classes.newLinkTransaction} size="small">
                                <NewLinkIcon />
                            </IconButton>
                            <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(transaction.hash)} open={!!copyMap[transaction.hash]} title="Copied!">
                                <IconButton className={classes.copy} size="small">
                                    <CopyIcon />
                                </IconButton>
                            </Tooltip>
                            </Box>
                            <Typography variant="body2" className={classes.text}>{formatStatusLabel(transaction.status)}</Typography>
                        </Box>
                    </Box>
                ))}
                {!transactions.length && (
                    <Typography align="center" variant="body2" className={classes.text}>No transactions found.</Typography>
                )}
            </Box>

            <FancyButton
                variant="contained"
                color="primary"
                className={classes.actionButton}
                onClick={onCloseDialog}
                >
                Close
            </FancyButton>
        </Box>
    )
}

export default TransactionBox;
