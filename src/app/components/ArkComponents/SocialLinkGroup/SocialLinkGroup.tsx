import React from "react";
import { Box, BoxProps, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { Collection } from "app/store/types";
import { ReactComponent as TwitterIcon } from "app/components/SocialLinkGroup/social-icons/twitter.svg";
import { ReactComponent as DiscordIcon } from "./social-icons/discord.svg";
import { ReactComponent as GlobeIcon } from "./social-icons/globe.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    minHeight: theme.spacing(4),
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
        fill: theme.palette.primary.light,
      },
    },
  },
  globeIcon: {
    "& path": {
      stroke: theme.palette.primary.light,
    },
  },
}));

interface Props extends BoxProps {
  collection?: Collection;
}

const SocialLinkGroup: React.FC<Props> = (props: Props) => {
  const { children, className, collection, ...rest } = props;
  const classes = useStyles();

  return (
    // not mobile responsive yet
    <Box {...rest} className={cls(classes.root, className)}>
      {collection?.twitterUrl && (
        <Button
          className={classes.fill}
          href={collection.twitterUrl}
          target="_blank"
          disableRipple
        >
          <TwitterIcon />
        </Button>
      )}
      {collection?.discordUrl && (
        <Button
          className={classes.fill}
          href={collection.discordUrl}
          target="_blank"
          disableRipple
        >
          <DiscordIcon />
        </Button>
      )}
      {collection?.telegramUrl && (
        <Button
          className={classes.fill}
          href={collection.telegramUrl}
          target="_blank"
          disableRipple
        >
          <TelegramIcon />
        </Button>
      )}
      {collection?.websiteUrl && (
        <Button
          href={collection.websiteUrl}
          target="_blank"
          disableRipple
        >
          <GlobeIcon className={classes.globeIcon} />
        </Button>
      )}
    </Box>
  );
};

export default SocialLinkGroup;
