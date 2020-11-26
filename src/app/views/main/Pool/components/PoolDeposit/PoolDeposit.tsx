import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { CurrencyInput, FancyButton, KeyValueDisplay, ProportionSelect, StatefulText } from "app/components";
import { actions } from "app/store";
import { LayoutState, PoolFormState, RootState, SwapFormState, TokenInfo, TokenState, WalletObservedTx, WalletState } from "app/store/types";
import { useAsyncTask, useMoneyFormatter, strings } from "app/utils";
import { BIG_ZERO, DefaultFallbackNetwork, ZIL_TOKEN_NAME } from "app/utils/contants";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACTS } from "zilswap-sdk/lib/constants";
import PoolAdvancedDetails from "../PoolAdvancedDetails";
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
  errorMessage: {
    marginTop: theme.spacing(1),
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
  const swapFormState = useSelector<RootState, SwapFormState>(state => state.swap);
  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 6 });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (poolToken && currencyDialogOverride) {
      setCurrencyDialogOverride(false);
    }
  }, [poolToken, currencyDialogOverride]);

  useEffect(() => {
    if (!poolFormState.forNetwork) return

    // clear form if network changed
    if (poolFormState.forNetwork !== layoutState.network) {
      setFormState({
        zilAmount: "0",
        tokenAmount: "0",
      });
      dispatch(actions.Pool.clear());
    }

    // eslint-disable-next-line
  }, [layoutState.network]);


  const onPercentage = (percentage: number) => {
    if (!poolToken) return;

    const balance = new BigNumber(poolToken.balance?.toString() || 0);
    const intendedAmount = balance.times(percentage).decimalPlaces(0);
    const netGasAmount = poolToken.isZil ? ZilswapConnector.adjustedForGas(intendedAmount, balance) : intendedAmount;
    onTokenChange(netGasAmount.shiftedBy(-poolToken.decimals).toString());
  };

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    const network = ZilswapConnector.network;
    dispatch(actions.Pool.select({ token, network }));
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
        forNetwork: ZilswapConnector.network,
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
        forNetwork: ZilswapConnector.network,
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
      const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
      const zilBalance = strings.bnOrZero(poolToken!.balance).shiftedBy(-zilToken.decimals);

      if (addTokenAmount.gt(tokenBalance)) {
        throw new Error(`Insufficient ${poolToken.symbol} balance.`)
      }

      if (addZilAmount.gt(zilBalance)) {
        throw new Error(`Insufficient ZIL balance.`)
      }

      if (addZilAmount.lt(1000)) {
        throw new Error('Minimum contribution is 1000 ZILs.')
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
        network: walletState.wallet?.network || DefaultFallbackNetwork,
      };

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
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
        network: walletState.wallet?.network || DefaultFallbackNetwork,
      };

      if (!observedTx)
        throw new Error("Allowance already sufficient for specified amount");
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  const onDoneEditing = () => {
    setFormState({
      tokenAmount: poolFormState.addTokenAmount.toString(),
      zilAmount: poolFormState.addZilAmount.toString(),
    });
  };

  const zilswapContractAddress = CONTRACTS[ZilswapConnector.network || DefaultFallbackNetwork];
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
          kkey="You Have"
          ValueComponent="span">
          {!!poolToken && (
            <StatefulText loadingKey={`rueryTokenBalance-${poolToken.address}`}>
              <Typography color="textSecondary" variant="body2">
                {formatMoney(poolToken?.balance?.toString(), {
                  symbol: poolToken?.symbol,
                  compression: poolToken?.decimals,
                })}
              </Typography>
            </StatefulText>
          )}
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
      </Box>
      <Typography
        variant="body2" className={clsx(classes.advanceDetails, { [classes.primaryColor]: showAdvanced })}
        onClick={() => setShowAdvanced(!showAdvanced)}>
        Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <PoolAdvancedDetails show={showAdvanced} />
    </Box>
  );
};

export default PoolDeposit;
