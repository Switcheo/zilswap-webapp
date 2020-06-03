import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect, Notifications } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { ExactOfOptions, RootState, SwapFormState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

const initialFormState = {
  inAmount: "0",
  outAmount: "0",
  calculatingRate: false,
};

type CalculateAmountProps = {
  exactOf?: ExactOfOptions;
  inToken?: TokenInfo;
  inAmount?: BigNumber;
  outToken?: TokenInfo;
  outAmount?: BigNumber;
  reverseExchangeRate?: boolean;
};

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const swapFormState = useSelector<RootState, SwapFormState>(store => store.swap);
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const [runSwap, loading, error] = useAsyncTask("swap");
  const [runExchangeRate, loadingRate, errorRate] = useAsyncTask("exchangeRate");
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const getExchangeRate = (reverseExchangeRate?: boolean): BigNumber => {
    const _reverseExchangeRate = reverseExchangeRate === undefined ? swapFormState.reverseExchangeRate : reverseExchangeRate;
    const power = _reverseExchangeRate ? -1 : 1;
    return swapFormState.poolToken?.pool?.exchangeRate?.pow(power) || BIG_ONE;
  };

  const getExchangeRateLabel = () => {
    if (formState.calculatingRate) return "Calculating…";
    // const exchangeRate = swapFormState.expectedExchangeRate || getExchangeRate();
    const exchangeRate = getExchangeRate();
    return `1 ${inToken!.symbol || ""} = ${moneyFormat(exchangeRate, { compression: 0, maxFractionDigits: outToken?.decimals, symbol: outToken?.symbol })}`
  };

  const onReverse = () => {
    const reverseExchangeRate = !swapFormState.reverseExchangeRate;
    const exchangeRate = getExchangeRate(reverseExchangeRate);
    const result = {
      reverseExchangeRate,
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

  const updateExchangeRate = () => {
    if (loadingRate) return;
    runExchangeRate(async () => {
      const { inToken, outToken, exactOf, inAmount, outAmount } = swapFormState;
      if (!inToken || !outToken) {
        setFormState({
          ...formState,
          calculatingRate: false,
        });
      };

      const amount = exactOf === "in" ? inAmount.shiftedBy(inToken.decimals) : outAmount.shiftedBy(outToken.decimals);

      const rateResult = await ZilswapConnector.getExchangeRate({
        amount, exactOf,
        tokenInID: inToken!.address,
        tokenOutID: outToken.address,
      });

      // setFormState({
      //   ...formState,
      //   ...exactOf === "in" && {
      //     outAmount: rateResult.expectedAmount.shiftedBy(-outToken.decimals).toString(),
      //   },
      //   ...exactOf === "out" && {
      //     inAmount: rateResult.expectedAmount.shiftedBy(-inToken.decimals).toString(),
      //   },
      //   calculatingRate: false,
      // });

      dispatch(actions.Swap.update({
        ...exactOf === "in" && {
          expectedInAmount: undefined,
          expectedOutAmount: rateResult.expectedAmount.shiftedBy(-outToken.decimals),
          expectedExchangeRate: amount.div(rateResult.expectedAmount).pow(-1),
        },
        ...exactOf === "out" && {
          expectedOutAmount: undefined,
          expectedInAmount: rateResult.expectedAmount.shiftedBy(-inToken.decimals),
          expectedExchangeRate: amount.div(rateResult.expectedAmount).pow(1),
        },
        expectedSlippage: rateResult.slippage.shiftedBy(-2).toNumber(),
      }));
    });
  };

  const calculateAmounts = (props: CalculateAmountProps = {}) => {
    let _inAmount: BigNumber = props.inAmount || swapFormState.inAmount;
    let _outAmount: BigNumber = props.outAmount || swapFormState.outAmount;
    const _inToken: TokenInfo | undefined = props.inToken || swapFormState.inToken;
    const _outToken: TokenInfo | undefined = props.outToken || swapFormState.outToken;
    const _exactOf: ExactOfOptions = props.exactOf || swapFormState.exactOf;
    const _reverseExchangeRate = props.reverseExchangeRate === undefined ? swapFormState.reverseExchangeRate : props.reverseExchangeRate;

    const exchangeRate = getExchangeRate(_reverseExchangeRate);

    if (_exactOf === "in") {
      if (_inAmount.isNaN() || _inAmount.isNegative() || !_inAmount.isFinite()) _inAmount = BIG_ZERO;
      _outAmount = _inAmount.times(exchangeRate).decimalPlaces(_outToken?.decimals || 0);
    } else {
      if (_outAmount.isNaN() || _outAmount.isNegative() || !_outAmount.isFinite()) _outAmount = BIG_ZERO;
      _inAmount = _outAmount.div(exchangeRate).decimalPlaces(_inToken?.decimals || 0);
    }

    return {
      inAmount: _inAmount,
      outAmount: _outAmount,
      inToken: _inToken,
      outToken: _outToken,
      exactOf: _exactOf,
      reverseExchangeRate: _reverseExchangeRate,
    };
  };

  const onOutAmountChange = (amount: string = "0") => {
    const outAmount = new BigNumber(amount);
    if (swapFormState.poolToken) {
      const result = calculateAmounts({ exactOf: "out", outAmount });
      setFormState({
        ...formState,
        outAmount: amount,
        inAmount: result.inAmount.toString(),
      });
      dispatch(actions.Swap.update(result));
    }
  };
  const onInAmountChange = (amount: string = "0") => {
    const inAmount = new BigNumber(amount);
    if (swapFormState.poolToken) {
      const result = calculateAmounts({ exactOf: "in", inAmount });
      setFormState({
        ...formState,
        inAmount: amount,
        outAmount: result.outAmount.toString(),
      });
      dispatch(actions.Swap.update(result));
    }
  };
  const onOutCurrencyChange = (token: TokenInfo) => {
    if (token.isZil && swapFormState.inToken === token) return;
    let { inToken, poolToken, reverseExchangeRate } = swapFormState;
    reverseExchangeRate = !token.isZil;

    if (!token.isZil) {
      poolToken = token;
      inToken = tokenState.tokens?.zil;
    }

    const result = calculateAmounts({ reverseExchangeRate, inToken, outToken: token });

    setFormState({
      ...formState,
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
    let { outToken, poolToken, reverseExchangeRate } = swapFormState;
    reverseExchangeRate = token.isZil;

    if (!token.isZil) {
      poolToken = token;
      outToken = tokenState.tokens?.zil;
    }

    const result = calculateAmounts({ reverseExchangeRate, inToken: token, outToken });

    setFormState({
      ...formState,
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      poolToken,
      ...result,
    }));
  };

  const onSwap = () => {
    const { outToken, inToken, inAmount, outAmount, exactOf, slippage, expiry } = swapFormState;
    if (!inToken || !outToken) return;
    if (inAmount.isZero() || outAmount.isZero()) return;
    if (loading) return;

    runSwap(async () => {

      const amount: BigNumber = exactOf === "in" ? inAmount.shiftedBy(inToken.decimals) : outAmount.shiftedBy(outToken.decimals);
      if (amount.isNaN() || !amount.isFinite())
        throw new Error("Invalid input amount");

      ZilswapConnector.setDeadlineBlocks(expiry);

      const observedTx = await ZilswapConnector.swap({
        tokenInID: inToken.symbol,
        tokenOutID: outToken.symbol,
        amount, exactOf,
        maxAdditionalSlippage: toBasisPoints(slippage).toNumber(),
      });

      dispatch(actions.Transaction.observe({ observedTx }));
    });
  };

  const onDoneEditing = () => {
    setFormState({
      ...formState,
      // calculatingRate: true,
      inAmount: swapFormState.inAmount.toString(),
      outAmount: swapFormState.outAmount.toString(),
    });

    updateExchangeRate();
  };

  const { outToken, inToken } = swapFormState;
  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Notifications />
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
            value={getExchangeRateLabel()} />
        )}

        <Typography color="error">{(error || errorRate)?.message}</Typography>

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