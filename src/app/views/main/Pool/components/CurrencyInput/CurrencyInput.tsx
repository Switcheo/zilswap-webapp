import { Button, InputAdornment, InputLabel, OutlinedInput, Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyLogo } from "app/components";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, TokenInfo, WalletState } from "app/store/types";
import { actions } from "app/store";
import CurrencyDialog from "app/components/CurrencyDialog";
import cls from "classnames";
import { useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";

const useStyles = makeStyles(theme => ({
  root: {
  },
  inputRow: {
    paddingLeft: 0
  },
  input: {
    textAlign: "right",
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

export interface CurrencyInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  token: TokenInfo | null;
  amount: number;
  fixedToZil?: boolean;

  onCurrencyChange?: (token: TokenInfo) => void;
  onAmountChange?: (value: string) => void;
};

const CurrencyInput: React.FC<CurrencyInputProps> = (props: CurrencyInputProps) => {
  const { children, label, fixedToZil, amount, onAmountChange, onCurrencyChange, token, className } = props;
  const classes = useStyles();
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5 });
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  useEffect(() => {
    if (!walletState.wallet || !token)
      return setTokenBalance(null);

    const wallet = walletState.wallet!;
    const tokenBalance = token!.balances[wallet.addressInfo.byte20.toLowerCase()];
    if (!tokenBalance)
      return setTokenBalance(null);
    
    setTokenBalance(new BigNumber(tokenBalance!.toString()));

  }, [walletState.wallet, token]);

  const onCurrencySelect = (token: TokenInfo) => {
    if (typeof onCurrencyChange === "function")
      onCurrencyChange(token);
    setShowCurrencyDialog(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onAmountChange === "function")
      onAmountChange(event.target.value);
  };

  return (
    <form className={cls(classes.form, className)} noValidate autoComplete="off">
      <Box display="flex" justifyContent="space-between">
        <InputLabel>{label}</InputLabel>
        {tokenBalance && (
          <Typography variant="body2">
            {moneyFormat(tokenBalance, {
              symbol: token?.symbol,
              compression: token?.decimals,
              showCurrency: true,
            })}
          </Typography>
        )}
      </Box>

      <OutlinedInput
        className={classes.inputRow}
        placeholder={"0.00"}
        value={amount}
        onChange={onChange}
        type="number"
        inputProps={{ className: classes.input }}
        startAdornment={
          <InputAdornment position="start">

            {!fixedToZil && (
              <Button className={classes.currencyButton} onClick={() => setShowCurrencyDialog(true)}>
                <Box display="flex" alignItems="center">
                  <CurrencyLogo currency={token?.symbol} className={classes.currencyLogo} />
                  <Typography variant="button">{token?.symbol || "Select Token"}</Typography>
                </Box>
                <ExpandMoreIcon className={classes.primaryColor} />
              </Button>
            )}

            {fixedToZil && (
              <Box py={"4px"} px={"16px"} className={classes.currencyButton}>
                <Box display="flex" alignItems="center">
                  <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                  <Typography variant="button">ZIL</Typography>
                </Box>
              </Box>
            )}

          </InputAdornment>
        }
      />
      {children}
      <CurrencyDialog open={showCurrencyDialog} onSelectCurrency={onCurrencySelect} onClose={() => setShowCurrencyDialog(false)} />
    </form>
  );
};

export default CurrencyInput;