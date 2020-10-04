import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NotificationBox } from "app/components";
import { TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React from "react";
import { NavLink as RouterLink } from "react-router-dom";
import { ReactComponent as LinkLogo } from "./link_logo.svg";
import { ReactComponent as WarningLogo } from "./warning_logo.svg";

export interface UserPoolMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationSymbol: {
    margin: theme.spacing(1.5, 3, 0),
  },
  warning: {
    alignItems: "start"
  },
  symbolLink: {
    color: theme.palette.primary.main
  },
  linkLogo: {
    width: 10,
    marginBottom: -2,
    marginLeft: 5,
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(1, 0),
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["100"] : theme.palette.colors.zilliqa.neutral["200"]
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1)
  },
}));

const VIEWBLOCK_URL = "https://viewblock.io/zilliqa/address/:address?network=:network";

const UserPoolMessage: React.FC<UserPoolMessageProps> = (props: UserPoolMessageProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();

  if (!token) return null;

  const network = ZilswapConnector.network || "";
  const infoUrl = VIEWBLOCK_URL.replace(":address", token.address)
    .replace(":network", network.toLowerCase());

  return (
    <NotificationBox {...rest} className={cls(classes.root, className)}>
      <Box className={cls(classes.notificationSymbol, classes.warning)}>
        <WarningLogo />
      </Box>
      <Box ml={1}>
        <Typography color="textSecondary" variant="body1">Pool Created by User</Typography>
        <Typography component="a" className={classes.symbolLink} href={infoUrl} target="_blank" >({token.symbol}) Token ({token.name}) <LinkLogo className={classes.linkLogo} /></Typography>
        <Typography className={classes.notificationMessage} variant="body2">
          Please verify the legitimacy of this token before making any transactions.
          <RouterLink className={classes.viewDetail} to="detail">Learn More</RouterLink>
        </Typography>
      </Box>
    </NotificationBox>
  );
};

export default UserPoolMessage;
