import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";
import Text from "../Text";

interface Props extends BoxProps {
  currency: string;
  amount?: BigNumber;
  compression?: number;
  hideIcon?: boolean;
  prefix?: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  currencyLogo: {
    width: "2em",
    marginRight: theme.spacing(1),
  },
}));
const AmountLabel: React.FC<Props> = (props: Props) => {
  const { children, className, amount = BIG_ZERO, currency, prefix, hideIcon = false, compression, ...rest } = props;
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, currency, showCurrency: true, compression });
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {!hideIcon && (
        <CurrencyLogo className={classes.currencyLogo} currency={currency} />
      )}
      <Text>{prefix}{moneyFormat(amount)}</Text>
    </Box>
  );
};

export default AmountLabel;
