import { Box, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as CancelLogo } from "./cancel_logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  notification: {
    backgroundColor: theme.palette.background.paperOpposite!,
    padding: theme.spacing(2),
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
  success: {
    top: 10
  },
  successMessage: {
    paddingTop: 10
  },
}));

const NotificationBox: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  // const renderNotification = (type: string) => {
  //   switch (type) {
  //     case "success":
  //       return (
  //         <Fragment>
  //           <Box className={cls(classes.notificationSymbol, classes.success)}>
  //             <SuccessLogo />
  //           </Box>
  //           <Box ml={6}>
  //             <Typography variant="body2" className={cls(classes.notificationMessage, classes.successMessage)}>
  //               {notification.message} {notification.type === "success" && (
  //                 <RouterLink className={classes.viewDetail} to="detail">View Details</RouterLink>
  //               )}
  //             </Typography>
  //           </Box>
  //         </Fragment>
  //       );
  //   }
  // }

  const clearNotification = () => {

  };

  return (
    <Box {...rest} className={cls(classes.notification, className)}>
      <Box className={classes.notificationDetail}>
        {children}
      </Box>
      <IconButton onClick={clearNotification} className={classes.cancelNotification}>
        <CancelLogo />
      </IconButton>
    </Box>
  );
}

export default NotificationBox;