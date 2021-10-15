import {
  Box, Card, CardHeader, CardMedia, CardProps, IconButton,
  SvgIcon, Typography, CardContent
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UnlikedIcon from "@material-ui/icons/FavoriteBorderRounded";
import LikedIcon from "@material-ui/icons/FavoriteRounded";
import { SocialLinkGroup } from "app/components";
import { Nft } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState, useEffect } from "react";
import { useAsyncTask } from "app/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState, MarketPlaceState, OAuth, WalletState } from "app/store/types";
import { ArkClient } from "core/utilities";
import dayjs from "dayjs";
import { actions } from "app/store";


interface Props extends CardProps {
  token?: Nft | null,
}

const NftImage: React.FC<Props> = (props: Props) => {
  const { token, children, className, ...rest } = props;
  const classes = useStyles();
  const [liked, setLiked] = useState<boolean>(false);
  const { oAuth } = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const { wallet } = useSelector<RootState, WalletState>((state) => state.wallet);
  const [runLikeToken] = useAsyncTask("likeToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      setLiked(!!token.isFavourited);
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
      setLiked(!liked);
    })
  }

  return (
    <Box  {...rest} className={cls(classes.root, className)}>
      <Card className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Box display="flex" alignItems="center">
              <Typography className={classes.likes}>20K</Typography>
              <IconButton
                onClick={() => likeToken()}
                className={classes.likeIconButton}
                disableRipple
              >
                <SvgIcon
                  component={liked ? LikedIcon : UnlikedIcon}
                  className={classes.likeButton}
                />
              </IconButton>
            </Box>
          } />

        <CardContent className={classes.cardContent}>
          <CardMedia
            alt={token?.asset?.filename || "Token Image"}
            component="img"
            image={token?.asset?.url || undefined}
            className={classes.media}
          />
        </CardContent>
      </Card>
      <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Typography>Share</Typography><SocialLinkGroup />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    maxWidth: 450,
    [theme.breakpoints.down("xs")]: {
      maxWidth: "none",
    },
  },
  card: {
    background: "rgba(76, 175, 80, 0.0)",
  },
  cardHeader: {
    border: "2px solid #29475A",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    "&.MuiCardHeader-root": {
      padding: "6px 16px 6px 16px"
    }
  },
  cardContent: {
    padding: 0,
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    "&.MuiCardContent-root:last-child": {
      padding: 0,
    }
  },
  media: {
    width: "calc(100% + 20px)",
    height: "calc(100% + 20px)",
    objectFit: "cover",
    backgroundPositionX: "center",
    transform: "translate(-10px)",
    overflow: "hidden",
  },
  likes: {
    color: theme.palette.label,
    fontSize: "12px",
    lineHeight: "14px",
    marginRight: "4px",
  },
  likeIconButton: {
    padding: 0,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  likeButton: {
    color: theme.palette.primary.light,
  },
}));

export default NftImage;
