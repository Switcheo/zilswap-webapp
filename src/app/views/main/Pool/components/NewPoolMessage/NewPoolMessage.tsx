import { Box, Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import { ReactComponent as WarningLogo } from "./warning_logo.svg";
import { NavLink as RouterLink } from "react-router-dom";
import { ReactComponent as LinkLogo } from "./link_logo.svg";
import { hexToRGBA } from "app/utils";
import { AppTheme } from "app/theme/types";
import { NotificationBox } from "app/components";
import { TokenInfo } from "app/store/types";
import { ZilswapConnector } from "core/zilswap";

export interface NewPoolMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationSymbol: {
    position: "relative",
    left: 20,
    top: 0,
    float: "left"
  },
  warning: {
    alignItems: "start"
  },
  symbolLink: {
    color: theme.palette.primary.main
  },
  linkLogo: {
    marginLeft: 5
  },
  notificationMessage: {
    fontWeight: 400,
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["100"] : theme.palette.colors.zilliqa.neutral["200"]
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1)
  },
}));

const VIEWBLOCK_URL = "https://viewblock.io/zilliqa/address/:address?network=:network";

const NewPoolMessage: React.FC<NewPoolMessageProps> = (props: NewPoolMessageProps) => {
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
      <Box ml={6}>
        <Typography color="textSecondary" variant="body1">Pool Created by User</Typography>
        <Typography component="a" className={classes.symbolLink} href={infoUrl} target="_blank" >({token.symbol}) Token ({token.name}) <LinkLogo className={classes.linkLogo} /></Typography>
        <Typography className={classes.notificationMessage} variant="body2">
          Please verify the legitimacy of this token before making any transactions. 
          <RouterLink className={classes.viewDetail} to="detail">Learn More</RouterLink>
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.notificationMessage} variant="body2">You are the first person to add liquidity. The initial exchange rate will be set based on your deposits. Make sure that your ZIL and deposits have the same fiat value. 
        <RouterLink className={classes.viewDetail} to="detail">Learn More</RouterLink></Typography>
      </Box>
    </NotificationBox>
  );
};

export default NewPoolMessage;