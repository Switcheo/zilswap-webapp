import { Box, Button, ButtonGroup } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NotificationBox } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { PoolFormState } from "app/store/pool/types";
import { RootState } from "app/store/types";
import cls from "classnames";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreatePoolDialog, PoolDeposit, PoolWithdraw } from "./components";
import { ReactComponent as PlusSVG } from "./plus_icon.svg";

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    padding: theme.spacing(4, 8, 2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 2, 2),
    },
  },
  addRemoveButton: {
    borderRadius: 4,
    width: 90,
    padding: theme.spacing(1.5, 4),
    "&.MuiButton-contained": {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: theme.palette.primary.main,
    },
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
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>(); //{ type: "success", message: "Transaction Submitted." }
  const formState = useSelector<RootState, PoolFormState>(state => state.pool);
  const type = formState.values.type;
  const dispatch = useDispatch();

  const onTypeChange = (type: string) => {
    dispatch(actions.Pool.update_extended({ key: "type", value: type }))
  }

  return (
    <MainCard hasNotification={notification} {...rest} className={cls(classes.root, className)}>
      <NotificationBox notification={notification} setNotification={setNotification} />
      <Box display="flex" flexDirection="column" className={classes.container}>
        <Box display="flex" justifyContent="space-between" mb="28px" >
          <ButtonGroup color="primary">
            <Button
              onClick={() => onTypeChange("add")}
              variant={type === "add" ? "contained" : "outlined"}
              className={classes.addRemoveButton}>
              Add
              </Button>
            <Button
              onClick={() => onTypeChange("remove")}
              variant={type === "remove" ? "contained" : "outlined"}
              className={classes.addRemoveButton}>
              Remove
              </Button>
          </ButtonGroup>
          <Button startIcon={<PlusSVG />} onClick={() => setShowCreatePool(true)}>
            Create Pool
          </Button>
        </Box>
        {type === "add" && (<PoolDeposit />)}
        {type === "remove" && (<PoolWithdraw />)}
      </Box>
      <CreatePoolDialog open={showCreatePool} onCloseDialog={() => setShowCreatePool(false)} />
    </MainCard>
  );
};

export default PoolView;