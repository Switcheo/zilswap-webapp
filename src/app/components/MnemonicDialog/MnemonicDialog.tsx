import { makeStyles } from "@material-ui/core";
import { DialogModal } from 'app/components';
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import MnemonicBox from "./MnemonicBox";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
}));

const MnemonicDialog = (props: any) => {
    const { mnemonic, isHistory } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const showMnemonicDialog = useSelector<RootState, boolean>(state => state.layout.showMnemonicDialog);

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowMnemonic("close"));
    }

    return (
        <DialogModal
            className={classes.root}
            open={showMnemonicDialog}
            onClose={onCloseDialog}
            >
            <MnemonicBox mnemonic={mnemonic} isHistory={isHistory} />
        </DialogModal>
    )
}

export default MnemonicDialog;
