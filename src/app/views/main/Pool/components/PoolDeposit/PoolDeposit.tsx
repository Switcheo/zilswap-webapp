import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyInput, FancyButton, ProportionSelect } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo, TokenState, PoolFormState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { ZIL_TOKEN_NAME, BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";

const useStyles = makeStyles(theme => ({
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
  actionButton: {
    marginTop: 45,
    marginBottom: 40,
    height: 46
  },
  svg: {
    alignSelf: "center"
  },
}));

const initialFormState = {
  zilAmount: "0",
  tokenAmount: "0",
};

const PoolDeposit: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [runAddLiquidity, loading, error] = useAsyncTask("poolAddLiquidity");
  const dispatch = useDispatch();
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const onPercentage = (percentage: number) => {
    const zilToken = tokenState.tokens.zil;
    if (!zilToken) return;

    const balance = new BigNumber(zilToken.balance.toString());
    const amount = balance.times(percentage).decimalPlaces(0);
    onZilChange(amount.shiftedBy(-zilToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    dispatch(actions.Pool.selectPool({ token }));
  };

  const onZilChange = (amount: string = "0") => {
    if (poolToken) {
      const zilAmount = amount;
      let bnZilAmount = new BigNumber(amount);
      if (bnZilAmount.isNegative() || bnZilAmount.isNaN() || !bnZilAmount.isFinite())
        bnZilAmount = BIG_ZERO;

      let bnTokenAmount = bnZilAmount.div(poolToken.pool?.exchangeRate || 1).decimalPlaces(poolToken.decimals);
      const tokenAmount = bnTokenAmount.toString();

      setFormState({
        ...formState,
        zilAmount,

        // only update counter currency if exchange rate is available
        ...poolToken.pool && { tokenAmount },
      });

      dispatch(actions.Pool.update({
        addZilAmount: bnZilAmount,

        // only update counter currency if exchange rate is available
        ...poolToken.pool && { addTokenAmount: bnTokenAmount },
      }));
    }
  };

  const onTokenChange = (amount: string = "0") => {
    if (poolToken) {
      const tokenAmount = amount;
      let bnTokenAmount = new BigNumber(amount);
      if (bnTokenAmount.isNegative() || bnTokenAmount.isNaN() || !bnTokenAmount.isFinite())
        bnTokenAmount = BIG_ZERO;

      let bnZilAmount = bnTokenAmount.div(poolToken.pool?.exchangeRate || 1).decimalPlaces(tokenState.tokens.zil?.decimals || 12);
      const zilAmount = bnZilAmount.toString();

      setFormState({
        ...formState,
        tokenAmount,

        // only update counter currency if exchange rate is available
        ...poolToken.pool && { zilAmount },
      });

      dispatch(actions.Pool.update({
        addTokenAmount: bnTokenAmount,

        // only update counter currency if exchange rate is available
        ...poolToken.pool && { addZilAmount: bnZilAmount },
      }));
    }
  };

  const onAddLiquidity = () => {
    if (!poolToken) return;
    if (loading) return;

    runAddLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const { addTokenAmount, addZilAmount } = poolFormState;
      const observedTx = await ZilswapConnector.addLiquidity({
        tokenAmount: addTokenAmount.shiftedBy(poolToken.decimals),
        zilAmount: addZilAmount.shiftedBy(tokenState.tokens.zil.decimals),
        tokenID: tokenAddress,
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
      tokenAmount: poolFormState.addTokenAmount.toString(),
      zilAmount: poolFormState.addZilAmount.toString(),
    });
  };

  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <CurrencyInput fixedToZil
          label="Deposit"
          token={tokenState.tokens[ZIL_TOKEN_NAME]}
          amount={formState.zilAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onZilChange} />

        <ProportionSelect fullWidth
          color="primary"
          className={classes.proportionSelect}
          onSelectProp={onPercentage} />

        <PoolIcon type="plus" />

        <CurrencyInput
          label="Deposit"
          token={poolToken}
          amount={formState.tokenAmount.toString()}
          className={classes.input}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onTokenChange}
          onCurrencyChange={onPoolChange} />
        <PoolDetail token={poolToken || undefined} />

        <Typography color="error">{error?.message}</Typography>
        <FancyButton
          loading={loading}
          walletRequired
          className={classes.actionButton}
          variant="contained"
          color="primary"
          fullWidth
          onClick={onAddLiquidity}>
          Add Liquidity
      </FancyButton>
      </Box>
    </Box>
  );
};

export default PoolDeposit;