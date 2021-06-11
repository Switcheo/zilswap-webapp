import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { hexToRGBA } from "app/utils";
import cls from "classnames";
import React from "react";
// import { ReactComponent as MediumIcon } from "./social-icons/medium.svg";
// import { ReactComponent as MailIcon } from "./social-icons/mail.svg";
import { ReactComponent as Discord } from "./social-icons/discord.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "row",
    paddingLeft: theme.spacing(2),
    "& a": {
      minWidth: 0,
      padding: theme.spacing(.75),
      margin: theme.spacing(0, .5),
      "& svg": {
        width: 20,
        height: 20,
        margin: 1,
        "& path": {
          transition: "fill .2s ease-in-out",
          fill: `rgba${hexToRGBA(theme.palette.text.primary, 0.5)}`,
        }
      },
    },
  },
}));
const SocialLinkGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button href="https://twitter.com/ZilSwap">
        <TwitterIcon />
      </Button>
      <Button href="http://discord.gg/ESVqQ3qtvk">
        <Discord />
      </Button>
      {/* <Button href="https://medium.com/Switcheo">
        <MediumIcon />
      </Button>
      <Button href="https://support@switcheo.network">
        <MailIcon />
      </Button> */}
    </Box>
  );
};

export default SocialLinkGroup;
