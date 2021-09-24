import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as TwitterIcon } from "app/components/SocialLinkGroup/social-icons/twitter.svg";
import cls from "classnames";
import React from "react";
import { ReactComponent as DiscordIcon } from "./social-icons/discord.svg";
import { ReactComponent as GlobeIcon } from "./social-icons/globe.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    "& a": {
      minWidth: 0,
      padding: theme.spacing(0.75),
      margin: theme.spacing(0, 0.5),
      "& svg": {
        width: 18,
        height: 18,
        margin: 1,
        "& path": {
          transition: "fill .2s ease-in-out",
        },
      },
    },
  },
  fill: {
    "& svg": {
      "& path": {
        fill: "rgba(222, 255, 255, 0.5)",
      },
    },
  },
}));
const SocialLinkGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    // not mobile responsive yet
    <Box {...rest} className={cls(classes.root, className)}>
      <Button
        className={classes.fill}
        href="https://twitter.com/ZilSwap"
        target="_blank"
        disableRipple
      >
        <TwitterIcon />
      </Button>
      <Button
        className={classes.fill}
        href="http://discord.gg/ESVqQ3qtvk"
        target="_blank"
        disableRipple
      >
        <DiscordIcon />
      </Button>
      <Button
        className={classes.fill}
        href="http://telegram.com"
        target="_blank"
        disableRipple
      >
        <TelegramIcon />
      </Button>
      <Button href="http://thebear.market" target="_blank" disableRipple>
        <GlobeIcon />
      </Button>
    </Box>
  );
};

export default SocialLinkGroup;
