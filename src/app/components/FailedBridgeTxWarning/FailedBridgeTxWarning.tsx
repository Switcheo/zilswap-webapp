import { Box, Button, makeStyles } from "@material-ui/core";
import { DialogModal, Text } from "app/components";
import { actions } from "app/store";
import { BridgeState, BridgeTx, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useNetwork } from "app/utils";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { Network } from "zilswap-sdk/lib/constants";
import cls from "classnames";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      width: "100%!important"
    },
  },
  container: {
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
  breakLine: {
    wordBreak: "break-word"
  },
  link: {
    color: theme.palette.link,
    "&:hover": {
      textDecoration: "underline"
    }
  }
}));

const FailedBridgeTxWarning = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const [failedDepositTx, setFailedDepositTx] = useState<BridgeTx | null>(null);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);

  useEffect(() => {
    if (bridgeState.activeBridgeTx?.depositFailedAt) {
      setFailedDepositTx(bridgeState.activeBridgeTx!);
    } else if (!bridgeState.activeBridgeTx) {
      setFailedDepositTx(null);
    }
  }, [bridgeState.activeBridgeTx])

  const onTryAgain = () => {
    if (!failedDepositTx) return;

    dispatch(actions.Bridge.dismissBridgeTx(failedDepositTx));
    dispatch(actions.Layout.showTransferConfirmation(false));
  };

  const explorerLink = useMemo(() => {
    const hash = failedDepositTx?.sourceTxHash ?? "";
    if (network === Network.MainNet) {
      switch (failedDepositTx?.srcChain) {
        case Blockchain.Ethereum:
          return `https://etherscan.io/search?q=${hash}`;
        default:
          return `https://viewblock.io/zilliqa/tx/${hash}`;
      }
    } else {
      switch (failedDepositTx?.srcChain) {
        case Blockchain.Ethereum:
          return `https://ropsten.etherscan.io/search?q=${hash}`;
        default:
          return `https://viewblock.io/zilliqa/tx/${hash}?network=testnet`;
      }
    }
  }, [failedDepositTx, network]);

  return (
    <DialogModal
      open={!!failedDepositTx}
      onClose={onTryAgain}
      {...rest}
      className={cls(classes.root, className)}
    >
      <Box overflow="hidden" display="flex" flexDirection="column" className={classes.container}>
        <Text variant="h2" align="center" className={classes.warning}>
          Bridge TX Failed
        </Text>

        <Box mt={2} mb={2.5} display="flex" flexDirection="column" alignItems="center">
          <Text marginBottom={1} variant="h6" align="center">
            The bridge transaction has been rejected, your funds are not deducted, you may try again.
          </Text>
          <Text marginBottom={1} variant="h6" align="center">
            There is a known issue with bridging from Zilliqa to Ethereum, we are working on resolving this as soon as possible.
            <br />Bridging Ethereum to Zilliqa is unaffected. Please check <a className={classes.link} href="https://twitter.com/ZilSwap" target="_blank"
              rel="noreferrer">ZilSwap Twitter</a> for updates.
          </Text>

          <Text marginBottom={1} variant="h6" align="center" className={classes.breakLine}>
            TX: {failedDepositTx?.sourceTxHash}
          </Text>

          <Button variant="contained" className={classes.connectedButton} href={explorerLink} target="_blank">
            <Text variant="button">View on Explorer</Text>
          </Button>
        </Box>

        <Box display="flex" mb={1}>
          <Button
            variant="contained"
            color="primary"
            className={classes.actionButton}
            onClick={onTryAgain}
            fullWidth
          >
            Try Again
          </Button>
        </Box>
      </Box>
    </DialogModal>
  )
}

export default FailedBridgeTxWarning;
