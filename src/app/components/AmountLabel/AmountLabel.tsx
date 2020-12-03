import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";
import Text from "../Text";

interface Props extends BoxProps {
  currency: string;
  amount: BigNumber;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
  },
  currencyLogo: {
    width: "1em",
    marginRight: theme.spacing(1),
  },
}));
const AmountLabel: React.FC<Props> = (props: Props) => {
  const { children, className, amount, currency, ...rest } = props;
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, currency, showCurrency: true });
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <CurrencyLogo className={classes.currencyLogo} currency={currency} />
      <Text>{moneyFormat(amount)}</Text>
    </Box>
  );
};

export default AmountLabel;
