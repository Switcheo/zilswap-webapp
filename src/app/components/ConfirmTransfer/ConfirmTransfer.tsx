import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { actions } from "app/store";
import { BridgeFormState } from "app/store/bridge/types";
import { RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate } from "app/utils";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiAccordionSummary-root": {
      display: "inline-flex"
    },
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
    marginLeft: theme.spacing(-1),
    color: theme.palette.text?.secondary,
    padding: "6px"
  },
  box: {
    marginTop: theme.spacing(3),
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
  },
  helpInfo: {
    verticalAlign: "text-top!important"
  },
  textWarning: {
    color: theme.palette.warning.main
  },
  dropDownIcon: {
    color: theme.palette.label
  },
  accordion: {
    borderRadius: "12px",
    boxShadow: "none",
    border: "none",
    backgroundColor:  "rgba(222, 255, 255, 0.1)"
  },
}));


const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge);
  const token = useSelector<RootState, TokenInfo | undefined>(state => state.bridge.token);
  const [pending, setPending] = useState<Boolean>(false);
  const [complete, setComplete] = useState<Boolean>(false);

  if (!showTransfer) return null;

  const onConfirm = () => {
    setPending(true);

    setTimeout(() => {
      setPending(false);
      setComplete(true);
    }, 5000)
  }

  const conductAnotherTransfer = () => {
    dispatch(actions.Bridge.clearForm());
    dispatch(actions.Layout.showTransferConfirmation(false));
  }

  return (
    <Box className={cls(classes.root, classes.container)}>
      {!pending && !complete && (
        <IconButton onClick={() => dispatch(actions.Layout.showTransferConfirmation(false))} className={classes.backButton}>
          <ArrowBack/>
        </IconButton>
      )}

      {!pending && !complete && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h2">Confirm Transfer</Text>
                
          <Text margin={0.5}>
            Please review your transaction carefully.
          </Text>

          <Text color="textSecondary">
            Transactions are non-reversible once they are processed.
          </Text>
        </Box>
      )}

      {(pending || complete) && (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Text variant="h2">{ pending ? "Transfer in Progress..." : "Transfer Complete" }</Text>
                
          <Text className={classes.textWarning} margin={0.5}>
            Do not close this page while we transfer your funds.
          </Text>

          <Text className={classes.textWarning} align="center">
            Failure to keep this page open during the duration of the transfer may lead to a loss of funds. ZilSwap will not be held accountable and cannot help you retrieve those funds.
          </Text>
        </Box>
      )}

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

      {!pending && !complete && (
        <Box marginTop={3} marginBottom={0.5} px={2}>
          <KeyValueDisplay kkey={<strong>Estimated Total Fees</strong>} mb="8px">~ <span className={classes.textColoured}>$21.75</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Ethereum Txn Fee" mb="8px"><span className={classes.textColoured}>0.01</span> ETH ~<span className={classes.textColoured}>$21.25</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Zilliqa Txn Fee" mb="8px"><span className={classes.textColoured}>5</span> ZIL ~<span className={classes.textColoured}>$0.50</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="Estimated Transfer Time" mb="8px"><span className={classes.textColoured}>&lt; 30</span> Minutes<HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
        </Box>
      )}

      {(pending || complete) && (
        <Box className={classes.box} bgcolor="background.contrast">
          <Text align="center" variant="h6">{pending ? "Transfer Progress" : "Transfer Complete"}</Text>

          <KeyValueDisplay kkey="Estimated Time Left" mt="8px" mb="8px" px={2}>
            {pending ? <span><span className={classes.textColoured}>20</span> Minutes</span> : "-" }
            <HelpInfo className={classes.helpInfo} placement="top" title="Todo"/>
          </KeyValueDisplay>

          <Accordion className={classes.accordion}>
            <Box display="flex" justifyContent="center">
              <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon}/>}>
                  <Text>View Transactions</Text>
              </AccordionSummary>
            </Box>
            <AccordionDetails>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={onConfirm}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : "Confirm"
          }
        </FancyButton>
      )}

      {complete && (
        <FancyButton
          onClick={conductAnotherTransfer}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          Conduct Another Transfer
        </FancyButton>
      )}
    </Box>
  )
}

export default ConfirmTransfer;
