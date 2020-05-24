
import { Box, Button, ButtonGroup, InputLabel, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ContrastBox, CurrencyInput, FancyButton } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShowAdvanced } from "./components";
import { ReactComponent as MinusSVG } from "./minus_pool.svg";
import { ReactComponent as MinusSVGDark } from "./minus_pool_dark.svg";

const initialFormState = {
  zilAmount: new BigNumber(0),
  tokenAmount: new BigNumber(0),
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
}));
const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [runRemoveLiquidity, loading, error] = useAsyncTask("poolRemoveLiquidity");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const theme = useTheme<AppTheme>();

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
    dispatch(actions.Pool.selectPool({ token }));
  };

  const onTokenChange = (amount: string = "0") => {
    console.log(amount);
    const value = new BigNumber(amount);
    if (poolToken) {
      if (!poolToken.pool) return;
      setFormState({
        zilAmount: value.times(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals),
        tokenAmount: value,
      })
    }
  };

  const onRemoveLiquidity = () => {
    if (!poolToken) return;
    if (loading) return;

    runRemoveLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const txReceipt = await ZilswapConnector.removeLiquidity({
        tokenID: tokenAddress,
        contributionAmount: formState.tokenAmount.times(Math.pow(10, poolToken.decimals)),
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
    <Box display="flex" flexDirection="column"  {...rest} className={cls(classes.root, className)}>
      <CurrencyInput
        showContribution
        label="Remove"
        token={poolToken}
        amount={formState.tokenAmount}
        onAmountChange={onTokenChange}
        onCurrencyChange={onPoolChange} />
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
      {theme.palette.type === "light" ? <MinusSVG className={classes.svg} /> : <MinusSVGDark className={classes.svg} />}
      <InputLabel>You Receive (Estimate)</InputLabel>
      <ContrastBox className={classes.readOnly}>
        <Typography>0.00</Typography>
      </ContrastBox>

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
      <ShowAdvanced show={showAdvanced} />
    </Box>
  );
};

export default PoolWithdraw;