import { Box, Button, ButtonGroup, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyInput, FancyButton } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { ZIL_TOKEN_NAME } from "app/utils/contants";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import { ReactComponent as PlusSVG } from "./plus_pool.svg";
import { ReactComponent as PlusSVGDark } from "./plus_pool_dark.svg";

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

  const onPoolChange = (token: TokenInfo) => {
    if (token.symbol === "ZIL") return;
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
      <PoolDetail token={poolToken || undefined} />
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