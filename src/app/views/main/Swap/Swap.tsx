import { Button, ButtonGroup, IconButton, InputLabel } from "@material-ui/core";
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
    display: "flex",
    flexDirection: "column",
    padding: `${theme.spacing(4)}px ${theme.spacing(8)}px ${theme.spacing(2)}px ${theme.spacing(8)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  give: {
    // backgroundColor: "red",
    marginBottom: theme.spacing(3)
  },
  swap: {
    // backgroundColor: "blue",
    justifyContent: "center",
    display: "flex",
    marginBottom: theme.spacing(1)
  },
  receive: {
    marginBottom: theme.spacing(1)
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
    color: theme.palette.text?.secondary
  },
  percentageGroup: {
    marginTop: theme.spacing(1)
  },
  exchangeRow: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between"
  },
  currencyLogo: {
    marginRight: theme.spacing(1),
    paddingTop: theme.spacing(1)
  },
  actionButton: {
    marginTop: theme.spacing(2),
    borderRadius: 4,
    height: 46
  },
  advanceDetails: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
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
      <div className={classes.container}>
        <div className={classes.give}>
          <CurrencyInput
            label="You Give"
            currency={formState.values.giveCurrency}
            amount={formState.values.give}
            handleAmountChange={changeHandler("give", null, sideEffect)}
            handleCurrencyChange={changeHandler("giveCurrency")}
          >
            <ButtonGroup fullWidth color="primary" className={classes.percentageGroup}>
              <Button className={classes.percentageButton}>25%</Button>
              <Button className={classes.percentageButton}>50%</Button>
              <Button className={classes.percentageButton}>75%</Button>
              <Button className={classes.percentageButton}>100%</Button>
            </ButtonGroup>
          </CurrencyInput>
        </div>
        <div className={classes.swap}>
          <IconButton
            onClick={() => onReverse()}
          >
            <SwapSVG />
          </IconButton>
        </div>
        <div className={classes.receive}>
          <CurrencyInput
            label="You Receive"
            currency={formState.values.receiveCurrency}
            amount={formState.values.receive}
            handleAmountChange={changeHandler("receive", null, sideEffect)}
            handleCurrencyChange={changeHandler("receiveCurrency")}
          >
            <div className={classes.exchangeRow}>
              <InputLabel>Exchange Rate</InputLabel>
              <div>1 {formState.values.giveCurrency} = {formState.values.rate} {formState.values.receiveCurrency}</div>
            </div>
          </CurrencyInput>
        </div>
        <Button
          className={classes.actionButton}
          variant="contained"
          color="primary"
          fullWidth
          onClick={onConnectWallet}
        >Connect Wallet</Button>
        <div className={cls(classes.advanceDetails, showAdvanced ? classes.primaryColor : {})} onClick={() => setShowAdvanced(!showAdvanced)}>
          Advanced Details{showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
      </div>
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