import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { CurrencyInput, FancyButton, ProportionSelect } from "app/components";
import { actions } from "app/store";
import { PoolFormState, RootState, SwapFormState, TokenInfo, TokenState, WalletObservedTx, WalletState } from "app/store/types";
import { strings, useAsyncTask, useNetwork, useToaster } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACTS } from "zilswap-sdk/lib/constants";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: theme.spacing(0, 4, 2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2, 2),
    },
  },
  proportionSelect: {
    marginTop: 3,
    marginBottom: 4,
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  keyValueLabel: {
    marginTop: theme.spacing(1),
  },
  svg: {
    alignSelf: "center"
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
  poolIcon: {
    margin: 12,
    marginTop: -30,
    marginBottom: 0,
    [theme.breakpoints.down("sm")]: {
      marginTop: -33
    },
  },
  poolIconBox: {
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start"
    },
  }
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
  const network = useNetwork();
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const swapFormState = useSelector<RootState, SwapFormState>(state => state.swap);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  // const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 6 });
  const toaster = useToaster();

  useEffect(() => {
    if (poolToken && currencyDialogOverride) {
      setCurrencyDialogOverride(false);
    }
  }, [poolToken, currencyDialogOverride]);

  useEffect(() => {
    if (!poolFormState.forNetwork) return

    // clear form if network changed
    if (poolFormState.forNetwork !== network) {
      setFormState({
        zilAmount: "0",
        tokenAmount: "0",
      });
      dispatch(actions.Pool.clear());
    }

    // eslint-disable-next-line
  }, [network]);


  const onPercentage = (percentage: number) => {
    if (!poolToken) return;

    const balance = new BigNumber(poolToken.balance?.toString() || 0);
    const intendedAmount = balance.times(percentage - swapFormState.slippage).decimalPlaces(0);
    const netGasAmount = poolToken.isZil ? ZilswapConnector.adjustedForGas(intendedAmount, balance) : intendedAmount;
    onTokenChange(netGasAmount.shiftedBy(-poolToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    dispatch(actions.Pool.select({ token, network }));
    onTokenChange("0");
  };

  const onZilChange = (amount: string = "0") => {
    if (poolToken) {
      const zilAmount = amount;
      let bnZilAmount = new BigNumber(amount);
      if (bnZilAmount.isNegative() || bnZilAmount.isNaN() || !bnZilAmount.isFinite())
        bnZilAmount = BIG_ZERO;

      const zilToken = tokenState.tokens[ZIL_ADDRESS];
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
        forNetwork: network,
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

      const zilToken = tokenState.tokens[ZIL_ADDRESS];
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
        forNetwork: network,
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
      const { slippage } = swapFormState;
      const tokenBalance = strings.bnOrZero(poolToken!.balance).shiftedBy(-poolToken.decimals);
      const zilToken = tokenState.tokens[ZIL_ADDRESS];
      const zilBalance = strings.bnOrZero(zilToken!.balance).shiftedBy(-zilToken.decimals);

      if (addTokenAmount.gt(tokenBalance)) {
        throw new Error(`Insufficient ${poolToken.symbol} balance.`)
      }

      if (addZilAmount.gt(zilBalance)) {
        throw new Error(`Insufficient ZIL balance.`)
      }

      if (addZilAmount.lt(1000)) {
        throw new Error('Minimum contribution is 1000 ZILs.')
      }

      if (zilBalance.minus(addZilAmount).lt(5)) {
        throw new Error('Please reserve at least 5 ZIL to pay for transaction fees.')
      }

      ZilswapConnector.setDeadlineBlocks(swapFormState.expiry);

      const observedTx = await ZilswapConnector.addLiquidity({
        tokenAmount: addTokenAmount.shiftedBy(poolToken.decimals),
        zilAmount: addZilAmount.shiftedBy(zilToken.decimals),
        tokenID: tokenAddress,
        maxExchangeRateChange: toBasisPoints(slippage).toNumber(),
      });
      const walletObservedTx: WalletObservedTx = {
        ...observedTx,
        address: walletState.wallet?.addressInfo.bech32 || "",
        network,
      };

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
      toaster("Submitted", { hash: walletObservedTx.hash });
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
      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: walletState.wallet?.addressInfo.bech32 || "",
        network,
      };

      if (!observedTx)
        throw new Error("Allowance already sufficient for specified amount");
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
      toaster("Submitted", { hash: walletObservedTx.hash });
    });
  };

  const onDoneEditing = () => {
    setFormState({
      tokenAmount: poolFormState.addTokenAmount.toString(),
      zilAmount: poolFormState.addZilAmount.toString(),
    });
  };

  const zilswapContractAddress = CONTRACTS[network];
  const byte20ContractAddress = fromBech32Address(zilswapContractAddress).toLowerCase();
  let showTxApprove = false;
  if (poolToken) {
    const addTokenUnitlessAmount = poolFormState.addTokenAmount.shiftedBy(poolToken.decimals);
    showTxApprove = strings.bnOrZero(poolToken.allowances?.[byte20ContractAddress]).comparedTo(addTokenUnitlessAmount) < 0
  }

  return (
    <Box display="flex" flexDirection="column" {...rest} className={clsx(classes.root, className)}>
      <Box className={classes.container}>
        <CurrencyInput
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

        <Box display="flex" justifyContent="flex-end">
          <ProportionSelect
            color="primary"
            size="small"
            className={classes.proportionSelect}
            onSelectProp={onPercentage} />
        </Box>

        <Box display="flex" className={classes.poolIconBox}>
          <PoolIcon type="plus" className={classes.poolIcon} />
        </Box>

        <CurrencyInput fixedToken
          label="Deposit"
          token={tokenState.tokens[ZIL_ADDRESS]}
          amount={formState.zilAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onZilChange} />

        <Typography color="error" className={classes.errorMessage}>{error?.message || errorApproveTx?.message}</Typography>

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
        <PoolDetail token={poolToken || undefined} />
      </Box>
    </Box>
  );
};

export default PoolDeposit;
