import { Box, Button, IconButton, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { WarningRounded } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import AutorenewIcon from '@material-ui/icons/Autorenew';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLowRounded';
import RemoveIcon from "@material-ui/icons/RemoveRounded";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { validation as ZilValidation } from "@zilliqa-js/util";
import { CurrencyInput, FancyButton, Notifications, ProportionSelect, ShowAdvanced, Text } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { ExactOfOptions, LayoutState, RootState, SwapFormState, TokenInfo, TokenState, WalletObservedTx, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { strings, useAsyncTask, useBlacklistAddress, useNetwork, useSearchParam, useToaster } from "app/utils";
import { BIG_ONE, BIG_ZERO, PlaceholderStrings, ZIL_ADDRESS, ZWAP_ADDRESS } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { CONTRACTS } from "zilswap-sdk/lib/constants";
import SwapDetail from "./components/SwapDetail";
import { ReactComponent as SwapSVG } from "./swap_logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    padding: theme.spacing(2, 4, 2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 2),
    },
  },
  swapButton: {
    padding: 0,
    marginTop: -49,
    marginBottom: -15,
    transform: "rotate(0)",
    transition: "transform .5s ease-in-out",
    [theme.breakpoints.down("sm")]: {
      marginTop: -55
    },
    zIndex: 1
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
    marginTop: 3,
    marginBottom: 4,
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
  warningText: {
    color: theme.palette.colors.zilliqa.warning,
    "& svg": {
      verticalAlign: "middle",
      fontSize: "inherit",
    },
    paddingBottom: theme.spacing(0.5),
  },
  errorText: {
    color: theme.palette.colors.zilliqa.danger,
    "& svg": {
      verticalAlign: "middle",
      fontSize: "inherit",
    }
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  swapIcon: {
    "& path": {
      fill: theme.palette.icon
    }
  },
  iconButton: {
    color: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "#003340",
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    borderRadius: 12,
    padding: 5,
    marginLeft: 5,
  },
  swapIconBox: {
    zIndex: 1,
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start"
    },
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

interface InitTokenProps {
  inToken?: TokenInfo,
  outToken?: TokenInfo
}

const Swap: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const enableChangeRecipient = useSearchParam("enableChangeRecipient") === "true";
  const [buttonRotate, setButtonRotate] = useState(false);
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const network = useNetwork()
  const swapFormState: SwapFormState = useSelector<RootState, SwapFormState>(store => store.swap);
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const walletState = useSelector<RootState, WalletState>(store => store.wallet);
  const layoutState = useSelector<RootState, LayoutState>(store => store.layout);
  const [runSwap, loading, error, clearSwapError] = useAsyncTask("swap");
  const [isBlacklisted] = useBlacklistAddress();
  const [runApproveTx, loadingApproveTx, errorApproveTx, clearApproveError] = useAsyncTask("approveTx");
  const [errorRecipientAddress, setErrorRecipientAddress] = useState<string | undefined>();
  const queryParams = new URLSearchParams(useLocation().search);
  const [recipientAddrBlacklisted, setRecipientAddrBlacklisted] = useState(false);
  const toaster = useToaster();

  useEffect(() => {
    if (!swapFormState.forNetwork) return

    // clear form if network changed
    if (swapFormState.forNetwork !== network) {
      setFormState({
        ...formState,
        inAmount: "0",
        outAmount: "0",
      });
      dispatch(actions.Swap.clearForm());
    }

    // eslint-disable-next-line
  }, [network]);

  useEffect(() => {
    if (inToken || outToken) {
      return;
    }
    const queryInput = queryParams.get("tokenIn") ?? ZIL_ADDRESS;
    const queryOutput = queryParams.get("tokenOut") ?? ZWAP_ADDRESS;
    if (queryInput === queryOutput && queryOutput) {
      return;
    }
    const newIntoken = queryInput ? tokenState.tokens[queryInput] : null;
    const newOuttoken = queryOutput ? tokenState.tokens[queryOutput] : null;

    initNewToken({
      ...newIntoken && {
        inToken: newIntoken,
      },

      ...newOuttoken && {
        outToken: newOuttoken,
      },
    });

    // eslint-disable-next-line
  }, [tokenState.tokens]);

  useEffect(() => {
    const blacklisted = !!swapFormState.recipientAddress ? isBlacklisted(swapFormState.recipientAddress) : false;
    setRecipientAddrBlacklisted(blacklisted)
  }, [swapFormState.recipientAddress, isBlacklisted]);

  const initNewToken = (newTokens: InitTokenProps) => {
    dispatch(actions.Swap.update({
      forNetwork: network,
      ...newTokens,
    }));
  }

  const onReverse = () => {
    setButtonRotate(!buttonRotate);
    const result = calculateAmounts({
      inToken: swapFormState.outToken,
      outToken: swapFormState.inToken,
    });

    if (result.exactOf === "in") {
      onOutAmountChange(result.inAmount.toString(), true)
    } else if (result.exactOf === "out") {
      onInAmountChange(result.outAmount.toString(), true)
    }
  };

  const onPercentage = (percentage: number) => {
    const { inToken } = swapFormState;
    if (!inToken) return;

    const balance = strings.bnOrZero(inToken.balance);
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

  const onOutAmountChange = (amount: string = "0", reverseTokens?: boolean) => {
    let outAmount = new BigNumber(amount);
    if (outAmount.isNaN() || outAmount.isNegative() || !outAmount.isFinite()) outAmount = BIG_ZERO;
    const result = calculateAmounts({
      exactOf: "out",
      outAmount,
      ...reverseTokens && {
        inToken: swapFormState.outToken,
        outToken: swapFormState.inToken,
      },
    });
    setFormState({
      ...formState,
      outAmount: amount,
      inAmount: result.inAmount.toString(),
    });
    dispatch(actions.Swap.update({
      forNetwork: network,
      ...result,
    }));
  };
  const onInAmountChange = (amount: string = "0", reverseTokens?: boolean) => {
    let inAmount = new BigNumber(amount);
    if (inAmount.isNaN() || inAmount.isNegative() || !inAmount.isFinite()) inAmount = BIG_ZERO;
    const result = calculateAmounts({
      exactOf: "in",
      inAmount,
      ...reverseTokens && {
        inToken: swapFormState.outToken,
        outToken: swapFormState.inToken,
      },
    });
    setFormState({
      ...formState,
      inAmount: amount,
      outAmount: result.outAmount.toString(),
    });
    dispatch(actions.Swap.update({
      forNetwork: network,
      ...result,
    }));
  };
  const onOutCurrencyChange = (token: TokenInfo) => {
    if (swapFormState.inToken === token) return;
    if (swapFormState.outToken === token) return;
    let { inToken } = swapFormState;

    if (!token.isZil && !inToken) {
      inToken = tokenState.tokens[ZIL_ADDRESS];
    }

    const result = calculateAmounts({ inToken, outToken: token });

    setFormState({
      ...formState,
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      forNetwork: network,
      ...result,
    }));
  };
  const onInCurrencyChange = (token: TokenInfo) => {
    if (swapFormState.outToken === token) return;
    if (swapFormState.inToken === token) return;
    let { outToken } = swapFormState;

    if (!token.isZil && !outToken) {
      outToken = tokenState.tokens[ZIL_ADDRESS];
    }

    const result = calculateAmounts({ inToken: token, outToken });

    setFormState({
      ...formState,
      outAmount: result.outAmount.toString(),
      inAmount: result.inAmount.toString(),
    });

    dispatch(actions.Swap.update({
      forNetwork: network,
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

      const balance: BigNumber = strings.bnOrZero(inToken.balance)

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
        network,
      };

      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
      toaster("Submitted", { hash: walletObservedTx.hash });
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
        network,
      };
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
      toaster("Submitted", { hash: walletObservedTx.hash });
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
  let showTxApprove = false;
  if (inToken && !inToken?.isZil) {
    const zilswapContractAddress = CONTRACTS[network];
    const byte20ContractAddress = fromBech32Address(zilswapContractAddress).toLowerCase();
    const unitlessInAmount = swapFormState.inAmount.shiftedBy(swapFormState.inToken!.decimals);
    showTxApprove = strings.bnOrZero(inToken?.allowances?.[byte20ContractAddress]).comparedTo(unitlessInAmount) < 0;
  }

  const toggleAdvanceSetting = () => {
    dispatch(actions.Layout.showAdvancedSetting(!layoutState.showAdvancedSetting));
  }

  // Recalculate Exchange Rate
  const refreshRate = () => {
    onInAmountChange(formState.inAmount);
  }

  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Notifications />
      {!layoutState.showAdvancedSetting && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box display="flex" justifyContent="flex-end" mb={1.5}>
            <IconButton onClick={() => toggleAdvanceSetting()} className={classes.iconButton}>
              <BrightnessLowIcon />
            </IconButton>
            <IconButton onClick={() => refreshRate()} className={classes.iconButton}>
              <AutorenewIcon />
            </IconButton>
          </Box>

          <CurrencyInput
            label="From"
            token={inToken || null}
            amount={formState.inAmount}
            disabled={!inToken}
            dialogOpts={{ hideNoPool: true }}
            onEditorBlur={onDoneEditing}
            onAmountChange={onInAmountChange}
            onCurrencyChange={onInCurrencyChange} />
          <Box display="flex" justifyContent="flex-end">
            <ProportionSelect size="small" className={classes.proportionSelect} onSelectProp={onPercentage} />
          </Box>
          <Box display="flex" className={classes.swapIconBox}>
            <IconButton
              disabled={!inToken || !outToken}
              onClick={() => onReverse()}
              className={cls(classes.swapButton, { [classes.rotateSwapButton]: buttonRotate })}>
              <SwapSVG className={classes.swapIcon} />
            </IconButton>
          </Box>
          <CurrencyInput
            label="To"
            token={outToken || null}
            amount={formState.outAmount}
            disabled={!outToken}
            dialogOpts={{ hideNoPool: true }}
            onEditorBlur={onDoneEditing}
            onAmountChange={onOutAmountChange}
            onCurrencyChange={onOutCurrencyChange} />

          {enableChangeRecipient && (
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
                  {recipientAddrBlacklisted && (
                    <Text className={classes.errorText}>
                      <WarningRounded color="error" />  Address appears to be a known CEX/DEX address. Please ensure you have entered a correct address!
                    </Text>
                  )}
                  <Text className={classes.warningText}>
                    <WarningRounded color="inherit" />  Do not send tokens directly to an exchange address as it may result in failure to receive your fund.
                </Text>
                </>
              )}
            </Box>
          )}

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
            disabled={!inToken || !outToken || recipientAddrBlacklisted}
            onClick={onSwap}>
            Swap
          </FancyButton>
          <SwapDetail token={outToken || undefined} />
        </Box>
      )}
      <ShowAdvanced showAdvanced={layoutState.showAdvancedSetting} />
    </MainCard >
  );
};

export default Swap;
