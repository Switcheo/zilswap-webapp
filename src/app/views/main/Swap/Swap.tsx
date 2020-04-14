import { Button, ButtonGroup, IconButton, InputLabel, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { NotificationBox } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useFormHandler } from "app/utils";
import cls from "classnames";
import Decimal from "decimal.js";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CurrencyInput, ShowAdvanced } from "./components";
import { ReactComponent as SwapSVG } from "./swap_logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    padding: `${theme.spacing(4)}px ${theme.spacing(8)}px ${theme.spacing(0)}px ${theme.spacing(8)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
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
    borderRadius: 4,
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
  currencyLabel: {
    display: "flex",
    alignItems: "center",
  },
  primaryColor: {
    color: theme.palette.primary.main
  },







}));


const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showSlippageDropdown, setShowSlippageDropdown] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>({ type: "success", message: "Transaction Submitted." });
  const [formState, setFormState, handleError, changeHandler] = useFormHandler({
    values: {
      give: 0,
      receive: 0,
      giveCurrency: "SWTH",
      receiveCurrency: "ZIL",
      rate: 29913.9683245177,
      slippage: 0,
      limitSlippage: 0.5,
      expire: 15
    },
    errors: {},
    touched: {}
  }, setError); // eslint-disable-line

  const dispatch = useDispatch();

  const onConnectWallet = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  const onReverse = () => {
    const values = { ...formState.values };
    const { give, receive, giveCurrency, receiveCurrency, rate } = values;
    setFormState({
      ...formState,
      values: {
        give: receive,
        receive: give,
        receiveCurrency: giveCurrency,
        giveCurrency: receiveCurrency,
        rate: +(new Decimal(1).dividedBy(new Decimal(rate)).toFixed(10))
      }
    })
  }

  const sideEffect = (input: any, key: string): any => {
    const { values: { give, receive, rate } } = input;
    switch (key) {
      case "give":
        return {
          ...input,
          values: {
            ...input.values,
            receive: +(new Decimal(give || 0).times(new Decimal(rate || 0)).toFixed(10))
          }
        }
      case "receive":
        return {
          ...input,
          values: {
            ...input.values,
            give: + (new Decimal(receive || 0).dividedBy(new Decimal(rate || 1)).toFixed(10))
          }
        }
      case "giveCurrency":
      case "receiveCurrency":
      default:
        return input;
    }
  }

  return (
    <MainCard {...rest} hasNotification={notification} className={cls(classes.root, className)}>
      <NotificationBox notification={notification} setNotification={setNotification} />
      <Box display="flex" flexDirection="column" className={classes.container}>
        <CurrencyInput
          label="You Give"
          currency={formState.values.giveCurrency}
          amount={formState.values.give}
          handleAmountChange={changeHandler("give", null, sideEffect)}
          handleCurrencyChange={changeHandler("giveCurrency")}
        >
          <ButtonGroup fullWidth color="primary" className={classes.percentageGroup}>
            <Button className={classes.percentageButton}>
              <Typography variant="button">25%</Typography>
            </Button>
            <Button className={classes.percentageButton}>
              <Typography variant="button">50%</Typography>
            </Button>
            <Button className={classes.percentageButton}>
              <Typography variant="button">75%</Typography>
            </Button>
            <Button className={classes.percentageButton}>
              <Typography variant="button">100%</Typography
              ></Button>
          </ButtonGroup>
        </CurrencyInput>
        <Box display="flex" mt={4} mb={1} justifyContent="center">
          <IconButton
            onClick={() => onReverse()}
            className={classes.swapButton}
          >
            <SwapSVG />
          </IconButton>
        </Box>
        <CurrencyInput
          label="You Receive"
          currency={formState.values.receiveCurrency}
          amount={formState.values.receive}
          handleAmountChange={changeHandler("receive", null, sideEffect)}
          handleCurrencyChange={changeHandler("receiveCurrency")}
        >
          <Box mt={1} display="flex" justifyContent="space-between">
            <InputLabel>Exchange Rate</InputLabel>
            <Typography variant="body2">1 {formState.values.giveCurrency} = {formState.values.rate} {formState.values.receiveCurrency}</Typography>
          </Box>
        </CurrencyInput>
        <Button
          className={classes.actionButton}
          variant="contained"
          color="primary"
          fullWidth
          onClick={onConnectWallet}
        >Connect Wallet</Button>
        <Typography variant="body2" className={cls(classes.advanceDetails, showAdvanced ? classes.primaryColor : {})} onClick={() => setShowAdvanced(!showAdvanced)}>
          Advanced Details{showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Typography>
      </Box>
      <ShowAdvanced
        showAdvanced={showAdvanced}
        give={formState.values.give}
        receive={formState.values.receive}
        giveCurrency={formState.values.giveCurrency}
        receiveCurrency={formState.values.receiveCurrency}
        slippage={formState.values.slippage}
        limitSlippage={formState.values.limitSlippage}
        expire={formState.values.expire}
        handleLimitSlippage={changeHandler("limitSlippage")}
        handleExpire={changeHandler("expire")}
        showSlippageDropdown={showSlippageDropdown}
        setShowSlippageDropdown={setShowSlippageDropdown}
      />

    </MainCard >
  );
};

export default Swap;