import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Notifications } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { LayoutState, OpenCloseState, PoolFormState, RootState } from "app/store/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreatePoolDialog, NewPoolMessage, PoolDeposit, PoolToggleButton, PoolWithdraw, UserPoolMessage } from "./components";
import { ReactComponent as PlusSVG } from "./plus_icon.svg";

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    padding: theme.spacing(4, 8, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  createButton: {
    borderRadius: 4,
  },
  actionButton: {
    marginTop: 45,
    marginBottom: 40,
    height: 46
  },
}));
const PoolView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);

  const { token: poolToken } = poolFormState;
  const { showPoolType: poolType, showCreatePool } = layoutState;

  const onShowCreatePool = (override: OpenCloseState) => {
    dispatch(actions.Layout.toggleShowCreatePool(override));
  };

  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <Notifications />
      {!poolToken?.loading && (
        <>
          {!poolToken?.pool && (<NewPoolMessage token={poolToken || undefined} />)}
          {poolToken?.pool && !poolToken?.whitelisted && (<UserPoolMessage token={poolToken} />)}
        </>
      )}
      <Box display="flex" flexDirection="column">
        <Box display="flex" justifyContent="space-between" mb="28px" className={classes.container}>
          <PoolToggleButton />
          <Button className={classes.createButton} startIcon={<PlusSVG />} onClick={() => onShowCreatePool("open")}>
            Create Pool
          </Button>
        </Box>
        {poolType === "add" && (<PoolDeposit />)}
        {poolType === "remove" && (<PoolWithdraw />)}
      </Box>
      <CreatePoolDialog open={showCreatePool} onCloseDialog={() => onShowCreatePool("close")} />
    </MainCard>
  );
};

export default PoolView;
