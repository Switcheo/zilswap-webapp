import { IconButton, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as CancelLogo } from "./cancel_logo.svg";
import { ReactComponent as SuccessLogo } from "./success_logo.svg";
import { NavLink as RouterLink } from "react-router-dom";

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
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["100"] : theme.palette.colors.zilliqa.neutral["200"]
  },
  cancelNotification: {
    float: "right",
    paddingRight: theme.spacing(1)
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1)
  },
}));

const NotificationBox = (props: any) => {
  const { notification, setNotification, className, ...rest } = props;
  const classes = useStyles();

  if (!notification) return null;

  return (
    <Box {...rest} className={cls(classes.notification, className)}>
      <Box className={classes.notificationDetail}>
        {notification.type === "success" && (
          <Box className={classes.notificationSymbol}>
            <SuccessLogo />
          </Box>
        )}
        <Typography variant="body2" className={classes.notificationMessage}>
          {notification.message} {notification.type === "success" && (
            <RouterLink className={classes.viewDetail} to="detail">View Details</RouterLink>
          )}
        </Typography>
      </Box>
      <IconButton onClick={() => setNotification(null)} className={classes.cancelNotification}>
        <CancelLogo />
      </IconButton>
    </Box>
  );
}

export default NotificationBox;