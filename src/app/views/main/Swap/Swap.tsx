import { Box, Button, ButtonGroup, IconButton, makeStyles, Typography } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyInput, FancyButton, KeyValueDisplay, NotificationBox } from "app/components";
import MainCard from "app/layouts/MainCard";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ShowAdvanced } from "./components";
import { ReactComponent as SwapSVG } from "./swap_logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    padding: theme.spacing(4, 8, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 2, 0),
    },
  },
  swapButton: {
    padding: 0
  },
  inputRow: {
    paddingLeft: 0
  },
  currencyButton: {
    borderRadius: 0,
    color: theme.palette.text!.primary,
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
  labelExchangeRate: {
    marginTop: theme.spacing(1),
  },
  percentageButton: {
    borderRadius: 4,
    color: theme.palette.text?.secondary,
    paddingTop: 10,
    paddingBottom: 10
  },
  percentageGroup: {
    marginTop: 12
  },
  actionButton: {
    marginTop: theme.spacing(6),
    height: 46
  },
  advanceDetails: {
    marginTop: theme.spacing(9),
    marginBottom: theme.spacing(4),
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: theme.palette.text!.secondary,
    cursor: "pointer"
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
}));

const BN_ONE = new BigNumber(1);

type WithdrawFormState = {
  percentage: BigNumber;
  poolToken?: TokenInfo;
  inToken?: TokenInfo;
  inAmount: BigNumber;
  outToken?: TokenInfo;
  outAmount: BigNumber;
  exchangeRate: BigNumber;
};

const initialState: WithdrawFormState = {
  percentage: new BigNumber(0.005),
  inAmount: new BigNumber(0),
  outAmount: new BigNumber(0),
  exchangeRate: BN_ONE,
};

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<WithdrawFormState>(initialState);
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>(); //{ type: "success", message: "Transaction Submitted." }

  const onReverse = () => {
    const exchangeRate = BN_ONE.div(formState.exchangeRate);
    setFormState({
      ...formState,
      exchangeRate,
      inToken: formState.outToken,
      outToken: formState.inToken,
      inAmount: formState.outAmount.times(exchangeRate).decimalPlaces(inToken?.decimals || 0),
    });
  };

  const onPercentage = (percentage: number) => {
    const { outToken } = formState;
    if (!outToken) return;

    const balance = new BigNumber(outToken.balance.toString());
    const amount = balance.times(percentage).decimalPlaces(outToken.decimals);
    onOutAmountChange(amount.shiftedBy(-outToken.decimals).toString());
  };

  const onOutAmountChange = (amount: string = "0") => {
    const value = new BigNumber(amount);
    if (formState.exchangeRate) {
      setFormState({
        ...formState,
        outAmount: value,
        inAmount: value.times(formState.exchangeRate).decimalPlaces(inToken?.decimals || 0)
      });
    }
  };
  const onInAmountChange = (amount: string = "0") => {
    const value = new BigNumber(amount);
    if (formState.exchangeRate) {
      setFormState({
        ...formState,
        inAmount: value,
        outAmount: value.div(formState.exchangeRate).decimalPlaces(outToken?.decimals || 0)
      });
    }
  };
  const onOutCurrencyChange = (token: TokenInfo) => {
    if (token.isZil && formState.inToken === token) return;
    let { inToken, poolToken, exchangeRate } = formState;
    if (!token.isZil) {
      inToken = tokenState.tokens?.zil;
      poolToken = token;
      exchangeRate = BN_ONE.div(poolToken.pool?.exchangeRate || BN_ONE);
    } else {
      poolToken = tokenState.tokens?.zil;
      exchangeRate = poolToken.pool?.exchangeRate || BN_ONE;
    }

    setFormState({
      ...formState,
      poolToken, exchangeRate,
      inToken, outToken: token,
    });
  };
  const onInCurrencyChange = (token: TokenInfo) => {
    if (token.isZil && formState.outToken === token) return;
    let { outToken, poolToken, exchangeRate } = formState;
    if (!token.isZil) {
      outToken = tokenState.tokens?.zil;
      poolToken = token;
      exchangeRate = BN_ONE.div(poolToken.pool?.exchangeRate || BN_ONE);
    } else {
      poolToken = tokenState.tokens?.zil;
      exchangeRate = poolToken.pool?.exchangeRate || BN_ONE;
    }

    setFormState({
      ...formState,
      poolToken, exchangeRate,
      outToken, inToken: token,
    });
  };

  const { outToken, inToken, inAmount, outAmount, exchangeRate } = formState;
  return (
    <MainCard {...rest} hasNotification={notification} className={cls(classes.root, className)}>
      <NotificationBox notification={notification} setNotification={setNotification} />
      <Box display="flex" flexDirection="column" className={classes.container}>
        <CurrencyInput
          label="You Give"
          token={outToken || null}
          amount={outAmount}
          disabled={!outToken}
          onAmountChange={onOutAmountChange}
          onCurrencyChange={onOutCurrencyChange} />
        <ButtonGroup fullWidth color="primary" className={classes.percentageGroup}>
          <Button onClick={() => onPercentage(0.25)} className={classes.percentageButton}>
            <Typography variant="button">25%</Typography>
          </Button>
          <Button onClick={() => onPercentage(0.5)} className={classes.percentageButton}>
            <Typography variant="button">50%</Typography>
          </Button>
          <Button onClick={() => onPercentage(0.75)} className={classes.percentageButton}>
            <Typography variant="button">75%</Typography>
          </Button>
          <Button onClick={() => onPercentage(1)} className={classes.percentageButton}>
            <Typography variant="button">100%</Typography>
          </Button>
        </ButtonGroup>
        <Box display="flex" mt={4} mb={1} justifyContent="center">
          <IconButton onClick={() => onReverse()} className={classes.swapButton}>
            <SwapSVG />
          </IconButton>
        </Box>
        <CurrencyInput
          label="You Receive"
          token={inToken || null}
          amount={inAmount}
          disabled={!inToken}
          onAmountChange={onInAmountChange}
          onCurrencyChange={onInCurrencyChange} />
        {!!(inToken && outToken) && (
          <KeyValueDisplay className={classes.labelExchangeRate}
            kkey="Exchange Rate"
            value={`1 ${outToken?.symbol || ""} = ${moneyFormat(exchangeRate || 0, { maxFractionDigits: inToken?.decimals, symbol: inToken?.symbol })}`} />
        )}

        <FancyButton walletRequired fullWidth
          className={classes.actionButton}
          variant="contained"
          color="primary"
          disabled={!inToken || !outToken}>
          Swap
        </FancyButton>
        <Typography variant="body2" className={cls(classes.advanceDetails, showAdvanced ? classes.primaryColor : {})} onClick={() => setShowAdvanced(!showAdvanced)}>
          Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Typography>
      </Box>
      <ShowAdvanced showAdvanced={showAdvanced} />
    </MainCard >
  );
};

export default Swap;