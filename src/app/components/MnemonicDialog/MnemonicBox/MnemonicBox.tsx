import { Box, Button, Grid, IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { Text } from 'app/components';
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import React, { Fragment, useState } from "react";
import cls from "classnames";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(1, 7, 2),
        maxWidth: 510,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
    },
    button: {
        borderRadius: 12,
        height: 38,
        width: "32%",
        "& .MuiButton-text": {
            padding: "6px 16px"
        },
        border: `2px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`
    },
    visibilityIcon: {
        color: theme.palette.label
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
        width: "32%",
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

const MnemonicBox = (props: any) => {
    const { mnemonic, isHistory, className } = props;
    const classes = useStyles();
    const [showPhrase, setShowPhrase] = useState<boolean>(false);
    const [copyMap, setCopyMap] = useState<CopyMap>({});

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
        <Box overflow="hidden" display="flex" flexDirection="column" className={cls(classes.root, className)}>
            <Text variant="h2" align="center" className={classes.warning}>
                <WarningRoundedIcon fontSize="large" className={classes.warningIcon} />
                {" "}
                {isHistory
                    ? "WARNING!"
                    : "IMPORTANT"
                }
            </Text>

            <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
                <Text marginBottom={1} variant="h6" align="center">
                    Never disclose your transfer key to anyone.
                </Text>

                <Text className={classes.warning} align="center">
                    {isHistory
                        ? <span>You may only use the following key phrase to recover <br/> your transfer if it failed in Stage 2.</span>
                        : <span>
                            <strong>In the event you are not able to complete Stage 2 of your transfer</strong>, you may retrieve and resume your fund transfer by entering the following 
                            unique transfer key phrase on <a className={classes.warningLink} href="https://app.dem.exchange/reset_password" target="_blank" rel="noreferrer">Demex</a>. This phrase can also be retrieved later 
                            from your <strong>Transfer History</strong> page. Do not ever reveal your mnemonic 
                            phrase to anyone. ZilSwap will not be held accountable and cannot help you 
                            retrieve those funds once they are lost.
                        </span>
                    }
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
                {mnemonic.split(" ").map((word: any) => (
                    <Grid item xs={4}>
                        <Box className={classes.word} display="flex" justifyContent="center">
                            <Text variant="button">{showPhrase ? word : "***"}</Text>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {isHistory
                ? <Fragment>
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
                    >
                        Begin Recovery
                    </Button>
                </Fragment>
                : <Box mt={1.5} mb={1} display="flex" justifyContent="center">
                    <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(mnemonic)} open={!!copyMap[mnemonic]} title="Copied!">
                        <IconButton className={classes.copy} size="small">
                            <Text>Copy Phrase</Text>
                            <CopyIcon className={classes.copyIcon}/>
                        </IconButton>
                    </Tooltip>
                </Box>        
            }
        </Box>
    )
}

export default MnemonicBox;
