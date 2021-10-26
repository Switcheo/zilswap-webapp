import React, { Fragment } from "react";
import { useEffect } from "react";
import { Box, BoxProps, Button, makeStyles } from "@material-ui/core";
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernetRounded';
import cls from "classnames";
import { useDispatch } from "react-redux";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { Text } from 'app/components';
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.border,
        borderRight: theme.palette.border,
        borderBottom: theme.palette.border,
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

interface Props extends BoxProps {
  currentChainName: string | null;
  requiredChainName: string | null;
  requiredChainID: string | null;
  walletToChange: string | null;
  ethWallet: ConnectedBridgeWallet | null;
}
const NetworkSwitchBox = (props: Props) => {
    const { className, currentChainName, requiredChainName, requiredChainID, walletToChange, ethWallet } = props;
    const classes = useStyles();
    const dispatch = useDispatch();

    useEffect(() => {
        if (requiredChainName === null) {
            dispatch(actions.Layout.toggleShowNetworkSwitch("close"));
        }

        // eslint-disable-next-line
    }, [requiredChainName]);

    const onCloseDialog = () => {
      dispatch(actions.Layout.toggleShowNetworkSwitch("close"));
    };

    const switchEthChain = async () => {
      try {
        if (!ethWallet) return
        await ethWallet.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requiredChainID }],
        });
        onCloseDialog();
      } catch (switchError) {
        console.error(switchError);
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
                        <DotIcon className={classes.dotIcon} />{currentChainName}
                    </Text>
                </Button>
            </Box>


            <Text marginBottom={2.5} align="center">
                Switch to the <span style={{ fontWeight: "bold" }}>{requiredChainName}</span> on <span style={{ fontWeight: "bold" }}>{walletToChange}</span> to start using ZilBridge.
            </Text>

            {requiredChainID && !ethWallet?.provider.isBoltX
                ? <Fragment>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        onClick={switchEthChain}
                    >
                        Switch to {requiredChainName}
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
