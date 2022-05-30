import React, { Fragment, useState } from "react";
import { Box, BoxProps, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { ArkReportCollectionDialog } from "app/components";
import { Collection } from "app/store/types";
import { toBech32Address } from "core/zilswap";
import { ReactComponent as FlagIcon } from "app/assets/icons/flag.svg";
import { ReactComponent as DiscordIcon } from "./social-icons/discord.svg";
import { ReactComponent as GlobeIcon } from "./social-icons/globe.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    minHeight: theme.spacing(4),
    "& a": {
      minWidth: 0,
      padding: theme.spacing(0.75),
      margin: theme.spacing(0, 0.5),
    },
  },
  icon: {
    margin: theme.spacing(0, .5),
    padding: theme.spacing(.75),
    minWidth: 0,
    fontSize: 16,
    color: theme.palette.text.primary,
    opacity: 0.5,
  },
  flagIcon: {
      "& span svg":{
          fontSize: "1.35rem",
          margin: "-2.8px"
      }
  }
}));

interface Props extends BoxProps {
  collection?: Collection;
  message?: string;
}

const ArkSocialLinkGroup: React.FC<Props> = (props: Props) => {
  const { children, className, collection, ...rest } = props;
  const classes = useStyles();
  const [openReportDialog, setOpenReportDialog] = useState(false);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {collection?.twitterUrl && (
        <IconButton
          className={classes.icon}
          href={collection.twitterUrl}
          target="_blank"
        >
          <TwitterIcon />
        </IconButton>
      )}
      {collection?.discordUrl && (
        <IconButton
          className={classes.icon}
          href={collection.discordUrl}
          target="_blank"
        >
          <DiscordIcon />
        </IconButton>
      )}
      {collection?.telegramUrl && (
        <IconButton
          className={classes.icon}
          href={collection.telegramUrl}
          target="_blank"
        >
          <TelegramIcon />
        </IconButton>
      )}
      {collection?.websiteUrl && (
        <IconButton
          className={classes.icon}
          href={collection.websiteUrl}
          target="_blank"
        >
          <GlobeIcon />
        </IconButton>
      )}
      {collection?.address && (
        <Fragment>
            <IconButton 
                className={cls(classes.icon, classes.flagIcon)}
                onClick={() => { setOpenReportDialog(true); }}>
                <FlagIcon />
            </IconButton>
            <ArkReportCollectionDialog open={openReportDialog} onCloseDialog={() => setOpenReportDialog(false)} collectionAddress={toBech32Address(collection.address)} />
        </Fragment>
      )}
    </Box>
  );
};

export default ArkSocialLinkGroup;
