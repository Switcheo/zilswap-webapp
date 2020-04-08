import { IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as CancelLogo } from "./cancel_logo.svg";
import { ReactComponent as SuccessLogo } from "./success_logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  notification: {
    backgroundColor: theme.palette.background.paperOpposite!,
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
    display: "flex",
    justifyContent: "space-between",
  },
  notificationSymbol: {
    width: theme.spacing(6),
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  notificationDetail: {
    display: "flex"
  },
  notificationMessage: {
    alignItems: "center",
    display: "flex",
    color: "#000"
  },
  cancelNotification: {
    float: "right"
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(2)
  },
}));

const NotificationBox = (props: any) => {
  const { notification, setNotification } = props;
  const classes = useStyles();

  if (!notification) return null;

  return (
    <div className={cls(classes.notification)}>
      <div className={classes.notificationDetail}>
        {notification.type === "success" && <div className={classes.notificationSymbol}>
          <SuccessLogo />
        </div>}
        <div className={classes.notificationMessage}>
          {notification.message} {notification.type === "success" && <a className={classes.viewDetail} href="#">View Details</a>}
        </div>
      </div>
      <IconButton onClick={() => setNotification(null)} className={classes.cancelNotification}>
        <CancelLogo />
      </IconButton>
    </div>
  );
}

export default NotificationBox;