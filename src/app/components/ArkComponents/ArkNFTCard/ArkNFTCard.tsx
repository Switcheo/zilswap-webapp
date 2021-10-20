import React, { Fragment, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Card, CardActionArea, CardContent, CardMedia,
  CardProps, IconButton, Link, makeStyles, Typography
} from "@material-ui/core";
import DotIcon from "@material-ui/icons/FiberManualRecordRounded";
import LaunchIcon from "@material-ui/icons/Launch";
import cls from "classnames";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { Link as RouterLink } from "react-router-dom";
import { Nft } from "app/store/marketplace/types";
import { AppTheme } from "app/theme/types";
import { getWallet, getTokens } from "app/saga/selectors";
import { RootState, MarketPlaceState, OAuth } from "app/store/types";
import { actions } from "app/store";
import { toHumanNumber, truncate, useAsyncTask, useBlockTime } from "app/utils";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ArkClient } from "core/utilities";
import { toBech32Address } from "core/zilswap";
import { BLOCKS_PER_MINUTE } from 'core/zilo/constants';
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";
import { ReactComponent as ZappedSVG } from "./zapped.svg";
import { ReactComponent as UnZapSVG } from "./unzap.svg";

export interface Props extends CardProps {
  token: Nft;
  collectionAddress: string;
  dialog?: boolean;
  // tx href
}

