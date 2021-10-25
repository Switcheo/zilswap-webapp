import React from "react";
import { Box, BoxProps, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import queryString from "query-string";
import { Collection } from "app/store/types";
import { useToaster } from "app/utils";
import { ReactComponent as ShareIcon } from "./social-icons/share.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";

interface Props extends BoxProps {
  collection?: Collection;
  message?: string;
}

const ArkSocialLinkGroup: React.FC<Props> = (props: Props) => {
  const {
    message = "Check out this awesome NFT on #ARK! &link #nftmarketplace #nft #nonfungible #zilswap @zilswap",
    children, className, collection, ...rest } = props;
  const classes = useStyles();
  const toaster = useToaster(false)

  const copyAndToast = () => {
    navigator.clipboard.writeText(window.location.href);
    toaster("Link to page copied")
  }

  const getHref = (type: string) => {
    switch (type) {
      case "twitter":
        const shareMessage = message.replace("&link", `(${window.location.href})`);
        const search = queryString.stringify({
          text: shareMessage,
        });
        return `https://twitter.com/intent/tweet?${search}`;

      case "telegram": {
        const shareMessage = message.replace("&link", "");
        const search = queryString.stringify({
          url: window.location.href,
          text: shareMessage,
        })
        return `tg://msg_url?${search}`;
      }
      default: return "";
    }
  }

  return (
    // not mobile responsive yet
    <Box {...rest} className={cls(classes.root, className)}>
      <IconButton
        className={classes.icon}
        onClick={copyAndToast}
      >
        <ShareIcon />
      </IconButton>
      <IconButton
        className={classes.icon}
        href={getHref("twitter")}
        target="_blank"
      >
        <TwitterIcon />
      </IconButton>
      <IconButton
        className={classes.icon}
        href={getHref("telegram")}
        target="_blank"
      >
        <TelegramIcon />
      </IconButton>
    </Box>
  );
};

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
}));

export default ArkSocialLinkGroup;
