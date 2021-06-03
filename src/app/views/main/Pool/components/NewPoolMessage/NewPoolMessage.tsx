import { Box, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NotificationBox } from "app/components";
import { TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as WarningLogo } from "./warning_logo.svg";

export interface NewPoolMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationSymbol: {
    margin: theme.spacing(1.5, 3, 0),
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(1, 0),
    color: theme.palette.type === "light" ? theme.palette.colors.zilliqa.neutral["200"] : theme.palette.colors.zilliqa.neutral["100"]
  },
  viewDetail: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1)
  },
}));

const NewPoolMessage: React.FC<NewPoolMessageProps> = (props: NewPoolMessageProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();

  if (!token) return null;

  return (
    <NotificationBox {...rest} className={cls(classes.root, className)}>
      <Box className={classes.notificationSymbol}>
        <WarningLogo />
      </Box>
      <Box ml={2} mr={1}>
        <Typography className={classes.notificationMessage} variant="body2">
          You are the first person to add liquidity.
          The initial exchange rate will be set based on your deposits.
          Make sure that your ZIL and deposits have the same fiat value.
          <Link className={classes.viewDetail} rel="noopener noreferrer" target="_blank" href="https://docs.zilswap.org/#/smart-contract?id=addliquidity">
            Learn More
          </Link>
        </Typography>
      </Box>
    </NotificationBox>
  );
};

export default NewPoolMessage;
