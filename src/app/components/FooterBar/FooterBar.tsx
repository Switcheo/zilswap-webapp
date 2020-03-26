import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as MediumIcon } from "./social-icons/medium.svg";
import { ReactComponent as MailIcon } from "./social-icons/mail.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";
import { ReactComponent as SwitcheoIcon } from "./switcheo.svg";


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    minWidth: "100%",
    height: theme.spacing(4.5),
    backgroundColor: theme.palette.toolbar.main,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing(0, 2),
  },
  icons: {
    display: "flex",
    flexDirection: "row",
    "& a": {
      minWidth: 0,
      padding: theme.spacing(.75),
      margin: theme.spacing(0, .5),
      "& svg": {
        width: 14,
        height: 14,
        margin: 1,
        "& path": {
          transition: "fill .2s ease-in-out",
          fill: theme.palette.colors.zilliqa.neutral[140],
        }
      },
      "&:hover svg path": {
        fill: "#666666"
      }
    },
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  switcheoBrand: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    color: theme.palette.colors.zilliqa.neutral[140],
    "& p": {
      fontSize: 12,
    },
    "& a": {
      borderRadius: 42,
      padding: theme.spacing(1),
    },
    "& path": {
      fill: theme.palette.switcheoLogo,
    },
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
}));

const FooterBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={cls(classes.icons)}>
        <Button href="https://switcheo.network">
          <TelegramIcon />
        </Button>
        <Button href="https://switcheo.network">
          <TwitterIcon />
        </Button>
        <Button href="https://switcheo.network">
          <MediumIcon />
        </Button>
        <Button href="https://switcheo.network">
          <MailIcon />
        </Button>
      </Box>
      <Box className={classes.switcheoBrand}>
        <Typography variant="body1">By</Typography>
        <IconButton href="https://switcheo.network">
          <SwitcheoIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default FooterBar;