const ArkNFTCard: React.FC<Props> = (props: Props) => {
  const { className, token, collectionAddress, dialog, ...rest } = props;
  const classes = useStyles();
  const [liked, setLiked] = useState<boolean>(!!token.isFavourited);
  const { oAuth, filter } = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const { wallet } = useSelector(getWallet);
  const { tokens } = useSelector(getTokens);
  const [runLikeToken] = useAsyncTask("likeToken");
  const dispatch = useDispatch();
  const [blockTime, currentBlock, currentTime] = useBlockTime();


  useEffect(() => {
    if (token) setLiked(!!token.isFavourited);
  }, [token])

  const bestAsk = useMemo(() => {
    if (!token?.bestAsk) return undefined;
    const expiryTime = blockTime.add((token?.bestAsk?.expiry - currentBlock) / BLOCKS_PER_MINUTE, "minutes");
    const hoursLeft = expiryTime.diff(currentTime, "hours");
    const minsLeft = expiryTime.diff(currentTime, "minutes");
    const secLeft = expiryTime.diff(currentTime, "seconds");


    const askToken = tokens[token?.bestAsk?.price.address] || tokens[ZIL_ADDRESS];
    const placement = new BigNumber(10).pow(askToken.decimals);
    const amount = new BigNumber(token?.bestAsk?.price.amount).div(placement);
    return { expiryTime, hoursLeft, minsLeft, secLeft, amount, askToken };
    // eslint-disable-next-line
  }, [blockTime, token.bestAsk, tokens])

  const bestBid = useMemo(() => {
    if (!token?.bestBid) return undefined;

    const expiryTime = blockTime.add((token?.bestBid?.expiry - currentBlock) / BLOCKS_PER_MINUTE, "minutes");
    const timeLeft = expiryTime.fromNow();
    const bidToken = tokens[token?.bestBid?.price.address] || tokens[ZIL_ADDRESS];
    const placement = new BigNumber(10).pow(bidToken.decimals);
    const amount = new BigNumber(token?.bestBid?.price.amount).div(placement);
    return { amount, timeLeft, bidToken };
    // eslint-disable-next-line
  }, [blockTime, token?.bestBid, tokens])

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
      dispatch(actions.MarketPlace.updateFilter({ ...filter }));
    })
  }

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <Box className={classes.borderBox}>
        {!dialog && (
          <Box className={classes.cardHeader}>
            {/* to accept as props */}
            <Box display="flex" flexDirection="column" justifyContent="center">
              {bestAsk && (
                <Typography className={classes.bid}>
                  <DotIcon className={classes.dotIcon} /> BID LIVE {bestAsk.hoursLeft}:{bestAsk.minsLeft}:{bestAsk.secLeft} Left
                </Typography>
              )}
              {bestBid && (
                <Typography className={classes.lastOffer}>
                  Last Offer {toHumanNumber(bestBid.amount)} {bestBid.bidToken.symbol}
                </Typography>
              )}
            </Box>
            <Box display="flex" alignItems="center">
              <Typography className={classes.likes}>{toHumanNumber(token.statistics?.favourites)}</Typography>
              <IconButton
                onClick={() => likeToken()}
                className={classes.likeIconButton}
                disableRipple
              >
                {liked ? <ZappedSVG className={classes.likeButton} /> : <UnZapSVG className={classes.likeButton} />}
              </IconButton>
            </Box>
          </Box>
        )}
        <CardActionArea
          component={RouterLink}
          to={`/ark/collections/${toBech32Address(collectionAddress)}/${token.tokenId}`}
        >
          <CardMedia
            className={classes.image}
            component="img"
            alt="NFT image"
            height="308"
            image={token.asset?.url}
          />
        </CardActionArea>
      </Box>
      <CardContent className={classes.cardContent}>
        <Box className={classes.bodyBox}>
          {!dialog ? (
            <Fragment>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* to truncate if too long? */}
                <Typography className={classes.title}>
                  {token.name}
                  <VerifiedBadge className={classes.verifiedBadge} />
                </Typography>
                {bestAsk && <Typography className={classes.title}>{bestAsk?.amount}{bestAsk?.askToken.symbol}</Typography>}
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={0.5}
              >
                <Typography className={classes.body}>
                  #{token.tokenId}
                </Typography>
                <Box display="flex">
                  <Typography className={classes.body}>owned by&nbsp;</Typography>
                  <Link
                    className={classes.link}
                    underline="hover"
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`/ark/profile?address=${token.owner?.address}`}
                  >
                    <Typography className={classes.username}>
                      {(
                        (token?.owner && token?.owner?.address?.length > 15)
                          ? (truncate(token.owner?.username, 10))
                          : token.owner?.username
                      ) || "Unnamed"}
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </Fragment>
          ) : (
            <Fragment>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography className={classes.dialogTitle}>
                  #{token.tokenId}
                </Typography>
                <Link
                  className={classes.link}
                  underline="hover"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={"/"}
                >
                  <Typography>
                    View on explorer
                    <LaunchIcon className={classes.linkIcon} />
                  </Typography>
                </Link>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={0.5}
              >
                <Typography className={classes.dialogBody}>
                  {token.name}
                  <VerifiedBadge className={classes.verifiedBadge} />
                </Typography>
              </Box>
            </Fragment>
          )}
        </Box>

        {/* TODO: refactor and take in a rarity as prop */}
        {/* Rarity indicator */}
        <Box className={classes.rarityBackground}>
          <Box className={classes.rarityBar} />
        </Box>
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: "100%",
    minWidth: "280px",
    borderRadius: 10,
    boxShadow: "none",
    backgroundColor: "transparent",
    position: "relative",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "240px",
    },
  },
  borderBox: {
    border: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "rgba(0, 51, 64, 0.5)"
      }`,
    borderRadius: 10,
    // border: "1px solid transparent",
    // backgroundImage:
    //   theme.palette.type === "dark"
    //     ? "linear-gradient(transparent, transparent), linear-gradient(#29475A, #29475A)"
    //     : "linear-gradient(transparent, transparent), linear-gradient(to right, green, gold)",
    // backgroundOrigin: "border-box",
    // backgroundClip: "content-box, border-box",
  },
  image: {
    borderRadius: "0px 0px 10px 10px!important",
  },
  tokenId: {
    color: "#511500",
    fontSize: "40px",
    lineHeight: "50px",
    [theme.breakpoints.down("md")]: {
      fontSize: "30px",
      lineHeight: "40px",
    },
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1, 1.5),
  },
  bid: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "13px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  dotIcon: {
    fontSize: "inherit",
    color: "#FF5252",
    verticalAlign: "middle",
    paddingBottom: "1.5px",
    marginLeft: "-2px",
    marginRight: "2px",
  },
  lastOffer: {
    color: theme.palette.primary.light,
    fontSize: "12px",
    lineHeight: "14px",
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
  cardContent: {
    marginLeft: "-16px",
    marginRight: "-16px",
    paddingBottom: 0,
  },
  title: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "14px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
    textTransform: "uppercase",
  },
  bodyBox: {
    padding: theme.spacing(0, 1.5),
  },
  body: {
    fontSize: "12px",
    fontWeight: 700,
    color: theme.palette.primary.light,
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "15px",
    height: "15px",
    verticalAlign: "text-top",
  },
  rarityBackground: {
    backgroundColor: "rgba(107, 225, 255, 0.2)",
    borderRadius: 5,
    display: "flex",
    marginTop: theme.spacing(1),
    padding: "3px",
  },
  rarityBar: {
    display: "flex",
    backgroundColor: "#6BE1FF",
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  link: {
    "& .MuiTypography-root": {
      fontSize: "14px",
    },
    color: theme.palette.text?.secondary,
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    fontSize: "14px",
    verticalAlign: "top",
    paddingBottom: "1px",
    "& path": {
      fill: theme.palette.text?.secondary,
    },
  },
  dialogTitle: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: "30px",
  },
  dialogBody: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "14px",
    lineHeight: "16px",
  },
  username: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#6BE1FF",
  }
}));

export default ArkNFTCard;
