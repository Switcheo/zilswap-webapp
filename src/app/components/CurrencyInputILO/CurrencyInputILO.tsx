import { Box, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyLogo, Text } from "app/components";
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
  box: {
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    border: "3px solid rgba(0, 255, 176, 0.2)",
    margin: "2px",
  },
  outlinedInput: {
    border: 0,
  },
  input: {
    padding: "8px 14px 12px!important",
    textAlign: "left",
  },
  strongInput: {
    textAlign: "left",
    color: theme.palette.primary.dark
  },
  currencyButton: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 12px 15px",
    borderRadius: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    color: theme.palette.text?.primary,
  },
  form: {
    display: "flex",
    flexDirection: "column",
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
    color: theme.palette.primary.main
  },
  label: {
    paddingLeft: "16px",
    color: "#DEFFFF"
  },
  balance: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    padding: "0 16px",
    marginBottom: theme.spacing(1)
  }
}));

export interface CurrencyInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  token: TokenInfo | null;
  amount: string;
  showCurrencyDialog?: boolean;
  disabled?: boolean;
  disabledStyle?: 'muted' | 'strong';
  hideBalance?: boolean;
  showContribution?: boolean;
  dialogOpts?: Partial<CurrencyDialogProps>;

  onCurrencyChange?: (token: TokenInfo) => void;
  onAmountChange?: (value: string) => void;
  onEditorBlur?: () => void;
  onCloseDialog?: () => void;
};

const CurrencyInputILO: React.FC<CurrencyInputProps> = (props: CurrencyInputProps) => {
  const {
    children, className, disabledStyle = 'muted',
    label, amount, disabled,
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
        <Box className={classes.box} display="flex" flexDirection="column" alignItems="start" borderRadius={12}>
            <Box py={"4px"} px={"16px"} className={classes.currencyButton}>
              <Box display="flex" alignItems="center">
                <CurrencyLogo currency={token?.symbol} address={token?.address} className={classes.currencyLogo} />
                <Typography variant="button" className={classes.currencyText}>{token?.symbol}</Typography>
              </Box>
            </Box>
            <Text color="textSecondary" className={classes.label}>
              {label}
            </Text>
            <OutlinedInput
              className={classes.outlinedInput}
              placeholder={"0.00"}
              value={amount}
              onChange={onChange}
              onBlur={onEditorBlur}
              disabled={disabled}
              type={amount === '-' ? 'string' : 'number'}
              inputProps={{ className: disabled && disabledStyle === 'strong' ? classes.strongInput : classes.input }}
            />
            {tokenBalance && !hideBalance && (
              [
                <InputLabel className={classes.balance}>
                  <Typography>
                    Your Balance:
                  </Typography>
                  <Typography>
                  {
                    moneyFormat(tokenBalance, {
                      symbol: token?.symbol,
                      compression: token?.decimals,
                      showCurrency: true,
                    })
                  }
                  </Typography>
                </InputLabel>,
              ]
            )}
        </Box>
        {children}
        <CurrencyDialog {...dialogOpts} open={showCurrencyDialog || showDialogOverride || false} onSelectCurrency={onCurrencySelect} onClose={onCloseDialog} />
    </form>
  );
};

export default CurrencyInputILO;
