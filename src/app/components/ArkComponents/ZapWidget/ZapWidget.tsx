import React, { useEffect, useState } from "react";
import { Box, BoxProps, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getMarketplace, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft, OAuth } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { toHumanNumber, useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { ReactComponent as ZapSVG } from "./zap.svg";

interface Props extends BoxProps {
  token: Nft;
  onZap?: () => void;
  variant?: "thin" | "bold"
}

const ZapWidget: React.FC<Props> = (props: Props) => {
  const { token, onZap, variant = "thin" } = props;
  const classes = useStyles();

  const [liked, setLiked] = useState<boolean>(token?.isFavourited || false);
  const { oAuth } = useSelector(getMarketplace);
  const { wallet } = useSelector(getWallet);
  const [runLikeToken] = useAsyncTask("likeToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) setLiked(!!token.isFavourited);
  }, [token])

  const likeToken = () => {
    if (!wallet)
      return dispatch(actions.Layout.toggleShowWallet("open"));

    runLikeToken(async () => {
      if (!wallet || !token) return;
      let newOAuth: OAuth | undefined = oAuth;
      const arkClient = new ArkClient(wallet!.network)
      if (!newOAuth?.access_token || (newOAuth?.expires_at && dayjs(newOAuth.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        newOAuth = result;
      }
      if (!liked) {
        await arkClient.postFavourite(token!.collection!.address, token.tokenId, newOAuth!.access_token);
      } else {
        await arkClient.removeFavourite(token!.collection!.address, token.tokenId, newOAuth!.access_token);
      }
      setLiked(!liked);
      if (onZap) onZap();
    })
  }

  return (
    <Box display="flex" alignItems="center">
      <Typography className={cls(classes.likes, variant, { liked })}>{toHumanNumber(token?.statistics?.favourites || 0)}</Typography>
      <IconButton
        onClick={likeToken}
        className={classes.likeIconButton}
        disableRipple
      >
        <ZapSVG className={cls(classes.likeButton, { liked })} />
      </IconButton>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  likes: {
    color: theme.palette.type === 'dark' ? 'rgba(222, 255, 255, 0.5)' : 'rgba(0, 51, 64, 0.6)',
    fontSize: 13,
    marginBottom: -2,
    '&.liked': {
      color: theme.palette.type === 'dark' ? '#00FFB0' : 'rgba(0, 51, 64, 0.6)',
    },
    '&.bold': {
      color: theme.palette.text!.primary,
      fontWeight: 700,
      fontSize: 18,
      '&.liked': {
        color: theme.palette.type === 'dark' ? '#00FFB0' : theme.palette.text!.primary,
      },
    },
    '&.thin': {
      marginRight: 2,
    },
  },
  likeIconButton: {
    padding: 3,
    marginRight: -3,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  likeButton: {
    '& > path': {
      fill: theme.palette.type === 'dark' ? 'rgba(222, 255, 255, 0.5)' : 'rgba(0, 51, 64, 0.6)',
    },
    '&.liked': {
      '& > path': {
        fill: '#00FFB0',
        stroke: 'rgba(0, 51, 64, 0.2)',
      },
    }
  },
}));

export default ZapWidget;
