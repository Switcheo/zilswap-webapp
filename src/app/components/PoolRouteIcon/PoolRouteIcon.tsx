import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import CurrencyLogo from "../CurrencyLogo";

interface Props extends BoxProps {
  route?: string[]
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  icon: {
    "&:not(:last-child)": {
      marginLeft: theme.spacing(-1),
    },
  },
}));
const PoolRouteIcon: React.FC<Props> = (props: Props) => {
  const { children, className, route = [], ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {route.reverse().map((currency, index) => (
        <CurrencyLogo
          key={index}
          className={classes.icon}
          currency={currency} />
      ))}
    </Box>
  );
};

export default PoolRouteIcon;
