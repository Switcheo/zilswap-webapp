import React, { useEffect, useState } from "react";
import { BoxProps, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import clsx from "clsx";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getMarketplace, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft, OAuth } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { ReactComponent as ZapSVG } from "./zap.svg";

interface Props extends BoxProps {
  token?: Nft;
  onZap?: (change: -1 | 0 | 1) => void;
}

const ZapIconButton: React.FC<Props> = (props: Props) => {
  const { children, className, onZap, token, ...rest } = props;
  const classes = useStyles();

  const [liked, setLiked] = useState<boolean>(false);
  const { oAuth } = useSelector(getMarketplace);
  const { wallet } = useSelector(getWallet);
  const [runLikeToken] = useAsyncTask("likeToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      setLiked(!!token?.isFavourited);
    }
  }, [token])

  const likeToken = () => {
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

      const newState = !liked;
      setLiked(newState);
      onZap?.(token.isFavourited === newState
        ? 0 
        : !token.isFavourited && newState ? 1 : -1);
    })
  }

  return (
    <IconButton {...rest} className={cls(classes.root, className)} size="small" onClick={likeToken}>
      <ZapSVG className={clsx(classes.zapLogo, { [classes.active]: liked })} />
    </IconButton>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  zapLogo: {
    height: "1em",
    width: "1em",
    color: "#DEFFFF",
  },
  active: {
    color: "#00FFB0",
  },
}));

export default ZapIconButton;
