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
import { CurrencyDialogProps, CurrencyListType } from "../CurrencyDialog/CurrencyDialog";
import { AppTheme } from "app/theme/types";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  form: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  inputRow: {
    paddingLeft: 0,
    backgroundColor: theme.palette.currencyInput,
    border: 0,
  },
  input: {
    textAlign: "left",
  },
  label: {
    position: "absolute",
    color: theme.palette.text?.primary,
    left: 20,
    top: 12,
    zIndex: 1
  },
  balance: {
    position: "absolute",
    color: theme.palette.text?.primary,
    right: 20,
    top: 12,
    zIndex: 1
  },
  currencyButton: {
    display: "flex",
    justifyContent: "space-between",
    fontFamily: 'Avenir Next',
    fontWeight: 'bold',
    borderRadius: 12,
    padding: "34px 18px 12px 5px",
    color: theme.palette.text?.primary,
    "& .MuiButton-label": {
      padding: theme.spacing(1)
    },
    "&:hover": {
      backgroundColor: "transparent",
      "& .MuiButton-label": {
        backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.08)" : "rgba(0, 51, 64, 0.05)",
        borderRadius: 12,
      }
    }
  },
  currencyText: {
    fontSize: 20,
  },
  currencyLogo: {
    marginRight: theme.spacing(1),
    "& svg": {
      display: "block",
    }
  },
  expandIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text?.primary,
  },
}));

export interface CurrencyInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  token: TokenInfo | null;
  amount: string;
  tokenList?: CurrencyListType;
  showCurrencyDialog?: boolean;
  fixedToken?: boolean;
  disabled?: boolean;
  hideBalance?: boolean;
  showPoolBalance?: boolean;
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
    showContribution, hideBalance, showPoolBalance, dialogOpts = {},
    onAmountChange, onCurrencyChange, token,
    onEditorBlur,
    tokenList = "zil",
  } = props;
  const classes = useStyles();
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5 });
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 6 });

  const userPoolTokenPercent = poolToken?.pool?.contributionPercentage.shiftedBy(-2);
  const inPoolAmount = poolToken?.pool?.tokenReserve.times(userPoolTokenPercent || 0);

  const formatOpts: MoneyFormatterOptions = {
    compression: poolToken?.decimals,
  };

  useEffect(() => {
    if (!walletState.wallet || !token)
      return setTokenBalance(null);

    if (!showContribution) {
      const tokenBalance = token!.balance;
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
      <InputLabel className={classes.label}>{label}</InputLabel>

      {!hideBalance && (
        <Typography className={classes.balance} variant="body2">
          Balance: {tokenBalance ?
            moneyFormat(tokenBalance, {
              symbol: token?.symbol,
              compression: token?.decimals,
              showCurrency: false,
            })
            : '-'
          }
        </Typography>
      )}

      {showPoolBalance && (
        <Typography className={classes.balance} variant="body2">
          Balance in Pool: {!!poolToken && formatMoney(inPoolAmount || 0, formatOpts)}
        </Typography>
      )}

      <OutlinedInput
        className={classes.inputRow}
        placeholder={"0"}
        value={amount.toString()}
        onChange={onChange}
        onBlur={onEditorBlur}
        disabled={disabled}
        type="number"
        inputProps={{ min: "0", className: classes.input }}
        endAdornment={
          <InputAdornment position="end">
            {fixedToken ? (
              <Box py={"4px"} px={"16px"} className={classes.currencyButton}>
                <Box display="flex" alignItems="center">
                  <CurrencyLogo currency={token?.symbol} address={token?.address} className={classes.currencyLogo} />
                  <Typography variant="button" className={classes.currencyText}>{token?.symbol}</Typography>
                </Box>
              </Box>
              ) :
              (
              <Button disableRipple className={classes.currencyButton} onClick={() => setShowCurrencyDialog(true)}>
                <Box display="flex" alignItems="center">
                  {token && <CurrencyLogo currency={token.registered && token.symbol} address={token.address} className={classes.currencyLogo} />}
                  <Typography variant="button" className={classes.currencyText}>{token?.symbol || "Select Token"}</Typography>
                </Box>
                <ExpandMoreIcon className={classes.expandIcon} />
              </Button>
              )
            }
          </InputAdornment>
        }
      />
      {children}
      <CurrencyDialog {...dialogOpts} tokenList={tokenList} open={showCurrencyDialog || showDialogOverride || false} onSelectCurrency={onCurrencySelect} onClose={onCloseDialog} />
    </form>
  );
};

export default CurrencyInput;
