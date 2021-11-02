import React from "react";
import { Box, Button, DialogProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import queryString from "query-string";
import { useToaster } from "app/utils";
import { DialogModal } from "app/components";
import { ReactComponent as ShareIcon } from "./social-icons/share.svg";
import { ReactComponent as TelegramIcon } from "./social-icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "./social-icons/twitter.svg";

interface Props extends Partial<DialogProps> {
  collectionAddress: string;
  tokenId: number;
  message?: string;
  onCloseDialog?: () => void;
  header?: string;
}

const DEFAULT_URL = "https://zilswap.io/ark/collections/:collectionAddress/:tokenId"

const ArkSocialShareDialog: React.FC<Props> = (props: Props) => {
  const {
    message = "Check out this awesome NFT on #ARK! &link #nftmarketplace #nft #nonfungible #zilswap @zilswap",
    children, className, collectionAddress, tokenId, open, onCloseDialog, header = "Share NFT", ...rest } = props;
  const classes = useStyles();
  const toaster = useToaster(false);
  const replaceLink = DEFAULT_URL.replace(":collectionAddress", collectionAddress).replace(":tokenId", tokenId + "");

  const copyAndToast = () => {
    navigator.clipboard.writeText(replaceLink);
    toaster("Link to page copied")
  }

  const getHref = (type: string) => {
    switch (type) {
      case "twitter":
        const shareMessage = message.replace("&link", `(${replaceLink})`);
        const search = queryString.stringify({
          text: shareMessage,
        });
        return `https://twitter.com/intent/tweet?${search}`;

      case "telegram": {
        const shareMessage = message.replace("&link", "");
        const search = queryString.stringify({
          url: replaceLink,
          text: shareMessage,
        })
        return `tg://msg_url?${search}`;
      }
      default: return "";
    }
  }

  return (
    <DialogModal header={header} open={!!open} onClose={onCloseDialog} titlePadding={true}>
      <Box display="flex" justifyContent="center" translate="yes" {...rest} className={cls(classes.root, className)}>
        <Button
          className={classes.icon}
          onClick={copyAndToast}
        >
          <ShareIcon />
        </Button>
        <Button
          className={classes.icon}
          href={getHref("twitter")}
          target="_blank"
        >
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <TwitterIcon />
            <Typography>Twitter</Typography>
          </Box>
        </Button>
        <Button
          className={classes.icon}
          href={getHref("telegram")}
          target="_blank"
        >
          <TelegramIcon />
        </Button>
      </Box>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    minHeight: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(0, 3, 4),
    top: -theme.spacing(2),
    "& a": {
      minWidth: 0,
      padding: theme.spacing(0.75),
      margin: theme.spacing(0, 0.5),
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
  },
  icon: {
    margin: theme.spacing(0, .5),
    height: 70,
    width: 100,
    borderRadius: 12,
    minWidth: 0,
    fontSize: 16,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
    opacity: 0.5,
    display: "flex",
    flexDirection: "column",
  },
}));

export default ArkSocialShareDialog;
