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
import { CreatePoolDialog, PoolDeposit, PoolWithdraw, ShowAdvanced } from "./components";
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>(); //{ type: "success", message: "Transaction Submitted." }
  const formState = useSelector<RootState, PoolFormState>(state => state.pool);
  const type = formState.values.type;
  const deposit1Currency = useSelector<RootState, string>(state => state.pool.values.deposit1Currency)
  const withdrawCurrency = useSelector<RootState, string>(state => state.pool.values.withdrawCurrency)
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const currency = type === "add" ? deposit1Currency : withdrawCurrency;
  const poolValue = useSelector<RootState, any>(state => state.pool.poolValues);
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
        {/* <KeyValueDisplay kkey={"Exchange Rate"} value={(walletState.currencies![currency] && walletState.currencies![currency].exchangeRate) || "-"} mb="8px" />
        <KeyValueDisplay kkey={"Current Pool Size"} value={(walletState.currencies![currency] && walletState.currencies![currency].totalContribution?.toFixed(10)) || "-"} mb="8px" />
        <KeyValueDisplay kkey={"Your Pool Share (%)"} value={(walletState.currencies![currency] && walletState.currencies![currency].contributionPercentage?.toFixed(10)) || "-"} /> */}
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
          poolValue={poolValue}
        />
      )}
      <CreatePoolDialog open={showCreatePool} onCloseDialog={() => setShowCreatePool(false)} />
    </MainCard>
  );
};

export default Pool;