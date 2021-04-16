import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
import { toHumanNumber } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";
import Text from "../Text";

interface Props extends BoxProps {
  currency: string;
  address: string;
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
    marginLeft: theme.spacing(1),
  },
}));
const AmountLabel: React.FC<Props> = (props: Props) => {
  const { children, className, amount = BIG_ZERO, currency, address, prefix, hideIcon = false, compression, ...rest } = props;
  const classes = useStyles();

  const decimals = currency === "ZIL" ? 12 : (compression ?? 0)

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Text>{prefix}{toHumanNumber(amount.shiftedBy(-decimals))} {currency}</Text>
      {!hideIcon && (
        <CurrencyLogo className={classes.currencyLogo} currency={currency} address={address} />
      )}
    </Box>
  );
};

export default AmountLabel;
