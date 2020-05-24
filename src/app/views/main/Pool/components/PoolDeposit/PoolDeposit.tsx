import { Box, Button, ButtonGroup, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyInput, FancyButton } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { ZIL_TOKEN_NAME } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";

const initialFormState = {
  zilAmount: new BigNumber(0),
  tokenAmount: new BigNumber(0),
};

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
  percentageButton: {
    borderRadius: 4,
    color: theme.palette.text?.secondary,
    paddingTop: 10,
    paddingBottom: 10
  },
  percentageGroup: {
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
const PoolDeposit: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [runAddLiquidity, loading, error] = useAsyncTask("poolAddLiquidity");
  const dispatch = useDispatch();
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    dispatch(actions.Pool.selectPool({ token }));
  };

  const onZilChange = (amount: string = "0") => {
    const value = new BigNumber(amount);
    if (poolToken) {
      if (!poolToken.pool) return;
      setFormState({
        zilAmount: value,
        tokenAmount: value.div(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals)
      })
    }
  };

  const onTokenChange = (amount: string = "0") => {
    const value = new BigNumber(amount);
    if (poolToken) {
      if (!poolToken.pool) return;
      setFormState({
        zilAmount: value.times(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals),
        tokenAmount: value,
      })
    }
  };

  const onAddLiquidity = () => {
    if (!poolToken) return;
    if (loading) return;

    runAddLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const txReceipt = await ZilswapConnector.addLiquidity({
        tokenAmount: formState.tokenAmount,
        zilAmount: formState.zilAmount,
        tokenID: tokenAddress,
      });

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      console.log({ txReceipt });
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
          onAmountChange={onZilChange} />
        <ButtonGroup fullWidth color="primary" className={classes.percentageGroup}>
          <Button className={classes.percentageButton}>
            <Typography variant="button">25%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">50%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">75%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">100%</Typography>
          </Button>
        </ButtonGroup>
        <PoolIcon type="plus" />
        <CurrencyInput
          label="Deposit"
          token={poolToken}
          amount={formState.tokenAmount}
          className={classes.input}
          disabled={!poolToken}
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