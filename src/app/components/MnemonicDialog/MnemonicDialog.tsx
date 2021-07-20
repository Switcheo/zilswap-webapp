import { Box, Button, Grid, IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { DialogModal, Text } from 'app/components';
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
    button: {
        borderRadius: 12,
        height: 38,
        width: 122,
        "& .MuiButton-text": {
            padding: "6px 16px"
        },
        border: `2px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`
    },
    visibilityIcon: {
        color: theme.palette.label
    },
    dialogBox: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(1, 8, 2),
        maxWidth: 510,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
    },
    warning: {
        color: theme.palette.warning.main
    },
    actionButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
        height: 46,
    },
    warningIcon: {
        verticalAlign: "sub",
    },
    word: {
        padding: theme.spacing(1.25, 0.5),
        backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF",
        borderRadius: 12
    },
    copyIcon: {
        marginLeft: theme.spacing(0.5),
        "& path": {
            fill: theme.palette.primary.light
        }
    },
    copy: {
        height: 38,
        width: 120,
        borderRadius: 12
    },
    warningLink: {
        color: theme.palette.warning.main,
        textDecoration: "underline"
    }
}));

type CopyMap = {
    [key: string]: boolean
};

const MnemonicDialog = (props: any) => {
    const { mnemonic } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const showMnemonicDialog = useSelector<RootState, boolean>(state => state.layout.showMnemonicDialog);
    const [showPhrase, setShowPhrase] = useState<boolean>(false);
    const [copyMap, setCopyMap] = useState<CopyMap>({});

    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowMnemonic("close"));
    }

    const onCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyMap({ ...copyMap, [text]: true });
        setTimeout(() => {
          setCopyMap({ ...copyMap, [text]: false });
        }, 500)
    }

    const handleShowPhrase = () => {
        setShowPhrase(!showPhrase);
    }

    return (
        <DialogModal
            open={showMnemonicDialog}
            onClose={onCloseDialog}
            >
            <Box overflow="hidden" display="flex" flexDirection="column" className={classes.dialogBox}>
                <Text variant="h2" align="center" className={classes.warning}>
                    <WarningRoundedIcon fontSize="large" className={classes.warningIcon} /> IMPORTANT
                </Text>

                <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
                    <Text marginBottom={1} variant="h6" align="center">
                        Never disclose your transfer key to anyone.
                    </Text>

                    <Text className={classes.warning} align="center">
                        <strong>In the event you are not able to complete Stage 2 of your transfer</strong>, you may retrieve and resume your fund transfer by entering the following 
                        unique transfer key phrase on <a className={classes.warningLink} href="https://app.dem.exchange/reset_password" target="_blank" rel="noreferrer">Demex</a>. This phrase can also be retrieved later 
                        from your <strong>Transfer History</strong> page. Do not ever reveal your mnemonic 
                        phrase to anyone. ZilSwap will not be held accountable and cannot help you 
                        retrieve those funds once they are lost.
                    </Text>
                </Box>

                <Box display="flex" justifyContent="center" mb={2.5}>
                    <Button
                        onClick={handleShowPhrase}
                        className={classes.button}
                        variant="outlined"
                        endIcon={showPhrase ? <VisibilityOff className={classes.visibilityIcon}/> : <Visibility className={classes.visibilityIcon}/>}
                        >
                        <Text>{showPhrase ? "Hide" : "Reveal"}</Text>
                    </Button>
                </Box>

                <Grid container spacing={1}>
                    {mnemonic?.split(" ").map((word: any) => (
                        <Grid item xs={4}>
                            <Box className={classes.word} display="flex" justifyContent="center">
                                <Text variant="button">{showPhrase ? word : "***"}</Text>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box mt={1.5} mb={1} display="flex" justifyContent="center">
                    <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(mnemonic)} open={!!copyMap[mnemonic]} title="Copied!">
                        <IconButton className={classes.copy} size="small">
                            <Text>Copy Phrase</Text>
                            <CopyIcon className={classes.copyIcon}/>
                        </IconButton>
                    </Tooltip>
                </Box>        
            </Box>
        </DialogModal>
    )
}

export default MnemonicDialog;
