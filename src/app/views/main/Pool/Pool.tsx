import { Box, Button, ButtonGroup, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { KeyValueDisplay, NotificationBox } from "app/components";
import MainCard from "app/layouts/MainCard";
import { actions } from "app/store";
import { PoolFormState } from "app/store/pool/types";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import cls from "classnames";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PoolDeposit, PoolWithdraw, ShowAdvanced, CreatePoolDialog } from "./components";
import { ReactComponent as PlusSVG } from "./plus_icon.svg";

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    padding: `${theme.spacing(4)}px ${theme.spacing(8)}px ${theme.spacing(2)}px ${theme.spacing(8)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  addRemoveButton: {
    borderRadius: 4,
    width: 90,
    padding: `${theme.spacing(1.5)}px ${theme.spacing(4)}px`
  },
  actionButton: {
    marginTop: 45,
    marginBottom: 40,
    height: 46
  },
  advanceDetails: {
    marginBottom: 26,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: theme.palette.text!.secondary,
    cursor: "pointer"
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
}));
const Pool: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>({ type: "pool_created", message: "Transaction Submitted." });
  const formState = useSelector<RootState, PoolFormState>(state => state.pool);
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const onTypeChange = (type: string) => {
    dispatch(actions.Pool.update_extended({ key: "type", value: type }))
  }

  const type = formState.values.type;

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
              className={classes.addRemoveButton}
            >
              Remove
              </Button>
          </ButtonGroup>
          <Button
            startIcon={<PlusSVG />}
            onClick={() => setShowCreatePool(true)}
          >
            Create Pool
          </Button>
        </Box>
        {type === "add" && (<PoolDeposit />)}
        {type === "remove" && (<PoolWithdraw />)}
        <KeyValueDisplay kkey={"Exchange Rate"} value={"-"} mb="8px" />
        <KeyValueDisplay kkey={"Current Pool Size"} value={"-"} mb="8px" />
        <KeyValueDisplay kkey={"Your Pool Share (%)"} value={"-"} />
        <Button
          className={classes.actionButton}
          variant="contained"
          color="primary"
          fullWidth
          disabled={!walletState.wallet}
          onClick={() => { }}
        >{type === "add" ? "Add Liquidity" : "Remove Liquidity"}</Button>
        {type === "remove" && (<Typography variant="body2" className={cls(classes.advanceDetails, showAdvanced ? classes.primaryColor : {})} onClick={() => setShowAdvanced(!showAdvanced)}>
          Advanced Details{showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Typography>)}
      </Box>
      {type === "remove" && (
        <ShowAdvanced
          showAdvanced={showAdvanced}
        />
      )}
      <CreatePoolDialog open={showCreatePool} onCloseDialog={() => setShowCreatePool(false)} />
    </MainCard>
  );
};

export default Pool;