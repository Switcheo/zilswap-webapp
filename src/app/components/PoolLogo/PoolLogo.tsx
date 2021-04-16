import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";

interface Props extends BoxProps {
  pair: [string, string];
  tokenAddress: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  poolIcon: {
    borderRadius: '50%',
    backgroundColor: theme.palette.type === "dark" ? "#303637": "#F7FAFA",
    padding: 4
  },
  baseIcon: {
    marginLeft: -10,
  },
}));
const PoolLogo: React.FC<Props> = (props: Props) => {
  const { children, className, pair, tokenAddress, ...rest } = props;
  const [quote, base] = pair
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <CurrencyLogo className={cls(classes.baseIcon, classes.poolIcon)} currency={base} />
      <CurrencyLogo className={classes.poolIcon} currency={quote} address={tokenAddress} />
    </Box>
  );
};

export default PoolLogo;
