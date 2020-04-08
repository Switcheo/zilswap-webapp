import { Button, InputAdornment, InputLabel, OutlinedInput } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyLogo } from "app/components";
import React from "react";

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
  }
}));

export interface CurrencyInputProps {
  currency: string;
  label: any;
  children: any;
  className?: string;
  amount: number;
  handleAmountChange: Function;
  handleCurrencyChange: Function;
}

const CurrencyInput: React.FC<CurrencyInputProps> = (props: any) => {
  const { children, label, currency, amount, handleAmountChange } = props;
  const classes = useStyles();

  return (
    <form className={classes.form} noValidate autoComplete="off">
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        className={classes.inputRow}
        placeholder={"0.00"}
        value={amount}
        onChange={handleAmountChange}
        startAdornment={
          <InputAdornment position="start">
            <Button className={classes.currencyButton}>
              <div className={classes.currencyLabel}>
                <CurrencyLogo currency={currency} className={classes.currencyLogo} />{currency}
              </div>
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
    </form>
  );
};

export default CurrencyInput;