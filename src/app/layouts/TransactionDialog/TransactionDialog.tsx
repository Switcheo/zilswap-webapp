import { makeStyles } from "@material-ui/core";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowTransactions("close"));
    };

    return (
        <DialogModal
            header="Past Transactions"
            open={showTransactionDialog}
            onClose={onCloseDialog}
            {...rest}
            className={cls(classes.root, className)}
            >
            <TransactionBox />
        </DialogModal>
    )
}

export default TransactionDialog;
