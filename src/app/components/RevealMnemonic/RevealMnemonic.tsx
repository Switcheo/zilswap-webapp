import { Button, makeStyles } from "@material-ui/core";
import { VisibilityRounded as Visibility } from "@material-ui/icons";
import { DialogModal, Text } from 'app/components';
import MnemonicBox from "app/components/MnemonicDialog/MnemonicBox";
import { AppTheme } from "app/theme/types";
import React, { Fragment, useState } from "react";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
    button: {
        borderRadius: 12,
        height: "32px",
        "& .MuiButton-text": {
            padding: "6px 16px"
        },
    },
    visibilityIcon: {
        color: theme.palette.label
    },
}));

const RevealMnemonic = (props: any) => {
    const { mnemonic } = props;
    const classes = useStyles();
    const [showMnemonicDialog, setShowMnemonicDialog] = useState<boolean>(false);

    const onShowMnemonicDialog = () => {
        setShowMnemonicDialog(true);
    }

    const onCloseDialog = () => {
        setShowMnemonicDialog(false);
    }

    return (
        <Fragment>
            <Button
                onClick={onShowMnemonicDialog}
                className={classes.button}
                endIcon={<Visibility className={classes.visibilityIcon}/>}
                >
                <Text>Reveal</Text>
            </Button>
            <DialogModal
                open={showMnemonicDialog}
                onClose={onCloseDialog}
                >
                <MnemonicBox mnemonic={mnemonic} isHistory={true} />
            </DialogModal>
        </Fragment>
    )
}

export default RevealMnemonic;
