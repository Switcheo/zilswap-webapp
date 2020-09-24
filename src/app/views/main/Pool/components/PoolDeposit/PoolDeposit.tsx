import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyInput, FancyButton, ProportionSelect, KeyValueDisplay } from "app/components";
import { actions } from "app/store";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { RootState, TokenInfo, TokenState, PoolFormState } from "app/store/types";
import { useAsyncTask, useMoneyFormatter } from "app/utils";
import { ZIL_TOKEN_NAME, BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACTS, Network } from "zilswap-sdk/lib/constants";
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
    margin: theme.spacing(1.5, 0, 0),
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  keyValueLabel: {
    marginTop: theme.spacing(1),
  },
  poolDetails: {
    marginTop: theme.spacing(2),
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
  const [currencyDialogOverride, setCurrencyDialogOverride] = useState<boolean>(false);
  const [runAddLiquidity, loading, error, clearPoolError] = useAsyncTask("poolAddLiquidity");
  const [runApproveTx, loadingApproveTx, errorApproveTx, clearApproveError] = useAsyncTask("approveTx");
  const dispatch = useDispatch();
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 5 });

  useEffect(() => {
    if (poolToken && currencyDialogOverride) {
      setCurrencyDialogOverride(false);
    }
  }, [poolToken, currencyDialogOverride]);

  const onPercentage = (percentage: number) => {
    if (!poolToken) return;

    const balance = new BigNumber(poolToken.balance.toString());
    const intendedAmount = balance.times(percentage).decimalPlaces(0);
    const netGasAmount = poolToken.isZil ? ZilswapConnector.adjustedForGas(intendedAmount, balance) : intendedAmount;
    onTokenChange(netGasAmount.shiftedBy(-poolToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    dispatch(actions.Pool.select({ token }));
    onTokenChange("0");
  };

  const onZilChange = (amount: string = "0") => {
    if (poolToken) {
      const zilAmount = amount;
      let bnZilAmount = new BigNumber(amount);
      if (bnZilAmount.isNegative() || bnZilAmount.isNaN() || !bnZilAmount.isFinite())
        bnZilAmount = BIG_ZERO;

      const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
      const rate = poolToken.pool?.exchangeRate.shiftedBy(poolToken!.decimals - zilToken.decimals);
      let bnTokenAmount = bnZilAmount.div(rate || 1).decimalPlaces(poolToken.decimals);
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

      const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
      const rate = poolToken.pool?.exchangeRate.shiftedBy(poolToken!.decimals - zilToken.decimals);
      let bnZilAmount = bnTokenAmount.times(rate || 1).decimalPlaces(zilToken?.decimals || 12);
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
    if (!poolToken) return setCurrencyDialogOverride(true);
    if (poolFormState.addTokenAmount.isZero()) return;
    if (loading) return;

    clearApproveError();

    runAddLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const { addTokenAmount, addZilAmount } = poolFormState;
      const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
      const observedTx = await ZilswapConnector.addLiquidity({
        tokenAmount: addTokenAmount.shiftedBy(poolToken.decimals),
        zilAmount: addZilAmount.shiftedBy(zilToken.decimals),
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

  const onApproveTx = () => {
    if (!poolToken) return;
    if (poolFormState.addTokenAmount.isZero()) return;
    if (loading) return;

    clearPoolError();

    runApproveTx(async () => {
      const tokenAddress = poolToken.address;
      const { addTokenAmount } = poolFormState;
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: addTokenAmount.shiftedBy(poolToken!.decimals),
        tokenID: tokenAddress,
      });

      if (!observedTx)
        throw new Error("Allowance already sufficient for specified amount");
      dispatch(actions.Transaction.observe({ observedTx }));
    });
  };

  const onDoneEditing = () => {
    setFormState({
      tokenAmount: poolFormState.addTokenAmount.toString(),
      zilAmount: poolFormState.addZilAmount.toString(),
    });
  };

  const zilswapContractAddress = CONTRACTS[ZilswapConnector.network || Network.TestNet];
  const byte20ContractAddress = fromBech32Address(zilswapContractAddress).toLowerCase();
  const showTxApprove = new BigNumber(poolToken?.allowances[byte20ContractAddress] || "0").comparedTo(poolFormState.addTokenAmount) < 0;

  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>

        <CurrencyInput
          hideBalance
          label="Deposit"
          token={poolToken}
          showCurrencyDialog={currencyDialogOverride}
          onCloseDialog={() => setCurrencyDialogOverride(false)}
          amount={formState.tokenAmount.toString()}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onTokenChange}
          onCurrencyChange={onPoolChange}
          dialogOpts={{ hideZil: true }} />

        <ProportionSelect fullWidth
          color="primary"
          className={classes.proportionSelect}
          onSelectProp={onPercentage} />

        <KeyValueDisplay
          className={classes.keyValueLabel}
          hideIfNoValue
          kkey="You Have">
          {!!poolToken &&
            formatMoney(poolToken?.balance.toString(), {
              symbol: poolToken?.symbol,
              compression: poolToken?.decimals,
            })}
        </KeyValueDisplay>


        <PoolIcon type="plus" />

        <CurrencyInput fixedToZil
          label="Deposit"
          token={tokenState.tokens[ZIL_TOKEN_NAME]}
          amount={formState.zilAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onZilChange} />

        <PoolDetail className={classes.poolDetails} token={poolToken || undefined} />

        <Typography color="error">{error?.message || errorApproveTx?.message}</Typography>
        <FancyButton
          loading={loading}
          walletRequired
          showTxApprove={showTxApprove}
          loadingTxApprove={loadingApproveTx}
          onClickTxApprove={onApproveTx}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          onClick={onAddLiquidity}>
          Add Liquidity
      </FancyButton>
      </Box>
    </Box>
  );
};

export default PoolDeposit;
