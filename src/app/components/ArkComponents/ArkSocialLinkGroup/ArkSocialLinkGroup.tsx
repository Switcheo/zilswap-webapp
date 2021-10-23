import React from "react";
import { Box, BoxProps, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import queryString from "query-string";
import { ReactComponent as TwitterIcon } from "app/components/SocialLinkGroup/social-icons/twitter.svg";
import { Collection } from "app/store/types";
import { useToaster } from "app/utils";
import { ReactComponent as ShareIcon } from "./social-icons/share.svg";
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
    margin: theme.spacing(0, .5),
    padding: theme.spacing(.75),
    minWidth: 0,
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
      <Button
        className={classes.fill}
        onClick={copyAndToast}
        disableRipple
      >
        <ShareIcon />
      </Button>
      <Button
        className={classes.fill}
        href={getHref("twitter")}
        target="_blank"
        disableRipple
      >
        <TwitterIcon />
      </Button>
      <Button
        className={classes.fill}
        href={getHref("telegram")}
        target="_blank"
        disableRipple
      >
        <TelegramIcon />
      </Button>
    </Box>
  );
};

export default ArkSocialLinkGroup;
