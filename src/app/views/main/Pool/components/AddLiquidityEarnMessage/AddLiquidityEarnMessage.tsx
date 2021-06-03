import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NotificationBox } from "app/components";
import { actions } from "app/store";
import { LayoutState, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as Icon } from "./receive_money.svg";

export interface AddLiquidityEarnMessageProps extends React.HTMLAttributes<HTMLDivElement> {
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(1, 0),
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["200"] : theme.palette.colors.zilliqa.neutral["100"]
  },
  notificationSymbol: {
    margin: theme.spacing(1, 1.5, 0),
  },
  warning: {
    width: theme.spacing(8),
  },
}));

const AddLiquidityEarnMessage: React.FC<AddLiquidityEarnMessageProps> = (props: AddLiquidityEarnMessageProps) => {
  const { children, className, ...rest } = props;
  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);
  const dispatch = useDispatch();
  const classes = useStyles();

  const onRemove = () => {
    dispatch(actions.Layout.hideLiquidityEarn());
  };

  if (layoutState.liquidityEarnHidden || layoutState.showPoolType !== "add") return null;

  return (
    <NotificationBox {...rest} className={cls(classes.root, className)} onRemove={onRemove}>
      <Box className={cls(classes.notificationSymbol, classes.warning)}>
        <Icon />
      </Box>
      <Box ml={1}>
        <Typography className={classes.notificationMessage} variant="body1">
          By adding liquidity, you will earn 0.3% on trades for this pool,
          proportional to your share of liquidity. Earned fees are added back
          to the pool and claimable by removing liquidity.
        </Typography>
      </Box>
    </NotificationBox>
  );
};

export default AddLiquidityEarnMessage;
