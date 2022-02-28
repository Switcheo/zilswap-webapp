import React, { Fragment, useMemo, useState } from "react";
import {
  Box, Card, CardActionArea, CardContent, CardProps,
  ClickAwayListener, IconButton, Link, makeStyles, Popper, Typography
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { Network } from "zilswap-sdk/lib/constants";
import { ArkOwnerLabel, ArkImageView, ZapWidget, CurrencyLogo, ArkSocialShareDialog } from "app/components";
import { getTokens, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft } from "app/store/marketplace/types";
import { MarketPlaceState, OAuth, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, toHumanNumber, useAsyncTask, useBlockTime, useNetwork, useToaster } from "app/utils";
import { ArkClient } from "core/utilities";
import { BLOCKS_PER_MINUTE } from 'core/zilo/constants';
import { toBech32Address } from "core/zilswap";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";

export interface Props extends CardProps {
  token: Nft;
  collectionAddress: string;
  dialog?: boolean;
  // tx href
}

const ArkNFTCard: React.FC<Props> = (props: Props) => {
  const { className, token, collectionAddress, dialog, ...rest } = props;
  const classes = useStyles();
  const { oAuth } = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const { wallet } = useSelector(getWallet);
  const { tokens } = useSelector(getTokens);
  const [runUpdateProfileImage] = useAsyncTask("updateProfileImage", () => {
    toaster("Error setting profile image")
  });
  const [runResyncMetadata] = useAsyncTask("resyncMetadata");
  const dispatch = useDispatch();
  const [blockTime, currentBlock, currentTime] = useBlockTime();
  const network = useNetwork();
  const [popAnchor, setPopAnchor] = useState(null);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const toaster = useToaster(false);
  const isOwner = wallet?.addressInfo.byte20.toLowerCase() === token.owner?.address.toLowerCase();

  const bestAsk = useMemo(() => {
    if (!token.bestAsk) return undefined;
    const expiryTime = blockTime.add((token.bestAsk?.expiry - currentBlock) / BLOCKS_PER_MINUTE, "minutes");
    const hoursLeft = expiryTime.diff(currentTime, "hours");
    const minsLeft = expiryTime.diff(currentTime, "minutes");
    const secLeft = expiryTime.diff(currentTime, "seconds");

    const askToken = tokens[toBech32Address(token.bestAsk.price.address)];
    if (!askToken) return undefined;

    const amount = bnOrZero(token.bestAsk?.price.amount).shiftedBy(-askToken.decimals);
    return { expiryTime, hoursLeft, minsLeft, secLeft, amount, askToken };
    // eslint-disable-next-line
  }, [blockTime, token.bestAsk, tokens])

  const bestBid = useMemo(() => {
    if (!token.bestBid) return undefined;

    const expiryTime = blockTime.add((token.bestBid?.expiry - currentBlock) / BLOCKS_PER_MINUTE, "minutes");
    const timeLeft = expiryTime.fromNow();
    const bidToken = tokens[toBech32Address(token.bestBid.price.address)];
    if (!bidToken) return undefined;

    const amount = bnOrZero(token.bestBid?.price.amount).shiftedBy(-bidToken.decimals);
    return { amount, timeLeft, bidToken };
    // eslint-disable-next-line
  }, [blockTime, token.bestBid, tokens])

  const lastTrade = useMemo(() => {
    if (!token.lastTrade) return undefined;

    const lastTradeToken = tokens[toBech32Address(token.lastTrade.price.address)];
    if (!lastTradeToken) return;

    const amount = bnOrZero(token.lastTrade.price.amount).shiftedBy(-lastTradeToken.decimals);
    return { amount, lastTradeToken };
  }, [token.lastTrade, tokens])

  const explorerLink = useMemo(() => {
    const addr = toBech32Address(collectionAddress);
    if (network === Network.MainNet) {
      return `https://viewblock.io/zilliqa/address/${addr}?txsType=nft&specific=${token.tokenId}`;
    } else {
      return `https://viewblock.io/zilliqa/address/${addr}?txsType=nft&specific=${token.tokenId}&network=testnet`;
    }
  }, [network, collectionAddress, token.tokenId]);
  const setAsProfileImage = () => {
    runUpdateProfileImage(async () => {
      if (!token.asset?.url) {
        toaster("Invalid image url");
        return;
      }

      setPopAnchor(null);
      const arkClient = new ArkClient(wallet!.network)
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }
      const address = wallet!.addressInfo.byte20.toLowerCase()

      await arkClient.setNFTAsProfile(address, checkedOAuth!.access_token, token.collection.address, token.tokenId + "");
      dispatch(actions.MarketPlace.loadProfile());
      toaster(`Set ${token.tokenId} as profile image`);
    })
  }

  const handlePopClick = (event: React.BaseSyntheticEvent) => {
    setPopAnchor(popAnchor ? null : event.currentTarget)
  }

  const handleOnZap = () => {
    dispatch(actions.MarketPlace.reloadTokenList())
  }

  const onResyncMetadata = () => {
    runResyncMetadata(async () => {
      const arkClient = new ArkClient(network);
      const { result } = await arkClient.resyncMetadata(collectionAddress, token.tokenId);
      toaster(result.status);
      setPopAnchor(null)
    })
  }

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <Box className={classes.borderBox}>
        {!dialog && (
          <Box className={classes.cardHeader}>
            {/* to accept as props */}
            <Box pl={0.5} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
              {bestBid && (
                <Typography className={classes.secondaryPrice}>
                  <Typography className={classes.secondaryPriceLabel}>Best</Typography>
                  <Typography component="span" style={{ fontWeight: 700 }}>{toHumanNumber(bestBid.amount, 2)}</Typography>
                  <CurrencyLogo
                    currency={bestBid.bidToken.symbol}
                    address={bestBid.bidToken.address}
                    className={classes.tokenLogo}
                  />
                </Typography>
              )}
              {lastTrade && (
                <Typography className={cls(classes.secondaryPrice, { [classes.extraMargin]: bestBid })}>
                  <Typography className={classes.secondaryPriceLabel}>Last</Typography>
                  <Typography component="span" style={{ fontWeight: 700 }}>{toHumanNumber(lastTrade.amount, 2)}</Typography>
                  <CurrencyLogo
                    currency={lastTrade.lastTradeToken.symbol}
                    address={lastTrade.lastTradeToken.address}
                    className={classes.tokenLogo}
                  />
                </Typography>
              )}
            </Box>
            <ZapWidget onZap={handleOnZap} token={token} />
          </Box>
        )}
        {!dialog ? (
          <CardActionArea
            className={classes.cardActionArea}
            component={RouterLink}
            to={`/arky/collections/${toBech32Address(collectionAddress)}/${token.tokenId}`}
          >
            <Box className={classes.imageContainer}>
              <span className={classes.imageHeight} />
              <ArkImageView
                className={classes.image}
                altName={token.asset?.filename || "Token Image"}
                imageUrl={token.asset?.url}
                imageType="card"
              />
            </Box>
          </CardActionArea>
        ) : <Box className={classes.imageContainer}>
          <span className={classes.imageHeight} />
          <ArkImageView
            className={classes.image}
            altName={token.asset?.filename || "Token Image"}
            imageUrl={token.asset?.url}
            imageType="card"
          />
        </Box>}
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
                  <Typography className={cls(classes.title, classes.overflowWrap)}>
                    {token.name}
                    {token.collection.verifiedAt && (<VerifiedBadge className={classes.verifiedBadge} />)}
                  </Typography>
                  {bestAsk && (
                    <Typography className={cls(classes.title, classes.flex)}>
                      <Typography component="span" className={classes.bestAsk}>
                        {toHumanNumber(bestAsk.amount)}
                      </Typography>
                      <CurrencyLogo
                        currency={bestAsk.askToken.symbol}
                        address={bestAsk.askToken.address}
                        className={classes.tokenLogo}
                      />
                    </Typography>
                  )}
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                  mb={0.5}
                >
                  <Typography className={classes.body}>
                    #{token.tokenId}
                  </Typography>
                  <Box display="flex">
                    <Typography className={classes.body}>Owned by&nbsp;</Typography>
                    <ArkOwnerLabel user={token.owner} />
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
                    href={explorerLink}
                  >
                    <Typography>
                      View on explorer
                      <LaunchIcon className={classes.linkIcon} />
                    </Typography>
                  </Link>
                  {/* <ArkOwnerLabel user={token.owner} /> */}
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={0.5}
                  mb={1.5}
                >
                  <Typography className={classes.dialogBody}>
                    {token.name}
                    {token.collection.verifiedAt && (<VerifiedBadge className={classes.verifiedBadge} />)}
                  </Typography>
                </Box>
              </Fragment>
            )}

            <Box display="flex">
              <Box flex={1} />
              {!dialog &&
                <IconButton size="small" className={classes.extrasButton} onClick={handlePopClick}>
                  <MoreHorizIcon />
                </IconButton>
              }
              {popAnchor && (
                <ClickAwayListener onClickAway={() => setPopAnchor(null)}>
                  <Popper className={classes.popper} open anchorEl={popAnchor} placement="bottom-end">
                    <Link
                      className={classes.popperText}
                      underline="none"
                      rel="tonftpage"
                      href={`/arky/collections/${toBech32Address(collectionAddress)}/${token.tokenId}`}
                    >
                      <Typography className={classes.popperText}>View NFT</Typography>
                    </Link>
                    {isOwner && (
                      <>
                        <Box className={classes.divider} />
                        <Link
                          className={classes.popperText}
                          underline="none"
                          rel="tonftpage"
                          href={`/arky/collections/${toBech32Address(collectionAddress)}/${token.tokenId}/sell`}
                        >
                          <Typography className={classes.popperText}>Sell</Typography>
                        </Link>
                        <Box className={classes.divider} />
                        <Typography onClick={setAsProfileImage} className={classes.popperText}>Set as profile picture</Typography>

                      </>
                    )}
                    <Box className={classes.divider} />
                    <Typography onClick={() => { setOpenShareDialog(true); setPopAnchor(null); }} className={classes.popperText}>Share NFT</Typography>
                    <Box className={classes.divider} />
                    <Typography onClick={onResyncMetadata} className={classes.popperText}>Reload Metadata</Typography>
                  </Popper>
                </ClickAwayListener>
              )}
            </Box>
          </Box >

          {/* TODO: refactor and take in a rarity as prop */}
          {/* Rarity indicator */}
          <Box className={classes.rarityBackground}>
            <Box className={classes.rarityBar} />
          </Box>
        </CardContent >
      </Box >
      <ArkSocialShareDialog open={openShareDialog} onCloseDialog={() => setOpenShareDialog(false)} tokenId={token.tokenId} collectionAddress={toBech32Address(collectionAddress)} />
    </Card >
  );
};

