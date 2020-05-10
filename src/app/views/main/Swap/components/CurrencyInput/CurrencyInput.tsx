import { Button, InputAdornment, InputLabel, OutlinedInput, Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyLogo } from "app/components";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/types";
import { actions } from "app/store";
import CurrencyDialog from "app/components/CurrencyDialog";
import { WalletState } from "app/store/wallet/types";
import { useMoneyFormatter } from "app/utils";

const useStyles = makeStyles(theme => ({
  root: {
  },
  inputRow: {
    paddingLeft: 0
  },
  currencyButton: {
    borderRadius: 0,
    color: theme.palette.text.primary,
    fontWeight: 600,
    width: 150,
    display: "flex",
    justifyContent: "space-between"
  },
  label: {
    fontSize: "12px",
    lineHeight: "14px",
    fontWeight: "bold",
    letterSpacing: 0,
    marginBottom: theme.spacing(1),
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  currencyLogo: {
    marginRight: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  currencyLabel: {
    display: "flex",
    alignItems: "center",
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
  floatLeft: {
    float: "left"
  },
  floatRight: {
    float: "right"
  }
}));

export interface CurrencyInputProps {
  label: any;
  children: any;
  className?: string;
  name: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = (props: any) => {
  const { children, label, name } = props;
  const classes = useStyles();
  const amountKey = name;
  const currencyKey = `${name}Currency`;
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const amount = useSelector<RootState, number>(state => state.swap.values[amountKey])
  const currency = useSelector<RootState, string>(state => state.swap.values[currencyKey])
  const wallet = useSelector<RootState, WalletState>(state => state.wallet)
  const dispatch = useDispatch();
  const moneyFormat = useMoneyFormatter({ decPlaces: 10 });

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    dispatch(actions.Swap.update_extended({
      key: name,
      value: e.target.value
    }))
  }

  const onCurrencySelect = (value: string) => {
    dispatch(actions.Swap.update_extended({
      key: currencyKey,
      value
    }));
    setShowCurrencyDialog(false);
  }

  const showBalance = name === "give";

  return (
    <form className={classes.form} noValidate autoComplete="off">
      <Box display="flex" justifyContent="space-between">
        <InputLabel className={classes.floatLeft}>{label}</InputLabel>
        {showBalance && wallet && wallet.currencies[currency] >= 0 && (<Typography variant="body2" className={classes.floatRight}>{`Balance: ${wallet.currencies[currency] >= 0 ? `${moneyFormat(wallet.currencies[currency], { currency }).toLocaleString("en-US", { maximumFractionDigits: 10 })} ${currency}` : "-"}`}</Typography>)}
      </Box>
      <OutlinedInput
        className={classes.inputRow}
        placeholder={"0.00"}
        value={amount}
        onChange={onChange}
        startAdornment={
          <InputAdornment position="start">
            <Button className={classes.currencyButton} onClick={() => setShowCurrencyDialog(true)}>
              <Box display="flex" alignItems="center">
                <CurrencyLogo currency={currency} className={classes.currencyLogo} /><Typography variant="button">{currency || "Select Token"}</Typography>
              </Box>
              <ExpandMoreIcon className={classes.primaryColor} />
            </Button>
          </InputAdornment>
        }
        type="number"
        inputProps={{
          style: {
            textAlign: "right"
          }
        }}
      />
      {children}
      <CurrencyDialog showCurrencyDialog={showCurrencyDialog} onSelect={onCurrencySelect} onCloseDialog={() => setShowCurrencyDialog(false)} />
    </form>
  );
};

export default CurrencyInput;