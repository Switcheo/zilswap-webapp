import React from "react";
import { makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { DialogModal } from 'app/components';
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import ResumeTransferBox from "./ResumeTransferBox";


const useStyles = makeStyles((theme: AppTheme) => ({
    root: {}
}));

const ResumeTransferDialog = (props: any) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const showResumeTransferDialog = useSelector<RootState, boolean>(state => state.layout.showResumeTransferDialog);

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowResumeTransfer("close"));
    }

    return (
        <DialogModal
            className={classes.root}
            open={showResumeTransferDialog}
            onClose={onCloseDialog}
            style={{ zIndex: 0 }} // manually override style
        >
            <ResumeTransferBox />
        </DialogModal>
    )
}

export default ResumeTransferDialog;
