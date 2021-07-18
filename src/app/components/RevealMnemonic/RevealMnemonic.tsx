import { Box, Button, Grid, IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { VisibilityRounded as Visibility } from "@material-ui/icons";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { DialogModal, Text } from 'app/components';
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import React, { Fragment, useState } from "react";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
    button: {
        borderRadius: 12,
        height: "32px",
        "& .MuiButton-text": {
            padding: "6px 16px"
        }
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
}));

type CopyMap = {
    [key: string]: boolean
};

const RevealMnemonic = (props: any) => {
    const { mnemonic } = props;
    const classes = useStyles();
    const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
    const [copyMap, setCopyMap] = useState<CopyMap>({});

    const onShowMnemonic= () => {
        setShowMnemonic(true);
    }

    const onCloseDialog = () => {
        setShowMnemonic(false);
    }

    const onBeginRecovery = () => {
        setShowMnemonic(false);
        
    }

    const onCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyMap({ ...copyMap, [text]: true });
        setTimeout(() => {
          setCopyMap({ ...copyMap, [text]: false });
        }, 500)
    }

    return (
        <Fragment>
            <Button
                onClick={onShowMnemonic}
                className={classes.button}
                endIcon={<Visibility className={classes.visibilityIcon}/>}
                >
                <Text>Reveal</Text>
            </Button>
            <DialogModal
                open={showMnemonic}
                onClose={onCloseDialog}
                >
                <Box overflow="hidden" display="flex" flexDirection="column" className={classes.dialogBox}>
                    <Text variant="h2" align="center" className={classes.warning}>
                        <WarningRoundedIcon fontSize="large" className={classes.warningIcon} /> WARNING!
                    </Text>

                    <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
                        <Text marginBottom={1} variant="h6" align="center">
                            Never disclose your transfer key to anyone.
                        </Text>

                        <Text marginBottom={1} align="center">
                            You may only use the following key phrase to recover <br/> your transfer if it failed in Stage 2.
                        </Text>
                    </Box>

                    <Grid container spacing={1}>
                        {mnemonic.split(" ").map((word: any) => (
                            <Grid item xs={4}>
                                <Box className={classes.word} display="flex" justifyContent="center">
                                    <Text variant="button">{word}</Text>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Box mt={1.5} mb={0.5} display="flex" justifyContent="center">
                        <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(mnemonic)} open={!!copyMap[mnemonic]} title="Copied!">
                            <IconButton className={classes.copy} size="small">
                                <Text>Copy Phrase</Text>
                                <CopyIcon className={classes.copyIcon}/>
                            </IconButton>
                        </Tooltip>
                    </Box>        
                        

                    <Button
                        href="https://app.dem.exchange/reset_password"
                        target="_blank"
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        onClick={onBeginRecovery}
                    >
                        Begin Recovery
                    </Button>
                </Box>
            </DialogModal>
        </Fragment>
    )
}

export default RevealMnemonic;
