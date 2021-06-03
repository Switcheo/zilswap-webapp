import { Box, IconButton, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as CancelLogo } from "./cancel_logo.svg";

export interface NotificationBoxProps extends BoxProps {
  IconComponent?: React.ElementType;
  onRemove?: () => void;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  notification: {
    backgroundColor: theme.palette.type === "dark" ? "#00161C" : theme.palette.background.default!,
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "#D2E5DF"}`,
    borderRadius: "12px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    "&:first-child": {
      borderRadius: "12px",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    "&:not(:first-child)": {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    }
  },
  notificationDetail: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  notificationSymbol: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.colors.zilliqa.neutral[theme.palette.type === "light" ? "200" : "100"],
    "& svg": {
      display: "block",
    }
  },
  cancelNotification: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

const NotificationBox: React.FC<NotificationBoxProps> = (props: NotificationBoxProps) => {
  const { children, className, onRemove, IconComponent, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.notification, className)}>
      {!!IconComponent && (
        <Box className={classes.notificationSymbol}>
          <IconComponent />
        </Box>
      )}
      <Box className={classes.notificationDetail}>
        {children}
      </Box>
      {!!onRemove && (
        <IconButton onClick={onRemove} className={classes.cancelNotification}>
          <CancelLogo />
        </IconButton>
      )}
    </Box>
  );
}

export default NotificationBox;