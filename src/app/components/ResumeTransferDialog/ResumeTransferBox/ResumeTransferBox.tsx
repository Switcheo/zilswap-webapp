import { Box, Button, Grid, makeStyles, OutlinedInput } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { Text } from 'app/components';
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import React, { useMemo, useState } from "react";

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
            padding: theme.spacing(0, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
        "& .MuiOutlinedInput-input": {
            padding: theme.spacing(1),
            fontSize: "16px",
            textAlign: "center"
        },
        "& .MuiButton-endIcon": {
            marginLeft: "6px"
        }
    },
    button: {
        borderRadius: 12,
        height: 38,
        width: "32%",
        "& .MuiButton-text": {
            padding: "6px 16px"
        },
        border: "none"
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
        verticalAlign: "bottom",
        color: theme.palette.warning.main
    },
    warningLink: {
        color: theme.palette.warning.main,
        textDecoration: "underline"
    },
    inputWord: {
        height: 38,
        backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF",
        borderColor: "transparent",
        '&.Mui-focused': {
            borderColor: theme.palette.primary.dark,
            caretColor: theme.palette.primary.dark, 
        },
        webkitTextSecurity: "square"
    }
}));

const ResumeTransferBox = (props: any) => {
    const classes = useStyles();
    const [showPhrase, setShowPhrase] = useState<boolean>(false);
    const [mnemonic, setMnemonic] = useState<Array<string>>(Array(9).fill(""));

    const handleShowPhrase = () => {
        setShowPhrase(!showPhrase);
    }

    // TODO: add validation to ensure string
    const handleWordChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const mnemonicCopy = mnemonic.slice();
        mnemonicCopy[index] = e.target.value;
        setMnemonic(mnemonicCopy);
    }

    const handleResumeTransfer = () => {
        // find tx

        // if tx found, navigate to tx detail page

        // else, some error msg
    }

    // Ensures no empty string in array
    const isResumeTransferEnabled = useMemo(() => {
        for (let word of mnemonic) {
            if (!word) {
                return false;
            }
        }
        return true;
    }, [mnemonic])

    return (
        <Box overflow="hidden" display="flex" flexDirection="column" className={classes.root}>
            <Text variant="h2" align="center">
                Resume Transfer
            </Text>

            <Box mt={2} mb={3} display="flex" flexDirection="column" alignItems="center">
                <Text marginBottom={1} variant="h6" align="center">
                    <WarningRoundedIcon className={classes.warningIcon} />
                    {" "}
                    Never disclose your transfer key to anyone.
                </Text>

                <Text className={classes.warning} align="center">
                    <span>Please enter the transfer key shown on the previous page in the field below to resume your paused transfer.</span>
                </Text>
            </Box> 

            <Grid container spacing={1}>
                {mnemonic.map((word: string, index) => (
                     <Grid item xs={4}>
                        <OutlinedInput
                            className={classes.inputWord}
                            value={word}
                            onChange={handleWordChange(index)}
                            type={showPhrase ? 'text' : 'password'}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box display="flex" justifyContent="center" mt={1.5}>
                <Button
                    onClick={handleShowPhrase}
                    className={classes.button}
                    variant="outlined"
                    endIcon={showPhrase ? <VisibilityOff className={classes.visibilityIcon}/> : <Visibility className={classes.visibilityIcon}/>}
                    >
                    <Text>{showPhrase ? "Hide Phrase" : "Show Phrase"}</Text>
                </Button>
            </Box>

            <Box mt={1}>
                <Button
                    onClick={handleResumeTransfer}
                    variant="contained"
                    color="primary"
                    className={classes.actionButton}
                    disabled={!isResumeTransferEnabled}
                    fullWidth
                >
                    Resume Transfer
                </Button>
            </Box>
        </Box>
    )
}

export default ResumeTransferBox;
