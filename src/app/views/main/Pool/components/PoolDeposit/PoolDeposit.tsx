import { Box, Button, ButtonGroup, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import { useMoneyFormatter } from "app/utils";
import cls from "classnames";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import CurrencyInput from "../CurrencyInput";
import { ReactComponent as PlusSVG } from "./plus_pool.svg";
import { ReactComponent as PlusSVGDark } from "./plus_pool_dark.svg";
import { FancyButton } from "app/components";
import { actions } from "app/store";
import { ZIL_TOKEN_NAME } from "app/utils/contants";

const useStyles = makeStyles(theme => ({
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
  const theme = useTheme();
  const dispatch = useDispatch();
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const onPoolChange = (token: TokenInfo) => {
    dispatch(actions.Pool.selectPool({ token }));
  };

  const onAddLiquidity = () => {

  };

  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <CurrencyInput fixedToZil token={tokenState.tokens[ZIL_TOKEN_NAME]} amount={0} label="Deposit" />
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
      {theme.palette.type === "light" ? <PlusSVG className={classes.svg} /> : <PlusSVGDark className={classes.svg} />}
      <CurrencyInput
        label="Deposit"
        token={poolToken}
        amount={0}
        className={classes.input}
        onCurrencyChange={onPoolChange} />
      <FancyButton
        walletRequired
        className={classes.actionButton}
        variant="contained"
        color="primary"
        fullWidth
        onClick={onAddLiquidity}>
        Add Liquidity
      </FancyButton>
    </Box>
  );
};

export default PoolDeposit;