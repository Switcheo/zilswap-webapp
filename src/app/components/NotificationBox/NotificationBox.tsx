import { IconButton, Typography, Box, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { Fragment } from "react";
import { ReactComponent as CancelLogo } from "./cancel_logo.svg";
import { ReactComponent as SuccessLogo } from "./success_logo.svg";
import { ReactComponent as WarningLogo } from "./warning_logo.svg";
import { ReactComponent as LinkLogo } from "./link_logo.svg";
import { NavLink as RouterLink } from "react-router-dom";
import { hexToRGBA } from "app/utils";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  notification: {
    backgroundColor: theme.palette.background.paperOpposite!,
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start"
  },
  notificationSymbol: {
    position: "relative",
    left: 20,
    top: 0,
    float: "left"
  },
  notificationDetail: {
    display: "flex",
    alignSelf: "stretch"
  },
  notificationMessage: {
    fontWeight: 400,
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["100"] : theme.palette.colors.zilliqa.neutral["200"]
  },
  cancelNotification: {
    float: "right",
    paddingRight: theme.spacing(1),
    display: "flex",
    justifyContent: "start"
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1)
  },
  symbolLink: {
    color: theme.palette.primary.main
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  warning: {
    alignItems: "start"
  },
  success: {
    top: 10
  },
  successMessage: {
    paddingTop: 10
  },
  linkLogo: {
    marginLeft: 5
  }
}));

const NotificationBox = (props: any) => {
  const { notification, setNotification, className, ...rest } = props;
  const classes = useStyles();

  if (!notification) return null;

  const renderNotification = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Fragment>
            <Box className={cls(classes.notificationSymbol, classes.success)}>
              <SuccessLogo />
            </Box>
            <Box ml={6}>
              <Typography variant="body2" className={cls(classes.notificationMessage, classes.successMessage)}>
                {notification.message} {notification.type === "success" && (
                  <RouterLink className={classes.viewDetail} to="detail">View Details</RouterLink>
                )}
              </Typography>
            </Box>
          </Fragment>
        );
      case "pool_created":
        return (
          <Fragment>
            <Box className={cls(classes.notificationSymbol, classes.warning)}>
              <WarningLogo />
            </Box>
            <Box ml={6}>
              <Typography color="textSecondary" variant="body1">Pool Created by User</Typography>
              <RouterLink className={classes.symbolLink} to="detail">SWTH Token (Switcheo Network) <LinkLogo className={classes.linkLogo} /></RouterLink>
              <Typography className={classes.notificationMessage} variant="body2">
                Please verify the legitimacy of this token before making any transactions.<RouterLink className={classes.viewDetail} to="detail">Learn More</RouterLink>
              </Typography>
              <Divider className={classes.divider} />
              <Typography className={classes.notificationMessage} variant="body2">You are the first person to add liquidity. The initial exchange rate will be set based on your deposits. Make sure that your ZIL and deposits have the same fiat value.<RouterLink className={classes.viewDetail} to="detail">Learn More</RouterLink></Typography>
            </Box>
          </Fragment>
        )
    }
  }

  return (
    <Box {...rest} className={cls(classes.notification, className)}>
      <Box className={classes.notificationDetail}>
        {renderNotification(notification.type)}
      </Box>
      <IconButton onClick={() => setNotification(null)} className={classes.cancelNotification}>
        <CancelLogo />
      </IconButton>
    </Box>
  );
}

export default NotificationBox;