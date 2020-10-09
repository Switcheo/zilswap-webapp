import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import { ReactComponent as MediumIcon } from "./social-icons/medium.svg";
import { ReactComponent as MailIcon } from "./social-icons/mail.svg";
import { ReactComponent as Discord } from "./social-icons/discord.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
  },
}));
const SocialLinkGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button href="https://discord.com/invite/Cpsxb2d">
        <Discord />
      </Button>
      <Button href="https://twitter.com/SwitcheoNetwork">
        <TwitterIcon />
      </Button>
      <Button href="https://medium.com/Switcheo">
        <MediumIcon />
      </Button>
      <Button href="https://support@switcheo.network">
        <MailIcon />
      </Button>
    </Box>
  );
};

export default SocialLinkGroup;
