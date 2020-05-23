import { Box, Button, ButtonGroup, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import { useMoneyFormatter } from "app/utils";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";
import CurrencyInput from "../CurrencyInput";
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
  svg: {
    alignSelf: "center"
  },
}));
const PoolDeposit: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const deposit1Currency = useSelector<RootState, string>(state => state.pool.values.deposit1Currency)
  const depositCurrency = useSelector<RootState, string>(state => state.pool.values.depositCurrency)
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const exchangeRate = (walletState.currencies![deposit1Currency] && walletState.currencies![deposit1Currency].exchangeRate) || 0;
  const moneyFormat = useMoneyFormatter({ decPlaces: 10 });

  const depositRightLabel = walletState && walletState.currencies![depositCurrency] && walletState.currencies![depositCurrency].balance >= 0 ?
    `Balance: ${moneyFormat(walletState.currencies![depositCurrency].balance, { currency: depositCurrency }).toLocaleString("en-US", { maximumFractionDigits: 10 })}` : "";
  const deposit1RightLabel = walletState && walletState.currencies![deposit1Currency] && walletState.currencies![deposit1Currency].balance >= 0 ?
    `Balance: ${moneyFormat(walletState.currencies![deposit1Currency].balance, { currency: deposit1Currency }).toLocaleString("en-US", { maximumFractionDigits: 10 })}` : "";


  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <CurrencyInput
        exchangeRate={exchangeRate}
        rightLabel={depositRightLabel}
        fixed
        exclude={deposit1Currency}
        label="Deposit"
        name="deposit"
      >
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
      </CurrencyInput>
      {theme.palette.type === "light" ? <PlusSVG className={classes.svg} /> : <PlusSVGDark className={classes.svg} />}
      <CurrencyInput
        exchangeRate={exchangeRate}
        exclude={depositCurrency}
        rightLabel={deposit1RightLabel}
        label="Deposit"
        name="deposit1"
        className={classes.input}
      />
    </Box>
  );
};

export default PoolDeposit;