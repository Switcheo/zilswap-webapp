import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NotificationBox } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as WarningLogo } from "./warning_logo.svg";

export interface AddLiquidityEarnMessageProps extends React.HTMLAttributes<HTMLDivElement> {
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationSymbol: {
    margin: theme.spacing(1.5, 3, 0),
  },
  warning: {
    alignItems: "start"
  },
}));

const AddLiquidityEarnMessage: React.FC<AddLiquidityEarnMessageProps> = (props: AddLiquidityEarnMessageProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <NotificationBox {...rest} className={cls(classes.root, className)}>
      <Box className={cls(classes.notificationSymbol, classes.warning)}>
        <WarningLogo />
      </Box>
      <Box ml={1}>
        <Typography color="textSecondary" variant="body1">
          By adding liquidity, you will earn 0.3% of all 
          trades on pairs proportional to your share of 
          the pool. Earn fees are added to the pool and 
          claimable by removing liquidity.
        </Typography>
      </Box>
    </NotificationBox>
  );
};

export default AddLiquidityEarnMessage;
