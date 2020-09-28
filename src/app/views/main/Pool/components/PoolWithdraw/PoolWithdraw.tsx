
import { Box, Divider, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ContrastBox, CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect } from "app/components";
import { actions } from "app/store";
import { PoolFormState, RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/contants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: theme.spacing(0, 8, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2, 0),
    },
  },
  proportionSelect: {
    marginTop: 12,
  },
  input: {
    marginTop: 12,
    marginBottom: 20
  },
  svg: {
    alignSelf: "center",
    marginBottom: 12
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  readOnly: {
    backgroundColor: theme.palette.background.readOnly,
    textAlign: "right",
    color: theme.palette.text?.primary,
    padding: theme.spacing(2, 3),
  },
  previewAmount: {
    fontSize: 20,
    lineHeight: "24px",
  },
  keyValueLabel: {
    marginTop: theme.spacing(1),
  },
  poolDetails: {
    marginTop: theme.spacing(2),
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
  showAdvanced: {
    padding: theme.spacing(2.5, 8, 6.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2.5, 2, 6.5),
    },
  },
  text: {
    fontWeight: 400,
    letterSpacing: 0
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
}));

const initialFormState = {
  zilAmount: "0",
  tokenAmount: "0",
  removePercentage: BIG_ZERO,
};

const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [currencyDialogOverride, setCurrencyDialogOverride] = useState<boolean>(false);
  const [runRemoveLiquidity, loading, error] = useAsyncTask("poolRemoveLiquidity");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 5 });

  const zilFormatOpts: MoneyFormatterOptions = {
    symbol: "ZIL",
    compression: 12,
  };
  const formatOpts: MoneyFormatterOptions = {
    symbol: poolToken?.symbol,
    compression: poolToken?.decimals,
  };

  useEffect(() => {
    if (poolToken && currencyDialogOverride) {
      setCurrencyDialogOverride(false);
    }
  }, [poolToken, currencyDialogOverride]);

  const onPercentage = (percentage: number) => {
    if (!poolToken?.pool) return;
    const pool = poolToken.pool!;

    const balance = new BigNumber(pool.userContribution);
    const amount = balance.times(percentage).decimalPlaces(0);
    onTokenChange(amount.shiftedBy(-poolToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (!token.pool) return;
    dispatch(actions.Pool.select({ token }));
    onTokenChange("0");
  };

  const onTokenChange = (amount: string = "0") => {
    if (poolToken?.pool) {
      const tokenAmount = amount;
      let bnTokenAmount = new BigNumber(amount);
      if (bnTokenAmount.isNegative() || bnTokenAmount.isNaN())
        bnTokenAmount = BIG_ZERO;

      const bnZilAmount = bnTokenAmount.times(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals);
      const zilAmount = bnZilAmount.toString();
      const removePercentage = bnTokenAmount.shiftedBy(poolToken.decimals).div(poolToken.pool?.totalContribution || BIG_ONE);
      setFormState({ zilAmount, tokenAmount, removePercentage });
      dispatch(actions.Pool.update({
        removeZilAmount: bnZilAmount.shiftedBy(poolToken.decimals),
        removeTokenAmount: bnTokenAmount.shiftedBy(poolToken.decimals),
      }));
    }
  };

  const onRemoveLiquidity = () => {
    if (!poolToken) return setCurrencyDialogOverride(true);
    if (poolFormState.removeTokenAmount.isZero()) return;
    if (loading) return;

    runRemoveLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const observedTx = await ZilswapConnector.removeLiquidity({
        tokenID: tokenAddress,
        contributionAmount: poolFormState.removeTokenAmount,
      });

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      dispatch(actions.Transaction.observe({ observedTx }));
    });
  };

  const onDoneEditing = () => {
    setFormState({
      tokenAmount: poolFormState.removeTokenAmount.shiftedBy(-(poolToken?.decimals || 0)).toString(),
      zilAmount: poolFormState.removeZilAmount.shiftedBy(-12).toString(),
      removePercentage: formState.removePercentage,
    });
  };

  const getReceiveAmount = (inputType: "zil" | "zrc2") => {
    if (inputType !== "zil" && inputType !== "zrc2") return BIG_ZERO;
    const total = inputType === "zil" ? (poolToken?.pool?.zilReserve) : (poolToken?.pool?.tokenReserve);
    return formState.removePercentage.times(total || BIG_ZERO);
  };

  const liquidityTokenRate = poolToken?.pool?.totalContribution.isPositive() ? poolToken!.pool!.tokenReserve.div(poolToken!.pool!.totalContribution) : BIG_ZERO;

  return (
    <Box display="flex" flexDirection="column"  {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <CurrencyInput
          hideBalance
          showCurrencyDialog={currencyDialogOverride}
          onCloseDialog={() => setCurrencyDialogOverride(false)}
          label="Remove"
          token={poolToken}
          amount={formState.tokenAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onTokenChange}
          onCurrencyChange={onPoolChange}
          dialogOpts={{
            hideNoPool: true,
            hideZil: true,
          }} />

        <ProportionSelect fullWidth
          color="primary"
          className={classes.proportionSelect}
          onSelectProp={onPercentage} />

        <KeyValueDisplay className={classes.keyValueLabel} hideIfNoValue kkey="In Pool">
          {!!poolToken && formatMoney(poolToken?.pool?.userContribution || 0, formatOpts)}
        </KeyValueDisplay>

        <PoolIcon type="minus" />
        <InputLabel>You Receive (Estimate)</InputLabel>

        <ContrastBox className={classes.readOnly}>
          <Typography className={classes.previewAmount}>
            <span>{formatMoney(getReceiveAmount("zil"), zilFormatOpts)}</span>
            <span> + {formatMoney(getReceiveAmount("zrc2"), formatOpts)}</span>
          </Typography>
        </ContrastBox>

        <PoolDetail className={classes.poolDetails} token={poolToken || undefined} />

        <Typography color="error">{error?.message}</Typography>

        <FancyButton walletRequired
          loading={loading}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          onClick={onRemoveLiquidity}>
          Remove Liquidity
        </FancyButton>

        {!!poolToken ? (
          <Typography
            variant="body2"
            className={cls(classes.advanceDetails, { [classes.primaryColor]: showAdvanced })}
            onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Typography>
        ) : <Box component="div" display="block" style={{height: 16}}>&nbsp;</Box>}
      </Box>

      {!!showAdvanced && !!poolToken && (
        <ContrastBox className={classes.showAdvanced}>
          <Typography className={classes.text} variant="body2">
            You are removing{" "}
            <strong>{formatMoney(getReceiveAmount("zil"), zilFormatOpts)} + {formatMoney(getReceiveAmount("zrc2"), formatOpts)}</strong>
            from the liquidity pool.{" "}
            <strong>(~{formatMoney(poolFormState.removeTokenAmount, { ...formatOpts, showCurrency: true })} Pool Token)</strong>
          </Typography>
          <Divider className={classes.divider} />
          <KeyValueDisplay mt={"22px"} kkey={"Current Total Supply"}>
            {formatMoney(poolToken?.pool?.tokenReserve || 0, { ...formatOpts })} Pool Token
          </KeyValueDisplay>
          <KeyValueDisplay mt={"8px"} kkey={"Each Pool Token Value"}>
            {formatMoney(new BigNumber(liquidityTokenRate).times(poolToken?.pool?.exchangeRate || 0), { ...zilFormatOpts, compression: 0 })}
            {" "}+{" "}
            {formatMoney(new BigNumber(liquidityTokenRate).shiftedBy(poolToken?.decimals || 0), formatOpts)}
          </KeyValueDisplay>

        </ContrastBox>
      )}
    </Box>
  );
};

export default PoolWithdraw;
