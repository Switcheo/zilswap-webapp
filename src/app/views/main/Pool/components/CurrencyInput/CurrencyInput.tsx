import { Button, InputAdornment, InputLabel, OutlinedInput, Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyLogo } from "app/components";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/types";
import { actions } from "app/store";
import CurrencyDialog from "app/components/CurrencyDialog";
import cls from "classnames";

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
  primaryColor: {
    color: theme.palette.primary.main
  }
}));

export interface CurrencyInputProps {
  label: any;
  children?: any;
  className?: string;
  name: string;
  fixed?: boolean;
  exchangeRate?: number;
  rightLabel?: string;
  exclude?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = (props: any) => {
  const { children, label, name, fixed, className, exchangeRate, rightLabel, exclude } = props;
  const classes = useStyles();
  const amountKey = name;
  const currencyKey = `${name}Currency`;
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const amount = useSelector<RootState, number>(state => state.pool.values[amountKey])
  const currency = useSelector<RootState, string>(state => state.pool.values[currencyKey])
  const dispatch = useDispatch();
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    dispatch(actions.Pool.update_extended({
      key: name,
      value: e.target.value,
      exchangeRate
    }));
  }

  const onCurrencySelect = (value: string) => {
    dispatch(actions.Pool.update_extended({
      key: currencyKey,
      value
    }));
    setShowCurrencyDialog(false);
  }

  return (
    <form className={cls(classes.form, className)} noValidate autoComplete="off">
      <Box display="flex" justifyContent="space-between">
        <InputLabel>{label}</InputLabel>
        {rightLabel && <Typography variant="body2">{rightLabel}</Typography>}
      </Box>

      <OutlinedInput
        className={classes.inputRow}
        placeholder={"0.00"}
        value={amount}
        onChange={onChange}
        startAdornment={
          <InputAdornment position="start">
            {!fixed && (<Button className={classes.currencyButton} onClick={() => setShowCurrencyDialog(true)}>
              <Box display="flex" alignItems="center">
                <CurrencyLogo currency={currency} className={classes.currencyLogo} /><Typography variant="button">{currency || "Select Token"}</Typography>
              </Box>
              <ExpandMoreIcon className={classes.primaryColor} />
            </Button>)}
            {fixed && (
              <Box py={"4px"} px={"16px"} className={classes.currencyButton}>
                <Box display="flex" alignItems="center">
                  <CurrencyLogo currency={currency} className={classes.currencyLogo} /><Typography variant="button">{currency || "Select Token"}</Typography>
                </Box>
              </Box>
            )}
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
      <CurrencyDialog showCurrencyDialog={showCurrencyDialog} onSelect={onCurrencySelect} onCloseDialog={() => setShowCurrencyDialog(false)} exclude={exclude} />
    </form>
  );
};

export default CurrencyInput;