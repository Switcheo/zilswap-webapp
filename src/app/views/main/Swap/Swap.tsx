import { Box, Button, IconButton, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RemoveIcon from "@material-ui/icons/Remove";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { validation as ZilValidation } from "@zilliqa-js/util";
import { CurrencyInput, FancyButton, KeyValueDisplay, Notifications, ProportionSelect } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { ExactOfOptions, LayoutState, RootState, SwapFormState, TokenInfo, TokenState, WalletObservedTx, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO, DefaultFallbackNetwork, PlaceholderStrings, ZIL_TOKEN_NAME } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACTS } from "zilswap-sdk/lib/constants";
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
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  advanceDetails: {
    marginBottom: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: theme.palette.text!.secondary,
    cursor: "pointer"
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
  accordionButton: {
    verticalAlign: "middle",
    paddingBottom: 3,
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
  addAddressButton: {
    borderRadius: 0,
    padding: 0,
    fontSize: "12px",
    "& .MuiButton-label": {
      justifyContent: "flex-start",
    },
  },
  addressLabel: {
    display: "flex",
    alignItems: "center",
  },
  addressInput: {
    marginBottom: theme.spacing(2),
    "& input": {
      padding: "17.5px 14px",
      fontSize: "14px",
    },
  },
  addressError: {
    justifySelf: "flex-end",
    marginLeft: "auto",
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  }
}));

