import { Box, Button, makeStyles } from "@material-ui/core";
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernetRounded';
import { Text } from 'app/components';
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import cls from "classnames";
import React, { Fragment } from "react";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(2, 8, 2),
        minWidth: 510,
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
    settingsEthernetIcon: {
        verticalAlign: "text-top"
    },
    actionButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        height: 46,
    },
    cancel: {
        color: theme.palette?.label,
        textDecoration: "underline",
        "&:hover": {
            cursor: "pointer"
        }
    },
    dotIcon: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(0.1)
    },
    connectedButton: {
        height: 46,
        width: "fit-content",
        backgroundColor: "transparent",
        border: `1px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`,
        "&:hover": {
          backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.2)}`
        }
    },
}));

const NetworkSwitchBox = (props: any) => {
    const { className, chainName, network } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    
    const onCloseDialog = () => {
        dispatch(actions.Layout.toggleShowNetworkSwitch("close"));
    };

    const switchChain = async () => {
        try {
            const ethereum = window.ethereum;
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x3' }],
            });
            dispatch(actions.Layout.toggleShowNetworkSwitch("close"));
        } catch (switchError) {
            console.log(switchError);
        }
    }

    return (
        <Box overflow="hidden" display="flex" flexDirection="column" className={cls(classes.root, className)}>
            <Text variant="h2" align="center" className={classes.warning}>
                <SettingsEthernetIcon fontSize="large" className={classes.settingsEthernetIcon} /> Network Switch Required
            </Text>

            <Box mt={2} mb={2.5} display="flex" flexDirection="column" alignItems="center">
                <Text marginBottom={1} variant="h6" align="center">
                    You are currently connected to
                </Text>

                <Button variant="contained" className={classes.connectedButton}>
                    <Text variant="button">
                        <DotIcon className={classes.dotIcon} />{chainName ? chainName : `Zilliqa ${network}`}
                    </Text>
                </Button>
            </Box>
            

            <Text marginBottom={2.5} align="center">
                Switch to the <span style={{ fontWeight: "bold" }}>{chainName ? 'Ropsten Test Network' : 'Zilliqa TestNet'}</span> on <span style={{ fontWeight: "bold" }}>{chainName ? 'MetaMask' : 'ZilPay'}</span> to start using ZilBridge.
            </Text>

            {chainName 
                ? <Fragment>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        onClick={switchChain}
                        >
                        Switch to Ropsten Test Network
                    </Button>

                    <Text marginTop={1.5} marginBottom={1.5} className={classes.cancel} align="center" onClick={onCloseDialog}>
                        Cancel
                    </Text>
                </Fragment>
                : <Box display="flex" mb={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        onClick={onCloseDialog}
                        fullWidth
                        >
                        Close
                    </Button>
                </Box>
            }
        </Box>
    )
}

export default NetworkSwitchBox;
