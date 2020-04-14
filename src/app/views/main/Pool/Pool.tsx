import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import cls from "classnames";
import MainCard from "app/layouts/MainCard";
import { RandomAsciiEmoji, NotificationBox } from "app/components";
import { useFormHandler } from "app/utils";
import { ButtonGroup, Button } from "@material-ui/core";
import { ReactComponent as PlusSVG } from "./plus_icon.svg";

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    display: "flex",
    flexDirection: "column",
    padding: `${theme.spacing(4)}px ${theme.spacing(8)}px ${theme.spacing(2)}px ${theme.spacing(8)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  addRemoveGroup: {

  },
  addRemoveRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  addRemoveButton: {
    borderRadius: 4,
  },
  createPool: {

  }
}));
const Pool: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [notification, setNotification] = useState<{ type: string; message: string; } | null>({ type: "success", message: "Transaction Submitted." });
  const [formState, setFormState, handleError, changeHandler] = useFormHandler({
    values: {
      type: "add",
      amount: 0
    },
    errors: {},
    touched: {}
  }, setError); // eslint-disable-line

  return (
    <MainCard hasNotification={notification} {...rest} className={cls(classes.root, className)}>
      <NotificationBox notification={notification} setNotification={setNotification} />
      <div className={classes.container}>
        <div className={classes.addRemoveRow}>
          <ButtonGroup color="primary" className={classes.addRemoveGroup}>
            <Button variant={formState.values.type === "add" ? "contained" : "outlined"} className={classes.addRemoveButton}>Add</Button>
            <Button variant={formState.values.type === "remove" ? "contained" : "outlined"} className={classes.addRemoveButton}>Remove</Button>
          </ButtonGroup>
          <Button
            startIcon={<PlusSVG />}
          >
            Create Pool
          </Button>
        </div>

      </div>
    </MainCard>
  );
};

export default Pool;