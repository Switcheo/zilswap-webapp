import { makeStyles } from "@material-ui/core";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BridgeTransactionBox from "./BridgeTransactionBox";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
}));

const BridgeTransactionDialog = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const showBridgeTransactionDialog = useSelector<RootState, boolean>(state => state.layout.showBridgeTransactionDialog);

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowBridgeTransactions("close"));
    };

    return (
        <DialogModal
            maxWidth={"lg"}
            open={showBridgeTransactionDialog}
            onClose={onCloseDialog}
            {...rest}
            className={cls(classes.root, className)}
            >
            <BridgeTransactionBox />
        </DialogModal>
    )
}

export default BridgeTransactionDialog;
