import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CurrencyInput, FancyButton, KeyValueDisplay, Notifications, ProportionSelect } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { ExactOfOptions, RootState, SwapFormState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShowAdvanced } from "./components";
import { ReactComponent as SwitchSVG } from "./swap-icon.svg";
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
    padding: 0,
    transform: "rotate(0)",
    transition: "transform .5s ease-in-out",
  },
  rotateSwapButton: {
    transform: "rotate(180deg)",
  },
  switchIcon: {
    height: 16,
    width: 16,
    marginLeft: 8,
    backgroundColor: theme.palette.type === "dark" ? "#2B4648" : "#E4F1F2",
    borderRadius: 8,
    cursor: "pointer",
    transform: "rotate(0)",
    transition: "transform .5s ease-in-out",
  },
  activeSwitchIcon: {
    transform: "rotate(180deg)",
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
  keyValueLabel: {
    marginTop: theme.spacing(1),
  },
  exchangeRateLabel: {
    flex: 1,
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
};

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [buttonRotate, setButtonRotate] = useState(false);
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const swapFormState: SwapFormState = useSelector<RootState, SwapFormState>(store => store.swap);
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const walletState = useSelector<RootState, WalletState>(store => store.wallet);
  const [runSwap, loading, error] = useAsyncTask("swap");
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reversedRate, setReversedRate] = useState(false);

  const getExchangeRateLabel = () => {
    const exchangeRate = swapFormState.expectedExchangeRate || BIG_ONE;
    let src = inToken, dst = outToken;
    if (reversedRate) {
      dst = inToken;
      src = outToken;
    }

    return `1 ${src!.symbol || ""} = ${moneyFormat(exchangeRate.pow(reversedRate ? -1 : 1), { compression: 0, maxFractionDigits: dst?.decimals, symbol: dst?.symbol })}`
  };

  const onReverse = () => {
    setButtonRotate(!buttonRotate);
    const result = calculateAmounts({
      inToken: swapFormState.outToken,
      outToken: swapFormState.inToken,
    });
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

    if (!_inToken || !_outToken) return {
      inAmount: _inAmount,
      outAmount: _outAmount,
      inToken: _inToken,
      outToken: _outToken,
      exactOf: _exactOf,
    };

    const srcToken = _exactOf === "in" ? _inToken : _outToken;
    const dstToken = _exactOf === "in" ? _outToken : _inToken;

    const srcAmount = (_exactOf === "in" ? _inAmount : _outAmount).shiftedBy(srcToken.decimals);
    const rateResult = ZilswapConnector.getExchangeRate({
      amount: srcAmount.decimalPlaces(0),
      exactOf: _exactOf,
      tokenInID: _inToken!.address,
      tokenOutID: _outToken!.address,
    });

    console.log(rateResult.expectedAmount.toString());

    let expectedExchangeRate = BIG_ZERO;
    if (rateResult.expectedAmount.comparedTo(BIG_ZERO) === 0) {
      const inRate = _inToken.pool?.exchangeRate || BIG_ONE;
      const outRate = _outToken.pool?.exchangeRate || BIG_ONE;
      expectedExchangeRate = inRate.div(outRate);
    } else {
      const expectedAmountUnits = rateResult.expectedAmount.shiftedBy(-dstToken.decimals);
      const srcAmountUnits = srcAmount.shiftedBy(-srcToken.decimals);
      expectedExchangeRate = expectedAmountUnits.div(srcAmountUnits).pow(_exactOf === "in" ? 1: -1).abs();
    }
    console.log(expectedExchangeRate.toString());

    const expectedSlippage = rateResult.slippage.shiftedBy(-2).toNumber();

    if (_exactOf === "in") {
      _outAmount = rateResult.expectedAmount.shiftedBy(-_outToken?.decimals || 0).decimalPlaces(_outToken?.decimals || 0);
    } else {
      _inAmount = rateResult.expectedAmount.shiftedBy(-_inToken?.decimals || 0).decimalPlaces(_inToken?.decimals || 0);
    }

    return {
      inAmount: _inAmount,
      outAmount: _outAmount,
      inToken: _inToken,
      outToken: _outToken,
      exactOf: _exactOf,

      expectedExchangeRate,
      expectedSlippage,
    };
  };

  const onOutAmountChange = (amount: string = "0") => {
    let outAmount = new BigNumber(amount);
    if (outAmount.isNaN() || outAmount.isNegative() || !outAmount.isFinite()) outAmount = BIG_ZERO;
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
    let inAmount = new BigNumber(amount);
    if (inAmount.isNaN() || inAmount.isNegative() || !inAmount.isFinite()) inAmount = BIG_ZERO;
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
    if (swapFormState.outToken === token) return;
    let { inToken, poolToken } = swapFormState;

    if (!token.isZil && !inToken) {
      poolToken = token;
      inToken = tokenState.tokens[ZIL_TOKEN_NAME];
    }

    const result = calculateAmounts({ inToken, outToken: token });

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
    if (swapFormState.inToken === token) return;
    let { outToken, poolToken } = swapFormState;

    if (!token.isZil && !outToken) {
      poolToken = token;
      outToken = tokenState.tokens[ZIL_TOKEN_NAME];
    }

    const result = calculateAmounts({ inToken: token, outToken });

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
        tokenInID: inToken.address,
        tokenOutID: outToken.address,
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
  };

  const { outToken, inToken } = swapFormState;
  const tokenBalance = new BigNumber(inToken?.balances[walletState.wallet?.addressInfo.byte20.toLowerCase() || ""]?.toString() || 0);
  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Notifications />
      <Box display="flex" flexDirection="column" className={classes.container}>
        <CurrencyInput
          label="You Give"
          hideBalance
          token={inToken || null}
          amount={formState.inAmount}
          disabled={!inToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onInAmountChange}
          onCurrencyChange={onInCurrencyChange} />
        <ProportionSelect fullWidth color="primary" className={classes.proportionSelect} onSelectProp={onPercentage} />

        <KeyValueDisplay className={classes.keyValueLabel}
          hideIfNoValue
          kkey="You Have">
          {!!inToken && moneyFormat(tokenBalance, {
            symbol: inToken!.symbol,
            compression: inToken!.decimals,
            showCurrency: true,
          })}
        </KeyValueDisplay>

        <Box display="flex" mt={4} mb={1} justifyContent="center">
          <IconButton
            disabled={!inToken || !outToken}
            onClick={() => onReverse()}
            className={cls(classes.swapButton, { [classes.rotateSwapButton]: buttonRotate })}>
            <SwapSVG />
          </IconButton>
        </Box>
        <CurrencyInput
          label="You Receive"
          token={outToken || null}
          amount={formState.outAmount}
          disabled={!outToken}
          hideBalance={true}
          onEditorBlur={onDoneEditing}
          onAmountChange={onOutAmountChange}
          onCurrencyChange={onOutCurrencyChange} />

        {!!(inToken && outToken) && (
          <Box display="flex" flexDirection="row" marginTop={1}>
            <KeyValueDisplay className={classes.exchangeRateLabel}
              kkey="Exchange Rate">
              {getExchangeRateLabel()}
            </KeyValueDisplay>
            <SwitchSVG
              onClick={() => setReversedRate(!reversedRate)}
              className={cls(classes.switchIcon, {
                [classes.activeSwitchIcon]: reversedRate,
              })} />
          </Box>
        )}

        <Typography color="error">{(error)?.message}</Typography>

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