import { Box, IconButton, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { CurrencyLogo, FancyButton, Text } from "app/components";
import { actions } from "app/store";
import { BridgeFormState } from "app/store/bridge/types";
import { RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGB, hexToRGBA, truncate } from "app/utils";
import { ConnectedWallet } from "core/wallet";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    padding: theme.spacing(2, 4, 0),
    [theme.breakpoints.down("xs")]: {
        padding: theme.spacing(2, 2, 0),
    },
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  backButton: {
    marginLeft: theme.spacing(-2),
    color: theme.palette.text?.secondary,
    padding: "6px"
  },
  box: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    padding: theme.spacing(1.5)
  },
  amount: {
    display: "inline-flex",
    marginTop: theme.spacing(1)
  },
  token: {
    margin: theme.spacing(0, 1)
  },
  transferBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.1)}`,
    padding: theme.spacing(1)
  },
  networkBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1)
  },
  label: {
    color: theme.palette.label
  },
  textColoured: {
    color: theme.palette.primary.dark
  }
}));


const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge);
  const token = useSelector<RootState, TokenInfo | undefined>(state => state.bridge.token);

  if (!showTransfer) return null;

  return (
    <Box className={classes.container}>
      <IconButton onClick={() => dispatch(actions.Layout.showTransferConfirmation(false))} className={classes.backButton}>
        <ArrowBack/>
      </IconButton>

      <Text variant="h2" align="center">Confirm Transfer</Text>
      
      <Text margin={0.5} align="center">
        Please review your transaction carefully.
      </Text>

      <Text align="center" color="textSecondary">
        Transactions are non-reversible once they are processed.
      </Text>

      <Box className={classes.box} bgcolor="background.contrast">
        <Box className={classes.transferBox}>
          <Text>Transferring</Text>
          <Text variant="h2" className={classes.amount}>
            {bridgeFormState.transferAmount.toString()}
            <CurrencyLogo className={classes.token} currency={token?.symbol} address={token?.address} />
            {token?.symbol}
          </Text>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">From</Text>
            <Text variant="h4">Ethereum Network</Text>
            <Text variant="button">{truncate(bridgeFormState.sourceAddress, 5, 4)}</Text>
          </Box>
          <Box flex={0.2}></Box>
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">To</Text>
            <Text variant="h4">Zilliqa Network</Text>
            <Text variant="button">{truncate(wallet?.addressInfo.bech32, 5, 4)}</Text>
          </Box>
        </Box>
      </Box>

      <Box marginTop={3} marginBottom={0.5}>
        <Box display="flex" marginTop={0.75}>
          <Text className={classes.label} flexGrow={1} align="left"><strong>Estimated Total Fees</strong></Text>
          <Text className={classes.label}>~ <span className={classes.textColoured}>$21.75</span></Text>
        </Box>
        <Box display="flex" marginTop={0.75}>
          <Text className={classes.label} flexGrow={1} align="left">&nbsp; • &nbsp; Ethereum Txn Fee</Text>
          <Text className={classes.label}><span className={classes.textColoured}>0.01</span> ETH ~<span className={classes.textColoured}>$21.25</span></Text>
        </Box>
        <Box display="flex" marginTop={0.75}>
          <Text className={classes.label} flexGrow={1} align="left">&nbsp; • &nbsp; Zilliqa Txn Fee</Text>
          <Text className={classes.label}><span className={classes.textColoured}>5</span> ZIL ~<span className={classes.textColoured}>$0.50</span></Text>
        </Box>
        <Box display="flex" marginTop={0.75}>
          <Text className={classes.label} flexGrow={1} align="left">Estimated Transfer Time</Text>
          <Text className={classes.label}><span className={classes.textColoured}>30</span> Minutes</Text>
        </Box>
      </Box>

      <FancyButton
        variant="contained"
        color="primary"
        className={classes.actionButton}>
        Confirm
      </FancyButton>
    </Box>
  )
}

export default ConfirmTransfer;
