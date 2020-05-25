import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect } from "app/components";
import MainCard from "app/layouts/MainCard";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
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
  proportionSelect: {
    marginTop: 12,
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

type ExactOfOptions = "in" | "out";

type WithdrawFormState = {
  percentage: BigNumber;
  exactOf: ExactOfOptions;
  poolToken?: TokenInfo;
  inToken?: TokenInfo;
  inAmount: BigNumber;
  outToken?: TokenInfo;
  outAmount: BigNumber;
  exchangeRate: BigNumber;
};
type CalculateAmountProps = {
  exactOf?: ExactOfOptions;
  inToken?: TokenInfo;
  inAmount?: BigNumber;
  outToken?: TokenInfo;
  outAmount?: BigNumber;
  exchangeRate?: BigNumber;
};

const initialState: WithdrawFormState = {
  percentage: new BigNumber(0.005),
  exactOf: "in",
  inAmount: new BigNumber(0),
  outAmount: new BigNumber(0),
  exchangeRate: BN_ONE,
};

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<WithdrawFormState>(initialState);
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const [runSwap, loading, error] = useAsyncTask("swap");
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const onReverse = () => {
    const exchangeRate = BN_ONE.div(formState.exchangeRate);
    setFormState({
      ...formState,
      exchangeRate,
      inToken: formState.outToken,
      outToken: formState.inToken,
      ...formState.exactOf === "in" && {
        outAmount: formState.inAmount.times(exchangeRate).decimalPlaces(outToken?.decimals || 0),
      },
      ...formState.exactOf === "out" && {
        inAmount: formState.outAmount.div(exchangeRate).decimalPlaces(inToken?.decimals || 0),
      },
    });
  };

  const onPercentage = (percentage: number) => {
    const { inToken } = formState;
    if (!inToken) return;

    const balance = new BigNumber(inToken.balance.toString());
    const amount = balance.times(percentage).decimalPlaces(0);
    onInAmountChange(amount.shiftedBy(-inToken.decimals).toString());
  };

  const calculateAmounts = (props: CalculateAmountProps = {}) => {
    let _inAmount: BigNumber = props.inAmount || formState.inAmount;
    let _outAmount: BigNumber = props.outAmount || formState.outAmount;
    const _inToken: TokenInfo | undefined = props.inToken || formState.inToken;
    const _outToken: TokenInfo | undefined = props.outToken || formState.outToken;
    const _exactOf: ExactOfOptions = props.exactOf || formState.exactOf;
    const _exchangeRate: BigNumber = props.exchangeRate || formState.exchangeRate;

    if (_exactOf === "in")
      _outAmount = _inAmount.times(_exchangeRate).decimalPlaces(_outToken?.decimals || 0);
    else
      _inAmount = _outAmount.div(_exchangeRate).decimalPlaces(_inToken?.decimals || 0);

    return {
      inAmount: _inAmount,
      outAmount: _outAmount,
      inToken: _inToken,
      outToken: _outToken,
      exactOf: _exactOf,
      exchangeRate: _exchangeRate,
    };
  };

  const onOutAmountChange = (amount: string = "0") => {
    const outAmount = new BigNumber(amount);
    if (formState.exchangeRate) {
      setFormState({
        ...formState,
        ...calculateAmounts({ exactOf: "out", outAmount }),
      });
    }
  };
  const onInAmountChange = (amount: string = "0") => {
    const inAmount = new BigNumber(amount);
    if (formState.exchangeRate) {
      setFormState({
        ...formState,
        ...calculateAmounts({ exactOf: "in", inAmount }),
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
      poolToken,
      ...calculateAmounts({ exchangeRate, inToken, outToken: token }),
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
      poolToken,
      ...calculateAmounts({ exchangeRate, inToken: token, outToken }),
    });
  };

  const onSwap = () => {
    const { outToken, inToken, inAmount, outAmount, exactOf } = formState;
    if (!inToken || !outToken) return;
    if (loading) return;

    runSwap(async () => {

      const amount = exactOf === "in" ? inAmount : outAmount;

      const txReceipt = await ZilswapConnector.swap({
        tokenInID: inToken.symbol,
        tokenOutID: outToken.symbol,
        amount, exactOf,
      });

      console.log({ txReceipt });
    });
  };

  const { outToken, inToken, inAmount, outAmount, exchangeRate } = formState;
  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Box display="flex" flexDirection="column" className={classes.container}>
        <CurrencyInput
          label="You Give"
          token={inToken || null}
          amount={inAmount}
          disabled={!inToken}
          onAmountChange={onInAmountChange}
          onCurrencyChange={onInCurrencyChange} />
        <ProportionSelect fullWidth color="primary" className={classes.proportionSelect} onSelectProp={onPercentage} />
        <Box display="flex" mt={4} mb={1} justifyContent="center">
          <IconButton onClick={() => onReverse()} className={classes.swapButton}>
            <SwapSVG />
          </IconButton>
        </Box>
        <CurrencyInput
          label="You Receive"
          token={outToken || null}
          amount={outAmount}
          disabled={!outToken}
          onAmountChange={onOutAmountChange}
          onCurrencyChange={onOutCurrencyChange} />
        {!!(inToken && outToken) && (
          <KeyValueDisplay className={classes.labelExchangeRate}
            kkey="Exchange Rate"
            value={`1 ${inToken?.symbol || ""} = ${moneyFormat(exchangeRate || 0, { maxFractionDigits: outToken?.decimals, symbol: outToken?.symbol })}`} />
        )}

        <Typography color="error">{error?.message}</Typography>

        <FancyButton walletRequired fullWidth
          loading={loading}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          disabled={!inToken || !outToken}
          onClick={onSwap}>
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