const borderColor = (theme: AppTheme) => theme.palette.type === 'dark' ? '#29475A' : 'rgba(41, 71, 90, 0.15)'
const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: "100%",
    minWidth: "280px",
    borderRadius: '10px 10px 0 0',
    boxShadow: "none",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "initial",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "240px",
    },
  },
  cardHeader: {
    borderRadius: '10px 10px 0 0',
    border: theme.palette.border,
    borderBottom: "none",
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1.7, 1.3),
  },
  cardContent: {
    marginLeft: "-16px",
    marginRight: "-16px",
  },
  cardActionArea: {
    border: "none",
    borderRadius: 0,
    paddingBottom: 0,
    background: `linear-gradient(to top, transparent 0%, ${borderColor(theme)} 100%)`,
    '&:before': {
      content: '',
      backgroundImage: `linear-gradient(to bottom, transparent 0%, ${borderColor(theme)} 100%)`,
      top: -10,
      left: -10,
      bottom: -10,
      right: -10,
      position: 'absolute',
      zIndex: -1,
    },
  },
  extrasButton: {
    color: theme.palette.text?.primary,
    alignSelf: "flex-end",
    marginRight: -7,
    opacity: 0.5,
    fontSize: "12px",
    cursor: "pointer",
    "&:hover": {
      opacity: 1,
    },
    "& svg": {
      fontSize: 24,
    },
  },
  borderBox: {
    borderRadius: '10px 10px 0 0',
    margin: '1px 1px 0 1px',
    // background: 'theme.palette.background.default',
  },
  imageContainer: {
    borderRadius: '0px 0px 8px 8px',
    width: "100%",
    position: "relative",
  },
  imageHeight: {
    display: "block",
    position: "relative",
    paddingTop: "100%",
  },
  image: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    objectFit: "contain",
  },
  dialogImage: {
    borderRadius: "10px"
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
  bestAsk: {
    fontFamily: 'Avenir Next',
    fontSize: 14,
    fontWeight: 700,
  },
  tokenLogo: {
    height: 18,
    width: 18,
    marginLeft: 1,
    marginTop: -2,
  },
  secondaryPrice: {
    display: 'flex',
    color: theme.palette.text!.primary,
    fontSize: "12px",
    lineHeight: "14px",
  },
  secondaryPriceLabel: {
    opacity: 0.6,
    marginRight: 6,
  },
  title: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "14px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  flex: {
    display: "flex"
  },
  bodyBox: {
    padding: theme.spacing(0, 1.5),
  },
  body: {
    fontFamily: 'Avenir Next',
    fontSize: "12px",
    fontWeight: 600,
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
    fontFamily: 'Avenir Next',
    fontSize: "12px",
    fontWeight: 600,
    color: "#6BE1FF",
    maxWidth: 100,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap"
  },
  popper: {
    backgroundColor: "#003340",
    border: "2px solid #29475A",
    padding: theme.spacing(1, 2),
    borderRadius: 12,
  },
  divider: {
    border: "1px solid #29475A",
  },
  popperText: {
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1, 0, 1),
    cursor: "pointer",
    "&:hover": {
      color: "#6BE1FF",
    }
  },
  extraMargin: {
    marginLeft: 6,
  },
  overflowWrap: {
    overflowWrap: "anywhere",
  }
}));

export default ArkNFTCard;