const initialFormState = {
  inAmount: "0",
  outAmount: "0",
  showRecipientAddress: false,
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
  const layoutState: LayoutState = useSelector<RootState, LayoutState>(store => store.layout);
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const walletState = useSelector<RootState, WalletState>(store => store.wallet);
  const [runSwap, loading, error, clearSwapError] = useAsyncTask("swap");
  const [runApproveTx, loadingApproveTx, errorApproveTx, clearApproveError] = useAsyncTask("approveTx");
  const moneyFormat = useMoneyFormatter({ compression: 0, showCurrency: true });
  const [errorRecipientAddress, setErrorRecipientAddress] = useState<string | undefined>();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reversedRate, setReversedRate] = useState(false);

  useEffect(() => {
    if (!swapFormState.forNetwork) return

    // clear form if network changed
    if (swapFormState.forNetwork !== layoutState.network) {
      setFormState({
        ...formState,
        inAmount: "0",
        outAmount: "0",
      });
      dispatch(actions.Swap.clearForm());
    }

    // eslint-disable-next-line
  }, [layoutState.network]);

  const getExchangeRateLabel = () => {
    let exchangeRate = swapFormState.expectedExchangeRate || BIG_ZERO;

    let src = inToken, dst = outToken;
    if (reversedRate) {
      dst = inToken;
      src = outToken;
    }

    if (exchangeRate.eq(0)) {
      try {
        const rateResult = ZilswapConnector.getExchangeRate({
          amount: BIG_ONE.shiftedBy(src!.decimals),
          exactOf: reversedRate ? "out" : "in",
          tokenInID: inToken!.address,
          tokenOutID: outToken!.address,
        });
        if (!rateResult.expectedAmount.isNaN() && !rateResult.expectedAmount.isNegative())
          exchangeRate = rateResult.expectedAmount.shiftedBy(-dst!.decimals).pow(reversedRate ? -1 : 1);
      } catch (e) {
        exchangeRate = BIG_ZERO;
      }
    }

    const formatterOpts = {
      compression: 0,
      maxFractionDigits: dst?.decimals,
      symbol: dst?.symbol,
    };
    const shouldReverseRate = reversedRate && !exchangeRate.isZero();
    const srcAmount = `1 ${src!.symbol || ""}`;
    const dstAmount = `${moneyFormat(exchangeRate.pow(shouldReverseRate ? -1 : 1), formatterOpts)}`;
    return `${srcAmount} = ${dstAmount}`;
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

    dispatch(actions.Swap.update({
      forNetwork: ZilswapConnector.network || null,
      ...result,
    }));
  };

  const onPercentage = (percentage: number) => {
    const { inToken } = swapFormState;
    if (!inToken) return;

    const balance = new BigNumber(inToken.balance.toString());
    const intendedAmount = balance.times(percentage).decimalPlaces(0);
    const netGasAmount = inToken.isZil ? ZilswapConnector.adjustedForGas(intendedAmount, balance) : intendedAmount;
    onInAmountChange(netGasAmount.shiftedBy(-inToken.decimals).toString());
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
    let expectedExchangeRate = BIG_ONE;
    let expectedSlippage = 0;
    let dstAmount = srcAmount;
    let isInsufficientReserves = false;

    if (srcAmount.abs().gt(0)) {
      const rateResult = ZilswapConnector.getExchangeRate({
        amount: srcAmount.decimalPlaces(0),
        exactOf: _exactOf,
        tokenInID: _inToken!.address,
        tokenOutID: _outToken!.address,
      });

      if (rateResult.expectedAmount.isNaN() || rateResult.expectedAmount.isNegative()) {
        isInsufficientReserves = true;
        expectedExchangeRate = BIG_ZERO;
        expectedSlippage = 0;
        dstAmount = BIG_ZERO;
      } else {
        const expectedAmountUnits = rateResult.expectedAmount.shiftedBy(-dstToken.decimals);
        const srcAmountUnits = srcAmount.shiftedBy(-srcToken.decimals);
        expectedExchangeRate = expectedAmountUnits.div(srcAmountUnits).pow(_exactOf === "in" ? 1 : -1).abs();

        expectedSlippage = rateResult.slippage.shiftedBy(-2).toNumber();

        dstAmount = rateResult.expectedAmount.shiftedBy(-dstToken?.decimals || 0).decimalPlaces(dstToken?.decimals || 0);
      }
    } else {
      expectedExchangeRate = BIG_ZERO;

      dstAmount = BIG_ZERO;
    }

    return {
      inAmount: _inAmount,
      outAmount: _outAmount,
      inToken: _inToken,
      outToken: _outToken,
      exactOf: _exactOf,
      ..._exactOf === "in" && {
        outAmount: dstAmount,
      },
      ..._exactOf === "out" && {
        inAmount: dstAmount,
      },

      isInsufficientReserves,
      expectedExchangeRate,
      expectedSlippage,
    };
  };

  const onOutAmountChange = (amount: string = "0") => {
    let outAmount = new BigNumber(amount);
    if (outAmount.isNaN() || outAmount.isNegative() || !outAmount.isFinite()) outAmount = BIG_ZERO;
    const result = calculateAmounts({ exactOf: "out", outAmount });
    setFormState({
      ...formState,
      outAmount: amount,
      inAmount: result.inAmount.toString(),
    });
    dispatch(actions.Swap.update({
      forNetwork: ZilswapConnector.network || null,
      ...result,
    }));
  };
  const onInAmountChange = (amount: string = "0") => {
    let inAmount = new BigNumber(amount);
    if (inAmount.isNaN() || inAmount.isNegative() || !inAmount.isFinite()) inAmount = BIG_ZERO;
    const result = calculateAmounts({ exactOf: "in", inAmount });
    setFormState({
      ...formState,
      inAmount: amount,
      outAmount: result.outAmount.toString(),
    });
    dispatch(actions.Swap.update({
      forNetwork: ZilswapConnector.network || null,
      ...result,
    }));
  };
  const onOutCurrencyChange = (token: TokenInfo) => {
    if (swapFormState.inToken === token) return;
    if (swapFormState.outToken === token) return;
    let { inToken } = swapFormState;

    if (!token.isZil && !inToken) {
      inToken = tokenState.tokens[ZIL_TOKEN_NAME];
    }

    const result = calculateAmounts({ inToken, outToken: token });

    setFormState({
      ...formState,
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      forNetwork: ZilswapConnector.network || null,
      ...result,
    }));
  };
  const onInCurrencyChange = (token: TokenInfo) => {
    if (swapFormState.outToken === token) return;
    if (swapFormState.inToken === token) return;
    let { outToken } = swapFormState;

    if (!token.isZil && !outToken) {
      outToken = tokenState.tokens[ZIL_TOKEN_NAME];
    }

    const result = calculateAmounts({ inToken: token, outToken });

    setFormState({
      ...formState,
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      forNetwork: ZilswapConnector.network || null,
      ...result,
    }));
  };

  const onRecipientAddressChange = (event: any) => {
    dispatch(actions.Swap.update({
      recipientAddress: event.target.value,
    }));
  };

  const onSwap = () => {
    const { outToken, inToken, inAmount, outAmount, exactOf, slippage, expiry, recipientAddress } = swapFormState;
    if (!inToken || !outToken) return;
    if (inAmount.isZero() || outAmount.isZero()) return;
    if (loading) return;

    clearApproveError();

    runSwap(async () => {
      const amount: BigNumber = exactOf === "in" ? inAmount.shiftedBy(inToken.decimals) : outAmount.shiftedBy(outToken.decimals);
      if (amount.isNaN() || !amount.isFinite())
        throw new Error("Invalid input amount");

      const address = walletState.wallet?.addressInfo.byte20.toLowerCase() || ""
      const balance: BigNumber = new BigNumber(inToken.balances[address]?.toString() || 0)

      if (inAmount.shiftedBy(inToken.decimals).gt(balance)) {
        throw new Error(`Insufficient ${inToken.symbol} balance.`)
      }

      ZilswapConnector.setDeadlineBlocks(expiry);

      const observedTx = await ZilswapConnector.swap({
        tokenInID: inToken.address,
        tokenOutID: outToken.address,
        amount, exactOf,
        maxAdditionalSlippage: toBasisPoints(slippage).toNumber(),
        ...formState.showRecipientAddress && {
          recipientAddress,
        },
      });
      const walletObservedTx: WalletObservedTx = {
        ...observedTx,
        address: walletState.wallet?.addressInfo.bech32 || "",
        network: walletState.wallet?.network || DefaultFallbackNetwork,
      };

      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  const onApproveTx = () => {
    if (!swapFormState.inToken) return;
    if (swapFormState.inToken.isZil) return;
    if (swapFormState.inAmount.isZero()) return;
    if (loading) return;

    clearSwapError();

    runApproveTx(async () => {
      const tokenAddress = swapFormState.inToken!.address;
      const tokenAmount = swapFormState.inAmount;
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: tokenAmount.shiftedBy(swapFormState.inToken!.decimals),
        tokenID: tokenAddress,
      });

      if (!observedTx)
        throw new Error("Transfer allowance already sufficient for specified amount");

      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: walletState.wallet?.addressInfo.bech32 || "",
        network: walletState.wallet?.network || DefaultFallbackNetwork,
      };
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  const onDoneEditing = () => {
    setFormState({
      ...formState,
      inAmount: swapFormState.inAmount.toString(),
      outAmount: swapFormState.outAmount.toString(),
    });
  };

  const onEnterRecipientAddress = () => {
    const address = swapFormState.recipientAddress;
    let error = undefined;
    if (address && !ZilValidation.isBech32(address)) {
      error = "Invalid address format";
    }

    if (error !== errorRecipientAddress)
      setErrorRecipientAddress(error);
  };

  const { outToken, inToken } = swapFormState;
  const tokenBalance = new BigNumber(inToken?.balances[walletState.wallet?.addressInfo.byte20.toLowerCase() || ""]?.toString() || 0);
  let showTxApprove = false;
  if (inToken && !inToken?.isZil) {
    const zilswapContractAddress = CONTRACTS[ZilswapConnector.network || DefaultFallbackNetwork];
    const byte20ContractAddress = fromBech32Address(zilswapContractAddress).toLowerCase();
    const unitlessInAmount = swapFormState.inAmount.shiftedBy(swapFormState.inToken!.decimals);
    showTxApprove = new BigNumber(inToken?.allowances[byte20ContractAddress] || "0").comparedTo(unitlessInAmount) < 0;
  }
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
          dialogOpts={{ hideNoPool: true }}
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

        <Box display="flex" mt={2} mb={3} justifyContent="center">
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
          dialogOpts={{ hideNoPool: true }}
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

        <Box display="flex" flexDirection="column" marginTop={3}>
          {!formState.showRecipientAddress && (
            <Button variant="text" className={classes.addAddressButton} onClick={() => setFormState({ ...formState, showRecipientAddress: true })}>
              <AddIcon className={classes.accordionButton} />
              <span>Add Receiving Address</span>
            </Button>
          )}
          {formState.showRecipientAddress && (
            <>
              <InputLabel className={classes.addressLabel}>
                <RemoveIcon className={classes.accordionButton} onClick={() => setFormState({ ...formState, showRecipientAddress: false })} />
                <span>Receiving Address</span>
                {!!errorRecipientAddress && <Typography className={classes.addressError} component="span" color="error">{errorRecipientAddress}</Typography>}
              </InputLabel>
              <OutlinedInput
                onBlur={onEnterRecipientAddress}
                className={classes.addressInput}
                value={swapFormState.recipientAddress || ""}
                placeholder={PlaceholderStrings.ZilAddress}
                onChange={onRecipientAddressChange} />
            </>
          )}
        </Box>

        <Typography className={classes.errorMessage} color="error">{error?.message || errorApproveTx?.message}</Typography>
        {swapFormState.isInsufficientReserves && (
          <Typography color="error">Pool reserve is too small to fulfill desired output.</Typography>
        )}

        <FancyButton walletRequired
          loading={loading}
          className={classes.actionButton}
          showTxApprove={showTxApprove}
          loadingTxApprove={loadingApproveTx}
          onClickTxApprove={onApproveTx}
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
