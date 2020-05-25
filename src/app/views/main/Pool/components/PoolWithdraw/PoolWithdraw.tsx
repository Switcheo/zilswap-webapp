
import { Box, Divider, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ContrastBox, CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo, PoolFormState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useMoneyFormatter } from "app/utils";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";
import { BIG_ZERO } from "app/utils/contants";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: theme.spacing(0, 8, 2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2, 2),
    },
  },
  proportionSelect: {
    marginTop: 12,
    marginBottom: 20
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
    marginTop: theme.spacing(6),
    height: 46
  },
  readOnly: {
    backgroundColor: theme.palette.background.readOnly,
    textAlign: "right",
    color: theme.palette.text?.secondary,
    marginBottom: 20
  },
  previewAmount: {
    fontSize: 20,
    lineHeight: "24px",
  },
  advanceDetails: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
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
};

const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
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

  const onPercentage = (percentage: number) => {
    if (!poolToken?.pool) return;
    const pool = poolToken.pool!;

    const balance = new BigNumber(pool.userContribution);
    const amount = balance.times(percentage).decimalPlaces(0);
    onTokenChange(amount.shiftedBy(-poolToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (!token.pool) return;
    dispatch(actions.Pool.selectPool({ token }));
  };

  const onTokenChange = (amount: string = "0") => {
    if (poolToken) {
      if (!poolToken.pool) return;

      const tokenAmount = amount;
      let bnTokenAmount = new BigNumber(amount);
      if (bnTokenAmount.isNegative() || bnTokenAmount.isNaN())
        bnTokenAmount = BIG_ZERO;

      const bnZilAmount = bnTokenAmount.times(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals);
      const zilAmount = bnZilAmount.toString();
      setFormState({ zilAmount, tokenAmount });
      dispatch(actions.Pool.update({
        removeZilAmount: bnZilAmount.shiftedBy(poolToken.decimals),
        removeTokenAmount: bnTokenAmount.shiftedBy(poolToken.decimals),
      }));
    }
  };

  const onRemoveLiquidity = () => {
    if (!poolToken) return;
    if (loading) return;

    runRemoveLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const txReceipt = await ZilswapConnector.removeLiquidity({
        tokenID: tokenAddress,
        contributionAmount: poolFormState.removeZilAmount,
      });

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      console.log({ txReceipt });
    });
  };

  const onDoneEditing = () => {
    setFormState({
      tokenAmount: poolFormState.removeTokenAmount.shiftedBy(-(poolToken?.decimals || 0)).toString(),
      zilAmount: poolFormState.removeZilAmount.shiftedBy(-12).toString(),
    });
  };

  // TODO: fix liquidity token count

  return (
    <Box display="flex" flexDirection="column"  {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <CurrencyInput
          showContribution
          label="Remove"
          token={poolToken}
          amount={formState.tokenAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onTokenChange}
          onCurrencyChange={onPoolChange} />

        <ProportionSelect fullWidth
          color="primary"
          className={classes.proportionSelect}
          onSelectProp={onPercentage} />

        <PoolIcon type="minus" />
        <InputLabel>You Receive (Estimate)</InputLabel>

        <ContrastBox className={classes.readOnly}>
          <Typography className={classes.previewAmount}>
            <span>{formatMoney(poolFormState.removeZilAmount, zilFormatOpts)}</span>
            <span> + {formatMoney(poolFormState.removeTokenAmount, formatOpts)}</span>
          </Typography>
        </ContrastBox>

        <PoolDetail token={poolToken || undefined} />

        <Typography color="error">{error?.message}</Typography>

        <FancyButton walletRequired fullWidth
          loading={loading}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          onClick={onRemoveLiquidity}>
          Remove Liquidity
        </FancyButton>

        <Typography
          variant="body2"
          className={cls(classes.advanceDetails, { [classes.primaryColor]: showAdvanced })}
          onClick={() => setShowAdvanced(!showAdvanced)}>
          Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Typography>
      </Box>

      {!!showAdvanced && (
        <ContrastBox className={classes.showAdvanced}>
          <Typography className={classes.text} variant="body2">
            You are removing{" "}
            {formatMoney(poolFormState.removeZilAmount, zilFormatOpts)} + {formatMoney(poolFormState.removeTokenAmount, formatOpts)}
            from the liquidity pool. (~{formatMoney(formState.tokenAmount, { ...formatOpts, showCurrency: false })} Liquidity tokens)
          </Typography>
          <Divider className={classes.divider} />
          <KeyValueDisplay mt={"22px"} kkey={"Current Total Supply"} value={`${formatMoney(poolToken?.pool?.tokenReserve || 0, { ...formatOpts, compression: 0 })} Liquidity Tokens`} />
          <KeyValueDisplay mt={"22px"} kkey={"Each Pool Token Value"} value={`${formatMoney(poolToken?.pool?.exchangeRate || 0, { ...zilFormatOpts, compression: 0 })} + ${formatMoney(new BigNumber(1).shiftedBy(poolToken?.decimals || 0), formatOpts)}`} />

        </ContrastBox>
      )}
    </Box>
  );
};

export default PoolWithdraw;