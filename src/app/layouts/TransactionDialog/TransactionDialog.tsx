import React from "react";
import { makeStyles } from "@material-ui/core";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { WalletState } from "app/store/wallet/types";
import TransactionBox from "./TransactionBox";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
}));

const TransactionDialog = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const showTransactionDialog = useSelector<RootState, boolean>(state => state.layout.showTransactionDialog);
    const walletState = useSelector<RootState, WalletState>(state => state.wallet);

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowTransactions("close"));
    };

    return (
        <DialogModal
            header="Past Transactions"
            open={walletState && showTransactionDialog}
            onClose={onCloseDialog}
            {...rest}
            className={cls(classes.root, className)}
            >
            <TransactionBox />
        </DialogModal>
    )
}

export default TransactionDialog;
