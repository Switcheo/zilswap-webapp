import { Box, Button, InputAdornment, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyLogo } from "app/components";
import CurrencyDialog from "app/components/CurrencyDialog";
import { RootState, TokenInfo, WalletState } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CurrencyDialogProps } from "../CurrencyDialog/CurrencyDialog";

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
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    minHeight: 52,
    color: theme.palette.text.primary,
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between"
  },
  label: {
    color: theme.palette.text.secondary,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  currencyLogo: {
    marginRight: theme.spacing(1),
    "& svg": {
      display: "block",
    }
  },
  expandIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main
  },
}));

export interface CurrencyInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  token: TokenInfo | null;
  amount: string;
  showCurrencyDialog?: boolean;
  fixedToken?: boolean;
  disabled?: boolean;
  hideBalance?: boolean;
  showContribution?: boolean;
  dialogOpts?: Partial<CurrencyDialogProps>;

  onCurrencyChange?: (token: TokenInfo) => void;
  onAmountChange?: (value: string) => void;
  onEditorBlur?: () => void;
  onCloseDialog?: () => void;
};

const CurrencyInput: React.FC<CurrencyInputProps> = (props: CurrencyInputProps) => {
  const {
    children, className,
    label, fixedToken, amount, disabled,
    showCurrencyDialog: showDialogOverride,
    onCloseDialog: onCloseDialogListener,
    showContribution, hideBalance, dialogOpts = {},
    onAmountChange, onCurrencyChange, token,
    onEditorBlur,
  } = props;
  const classes = useStyles();
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5 });
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  useEffect(() => {
    if (!walletState.wallet || !token)
      return setTokenBalance(null);

    if (!showContribution) {
      const wallet = walletState.wallet!;
      const tokenBalance = token!.balances?.[wallet.addressInfo.byte20.toLowerCase()];
      if (!tokenBalance)
        return setTokenBalance(null);

      setTokenBalance(new BigNumber(tokenBalance!.toString()));
    } else {
      if (!token.pool) return setTokenBalance(null);
      setTokenBalance(token.pool!.userContribution);
    }

  }, [walletState.wallet, token, showContribution]);

  const onCurrencySelect = (token: TokenInfo) => {
    if (typeof onCurrencyChange === "function")
      onCurrencyChange(token);
    setShowCurrencyDialog(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onAmountChange === "function")
      onAmountChange(event.target.value);
  };

  const onCloseDialog = () => {
    setShowCurrencyDialog(false);
    if (typeof onCloseDialogListener === "function")
      onCloseDialogListener();
  };

  return (
    <form className={cls(classes.form, className)} noValidate autoComplete="off">
      <Box className={classes.label} display="flex" justifyContent="space-between">
        <InputLabel>{label}</InputLabel>
        {tokenBalance && !hideBalance && (
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
        value={amount.toString()}
        onChange={onChange}
        onBlur={onEditorBlur}
        disabled={disabled}
        type="number"
        inputProps={{ className: classes.input }}
        startAdornment={
          <InputAdornment position="start">
            {fixedToken ? (
              <Box py={"4px"} px={"16px"} className={classes.currencyButton}>
                <Box display="flex" alignItems="center">
                  <CurrencyLogo currency={token?.symbol} address={token?.address} className={classes.currencyLogo} />
                  <Typography variant="button">{token?.symbol}</Typography>
                </Box>
              </Box>
              ) :
              (
              <Button className={classes.currencyButton} onClick={() => setShowCurrencyDialog(true)}>
                <Box display="flex" alignItems="center">
                  {token && <CurrencyLogo currency={token.registered && token.symbol} address={token.address} className={classes.currencyLogo} />}
                  <Typography variant="button">{token?.symbol || "Select Token"}</Typography>
                </Box>
                <ExpandMoreIcon className={classes.expandIcon} />
              </Button>
              )
            }
          </InputAdornment>
        }
      />
      {children}
      <CurrencyDialog {...dialogOpts} open={showCurrencyDialog || showDialogOverride || false} onSelectCurrency={onCurrencySelect} onClose={onCloseDialog} />
    </form>
  );
};

export default CurrencyInput;
