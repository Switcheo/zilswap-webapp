import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect } from "app/components";
import MainCard from "app/layouts/MainCard";
import { RootState, TokenInfo, TokenState, ExactOfOptions, SwapFormState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector, toBasisPoints } from "core/zilswap";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ShowAdvanced } from "./components";
import { ReactComponent as SwapSVG } from "./swap_logo.svg";
import { actions } from "app/store";
import { BIG_ONE, BIG_ZERO } from "app/utils/contants";

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

const initialFormState = {
  inAmount: "0",
  outAmount: "0",
};

type CalculateAmountProps = {
  exactOf?: ExactOfOptions;
  inToken?: TokenInfo;
  inAmount?: BigNumber;
  outToken?: TokenInfo;
  outAmount?: BigNumber;
  exchangeRate?: BigNumber;
};

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const swapFormState = useSelector<RootState, SwapFormState>(store => store.swap);
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const [runSwap, loading, error] = useAsyncTask("swap");
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const onReverse = () => {
    const exchangeRate = swapFormState.exchangeRate.pow(-1);
    const result = {
      exchangeRate,
      inToken: swapFormState.outToken,
      outToken: swapFormState.inToken,
      ...swapFormState.exactOf === "in" && {
        outAmount: swapFormState.inAmount.times(exchangeRate).decimalPlaces(outToken?.decimals || 0),
      },
      ...swapFormState.exactOf === "out" && {
        inAmount: swapFormState.outAmount.div(exchangeRate).decimalPlaces(inToken?.decimals || 0),
      },
    };

    setFormState({
      ...formState,
      ...result.outAmount && { outAmount: result.outAmount.toString() },
      ...result.inAmount && { inAmount: result.inAmount.toString() },
    });

    dispatch(actions.Swap.update(result));
  };

  const onPercentage = (percentage: number) => {
    const { inToken } = swapFormState;
    if (!inToken) return;

    const balance = new BigNumber(inToken.balance.toString());
    const amount = balance.times(percentage).decimalPlaces(0);
    onInAmountChange(amount.shiftedBy(-inToken.decimals).toString());
  };

  const calculateAmounts = (props: CalculateAmountProps = {}) => {
    let _inAmount: BigNumber = props.inAmount || swapFormState.inAmount;
    let _outAmount: BigNumber = props.outAmount || swapFormState.outAmount;
    const _inToken: TokenInfo | undefined = props.inToken || swapFormState.inToken;
    const _outToken: TokenInfo | undefined = props.outToken || swapFormState.outToken;
    const _exactOf: ExactOfOptions = props.exactOf || swapFormState.exactOf;
    const _exchangeRate: BigNumber = props.exchangeRate || swapFormState.exchangeRate;

    if (_exactOf === "in") {
      if (_inAmount.isNaN() || _inAmount.isNegative() || !_inAmount.isFinite()) _inAmount = BIG_ZERO;
      _outAmount = _inAmount.times(_exchangeRate).decimalPlaces(_outToken?.decimals || 0);
    } else {
      if (_outAmount.isNaN() || _outAmount.isNegative() || !_outAmount.isFinite()) _outAmount = BIG_ZERO;
      _inAmount = _outAmount.div(_exchangeRate).decimalPlaces(_inToken?.decimals || 0);
    }

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
    if (swapFormState.exchangeRate) {
      const result = calculateAmounts({ exactOf: "out", outAmount });
      setFormState({
        outAmount: amount,
        inAmount: result.inAmount.toString(),
      });
      dispatch(actions.Swap.update(result));
    }
  };
  const onInAmountChange = (amount: string = "0") => {
    const inAmount = new BigNumber(amount);
    if (swapFormState.exchangeRate) {
      const result = calculateAmounts({ exactOf: "in", inAmount });
      setFormState({
        inAmount: amount,
        outAmount: result.outAmount.toString(),
      });
      dispatch(actions.Swap.update(result));
    }
  };
  const onOutCurrencyChange = (token: TokenInfo) => {
    if (token.isZil && swapFormState.inToken === token) return;
    let { inToken, poolToken, exchangeRate } = swapFormState;
    if (!token.isZil) {
      inToken = tokenState.tokens?.zil;
      poolToken = token;
      exchangeRate = poolToken.pool?.exchangeRate.pow(-1) || BIG_ONE;
    } else {
      poolToken = tokenState.tokens?.zil;
      exchangeRate = poolToken.pool?.exchangeRate || BIG_ONE;
    }

    const result = calculateAmounts({ exchangeRate, inToken, outToken: token });

    setFormState({
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      poolToken,
      ...result,
    }));
  };
  const onInCurrencyChange = (token: TokenInfo) => {
    if (token.isZil && swapFormState.outToken === token) return;
    let { outToken, poolToken, exchangeRate } = swapFormState;
    if (!token.isZil) {
      outToken = tokenState.tokens?.zil;
      poolToken = token;
      exchangeRate = poolToken.pool?.exchangeRate.pow(-1) || BIG_ONE;
    } else {
      poolToken = tokenState.tokens?.zil;
      exchangeRate = poolToken.pool?.exchangeRate || BIG_ONE;
    }

    const result = calculateAmounts({ exchangeRate, inToken: token, outToken });

    setFormState({
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      poolToken,
      ...result,
    }));
  };

  const onSwap = () => {
    const { outToken, inToken, inAmount, outAmount, exactOf, slippage } = swapFormState;
    if (!inToken || !outToken) return;
    if (loading) return;

    runSwap(async () => {

      const amount = exactOf === "in" ? inAmount : outAmount;
      if (isNaN(amount) || !isFinite(amount))
        throw new Error("Invalid input amount");

      const txReceipt = await ZilswapConnector.swap({
        tokenInID: inToken.symbol,
        tokenOutID: outToken.symbol,
        amount, exactOf,
        maxAdditionalSlippage: toBasisPoints(slippage).toNumber(),
      });

      console.log({ txReceipt });
    });
  };

  const onDoneEditing = () => {
    setFormState({
      inAmount: swapFormState.inAmount.toString(),
      outAmount: swapFormState.outAmount.toString(),
    });
  };

  const { outToken, inToken, exchangeRate } = swapFormState;
  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Box display="flex" flexDirection="column" className={classes.container}>
        <CurrencyInput
          label="You Give"
          token={inToken || null}
          amount={formState.inAmount}
          disabled={!inToken}
          onEditorBlur={onDoneEditing}
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
          amount={formState.outAmount}
          disabled={!outToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onOutAmountChange}
          onCurrencyChange={onOutCurrencyChange} />
        {!!(inToken && outToken) && (
          <KeyValueDisplay className={classes.labelExchangeRate}
            kkey="Exchange Rate"
            value={`1 ${inToken!.symbol || ""} = ${moneyFormat(exchangeRate || 0, { maxFractionDigits: outToken?.decimals, symbol: outToken?.symbol })}`} />
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