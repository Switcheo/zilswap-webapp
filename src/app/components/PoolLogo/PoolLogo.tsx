import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";

interface Props extends BoxProps {
  pair: [string, string];
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  baseIcon: {
    marginLeft: theme.spacing(-1)
  },
}));
const PoolLogo: React.FC<Props> = (props: Props) => {
  const { children, className, pair, ...rest } = props;
  const [quote, base] = pair
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <CurrencyLogo className={classes.baseIcon} currency={base} />
      <CurrencyLogo currency={quote} />
    </Box>
  );
};

export default PoolLogo;
