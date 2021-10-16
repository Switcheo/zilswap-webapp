import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, MenuItem, ListItemIcon, Avatar, Badge, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import cls from "classnames";
import BigNumber from "bignumber.js";
import { ArkBidsTable, ArkBreadcrumb, ArkTab, CurrencyLogo, FancyButton } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getTokens, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Cheque, Nft, Profile, TokenInfo, TraitValue } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { ReactComponent as VerifiedBadge } from "../Collection/verified-badge.svg";
import { ReactComponent as ZapSVG } from "./components/assets/zap.svg";
import { ReactComponent as EllipseSVG } from "./components/assets/ellipse.svg";
import { BuyDialog, BidDialog, SellDialog, NftImage, TraitTable } from "./components";

const NftView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const { tokens, prices } = useSelector(getTokens);
  const [token, setToken] = useState<Nft>();
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [bids, setBids] = useState<Cheque[]>([]);
  const [runGetBids] = useAsyncTask("getBids");
  const [owner, setOwner] = useState<Profile>();
  const [runGetOwner] = useAsyncTask("getOwner");
  const [currentTab, setCurrentTab] = useState("Bids");
  const [traits, setTraits] = useState<TraitValue[]>([])
  const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null);
  const [tokenAmount, setTokenAmount] = useState<BigNumber | null>(null);
  const [purchaseCurrency, setPurchaseCurrency] = useState<TokenInfo>();

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    const arkClient = new ArkClient(network);
    runGetNFTDetails(async () => {
      const address = fromBech32Address(collectionId).toLowerCase()
      const { result } = await arkClient.getNftToken(address, tokenId);
      setToken(result.model);
      setTraits(result.model.traitValues);

      const { model: { owner } } = result
      if (owner) {
        runGetOwner(async () => {
          const ownerResult = await arkClient.getProfile(owner.address);
          setOwner(ownerResult.result.model)
        })
      }
    })
    runGetBids(async () => {
      const collectionAddress = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftCheques({ collectionAddress, tokenId });

      setBids(result.result.entries);
    })
    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);

  useEffect(() => {
    if (Object.keys(tokens).length && token && token.bestAsk) {
      const tok = tokens[token?.bestAsk?.price.address] || tokens[ZIL_ADDRESS];

      const placement = new BigNumber(10).pow(tok.decimals)
      const askPrice = token.bestAsk.price.amount
      setTokenPrice(new BigNumber(askPrice).div(placement).times(prices[tok.address]))
      setTokenAmount(new BigNumber(askPrice).div(placement));
      setPurchaseCurrency(tok)
    }
    // eslint-disable-next-line
  }, [tokens, token])

  const isOwnToken = useMemo(() => {
    return token?.owner?.address && wallet?.addressInfo.byte20?.toLowerCase() === token?.owner?.address;
  }, [token, wallet?.addressInfo]);

  const breadcrumbs = [
    { path: "/ark/collections", value: "Collections" },
    {
      path: `/ark/collections/${collectionId}`,
      value: "The Bear Market",
    },
    {
      path: `/ark/collections/${collectionId}/${tokenId}`,
      value: `#${tokenId}`,
    },
  ];

  const onSell = () => {
    dispatch(actions.Layout.toggleShowSellNftDialog("open"))
  };

  const onBuy = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("open"))
  };

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBreadcrumb linkPath={breadcrumbs} />

        {/* Nft image and main info */}
        <Box display="flex" mt={3} justifyContent="center" className={classes.imageInfoContainer}>
          <NftImage className={classes.bearImage} token={token} />
          <Box className={classes.mainInfoBox}>
            {/* Collection name */}
            <Typography className={classes.collectionName}>
              {token?.collection?.name || ""}{" "}
              <VerifiedBadge className={classes.verifiedBadge} />
            </Typography>

            {/* Token id */}
            <Typography className={classes.id}>#{tokenId}</Typography>

            <Box display="flex" flexDirection="column" gridGap={20}>
              <Box className={classes.scoreContainer} display="flex" justifyContent="flex-end">
                <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" className={classes.scoreLabel}>
                  <Box className={classes.labelInfo}>
                    <Typography variant="body1">ARK Score</Typography>&nbsp;<InfoOutlinedIcon className={classes.infoIcon} />
                  </Box>
                  <Typography className={classes.rarityLabel} variant="h3">SUPAH RARE</Typography>
                  <Typography className={classes.infoBottom}>Top 51.1%</Typography>
                </Box>
                <Box marginLeft={1} display="flex" flexDirection="column" alignItems="center" className={classes.zapLabel}>
                  <Box className={classes.labelInfo}>
                    <Typography variant="body1">ZAPs</Typography>&nbsp;<InfoOutlinedIcon className={classes.infoIcon} />
                  </Box>
                  <Typography className={classes.zapScore} variant="h3">{token?.statistics?.favourites || 0} <ZapSVG className={classes.zapLogo} /></Typography>
                  <Typography className={classes.infoBottom}>Like it? ZAP it!</Typography>
                </Box>
              </Box>
              <Box display="flex" className={classes.xsColumn}>
                <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoContainer}>
                  <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Price&nbsp;&nbsp;<Typography variant="body1">${tokenPrice ? tokenPrice.toFixed(11).toString() : "-"}</Typography></Typography>
                  <Typography variant="h2" className={classes.price}>{tokenAmount ? tokenAmount.toString() : "-"}{(tokenAmount && purchaseCurrency) ? <CurrencyLogo address={purchaseCurrency.address} currency={purchaseCurrency.symbol} /> : ""}</Typography>
                  <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Last:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 day</Typography></Typography>
                  <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Best:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 hr</Typography></Typography>
                </Box>
                {!isXs && (
                  <Box display="flex" className={classes.buttonContainer}>
                    {isOwnToken && (
                      <FancyButton className={classes.buyButton} disableRipple onClick={onSell}>
                        Sell
                      </FancyButton>
                    )}
                    {!isOwnToken && (
                      <FancyButton className={classes.buyButton} disableRipple onClick={onBuy}>
                        Buy Now
                      </FancyButton>
                    )}
                  </Box>
                )}
              </Box>

              <Box display="flex">
                <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoContainer}>
                  <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Ends on</Typography>
                  <Typography variant="body1" className={classes.saleHeader}>2 Oct 2021, 3.00pm</Typography>
                  <Box mt={1} display="flex"><Typography className={classes.expiryDate}><EllipseSVG /> 01 D : 04 H : 04 M : 17 S</Typography> <Box flexGrow={1} /> </Box>
                </Box>
                {!isXs && (
                  <Box display="flex" className={classes.buttonContainer}>
                    <FancyButton className={classes.bidButton} disableRipple>
                      Place a Bid
                    </FancyButton>
                  </Box>
                )}
              </Box>
              {isXs && (
                <Box display="flex" flexDirection="column">
                  {isOwnToken && (
                    <FancyButton fullWidth className={classes.buyButton} disableRipple onClick={onSell}>
                      Sell
                    </FancyButton>
                  )}
                  {!isOwnToken && (
                    <FancyButton fullWidth className={classes.buyButton} disableRipple onClick={onBuy}>
                      Buy Now
                    </FancyButton>
                  )}
                  <Box mt={2} />
                  <FancyButton fullWidth className={classes.bidButton} disableRipple>
                    Place a Bid
                  </FancyButton>
                </Box>
              )}
            </Box>

          </Box>
        </Box>

        {/* About info and trait table */}
        <Box mt={4} display="flex" className={classes.smColumn}>
          <Box display="flex" flexDirection="column" className={classes.aboutContainer}>
            <Typography variant="h1">About</Typography>
            <Typography className={classes.aboutText}>Well we aren't just a bear market. We are The Bear Market. We know a couple of fudders who have been releasing bears into the unknown, and because of you guys we now have a shelter full of lost and lonely bears.</Typography>
            <Typography className={classes.aboutText}> As much as we would love to care for all these unbearably cuddly bears, we simply can't keep up! Thus we've launched The Bear Market.</Typography>
            <Typography className={classes.aboutText}> Learn more at thebear.market.</Typography>
            <Box className={classes.xsColumn} mt={4} display="flex" justifyContent="center">
              <Box flexGrow={1}>
                <MenuItem className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon><Avatar className={classes.avatar} alt="owner" src={owner?.profileImage?.url || ""} /></ListItemIcon>
                  <Box marginLeft={1}>
                    <Typography>Owner</Typography>
                    <Typography variant="h3" className={classes.aboutNameText}>{owner?.username || "Unnamed"}</Typography>
                    <Typography>Lvl 1</Typography>
                  </Box>
                </MenuItem>
              </Box>
              <Box flexGrow={1}>
                <MenuItem className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon>
                    <Badge
                      overlap="circle"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <VerifiedBadge />
                      }
                    >
                      <Avatar className={classes.avatar} sizes="medium" alt="Remy Sharp" src={""} />
                    </Badge>
                  </ListItemIcon>
                  <Box marginLeft={1}>
                    <Typography className={classes.halfOpacity}>Creator</Typography>
                    <Typography variant="h3" className={classes.aboutNameText}>Switcheo Labs</Typography>
                    <Typography>10% Royalties</Typography>
                  </Box>
                </MenuItem>
              </Box>
            </Box>
          </Box>
          <Box flexGrow={1} flexDirection="column" className={classes.traitContainer}>
            <TraitTable traits={traits} />
          </Box>
        </Box>


        {/*Ark tabs */}
        <ArkTab setCurrentTab={(tab: string) => { setCurrentTab(tab) }} currentTab={currentTab} tabHeaders={["Bids", "Price History", "Event History"]} />

        <Box className={classes.bidsBox}>
          {currentTab === "Bids" && (
            <ArkBidsTable bids={bids} />
          )}
        </Box>

        {/* Other info and price history */}
        <Box display="flex" mt={3}>
          {/* Other Info */}
          {/* Price History */}
        </Box>
      </Container >
      {token && (
        <Fragment>
          <BuyDialog token={token} collectionAddress={collectionId} />
          <BidDialog token={token} collectionAddress={collectionId} />
          <SellDialog />
        </Fragment>
      )}
    </ArkPage >
  );
};


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  breadcrumbs: {
    marginTop: theme.spacing(3),
  },
  breadcrumb: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#6BE1FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  mainInfoBox: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    padding: theme.spacing(8),
    borderRadius: 12,
    border: "1px solid #29475A",
    marginRight: theme.spacing(20),
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      width: "100%",
      marginRight: theme.spacing(16),
    },
    [theme.breakpoints.down("xs")]: {
      marginRight: 0,
    },
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#DEFFFF",
    textTransform: "uppercase",
    marginLeft: theme.spacing(12),
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
    },
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "22px",
    height: "22px",
    verticalAlign: "text-bottom",
  },
  id: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "45px",
    color: "#DEFFFF",
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(12),
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
    },
  },
  bidButton: {
    height: 56,
    width: 180,
    borderRadius: 12,
    border: "1px solid #29475A",
    backgroundColor: "#003340",
    float: "right",
    position: "absolute",
    marginTop: theme.spacing(4),
    "& .MuiButton-label": {
      color: "#DEFFFF",
    },
    "&:hover": {
      backgroundColor: "rgba(222, 255, 255, 0.08)",
    },
    [theme.breakpoints.down("sm")]: {
      width: 150,
    },
    [theme.breakpoints.down("xs")]: {
      marginTop: 0,
      position: "relative",
      float: "none",
    },
  },
  buyButton: {
    height: 56,
    width: 180,
    borderRadius: 12,
    backgroundColor: "#6BE1FF",
    float: "right",
    position: "absolute",
    marginTop: theme.spacing(4),
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      backgroundColor: "rgba(107, 225, 255, 0.8)",
    },
    [theme.breakpoints.down("sm")]: {
      width: 150,
    },
    [theme.breakpoints.down("xs")]: {
      marginTop: 0,
      position: "inherit",
      float: "none",
      width: "100%"
    },
  },
  bidsBox: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(3, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  bidsHeader: {
    fontSize: "26px",
    lineHeight: "40px",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    color: "#DEFFFF",
  },
  bearImage: {
    paddingTop: theme.spacing(8),
    right: -theme.spacing(16),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      right: -theme.spacing(12),
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      right: "0",
      marginBottom: theme.spacing(1)
    }
  },
  imageInfoContainer: {
    [theme.breakpoints.down("sm")]: {
      left: theme.spacing(4),
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  },
  scoreContainer: {
    marginLeft: theme.spacing(12),
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
    },
  },
  scoreLabel: {
    padding: "8px 24px",
    borderRadius: "12px",
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: "fit-content",
  },
  zapLabel: {
    padding: "8px 24px",
    borderRadius: "12px",
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: theme.spacing(16),
  },
  saleInfoContainer: {
    border: `1px solid #003340`,
    borderRadius: "12px",
    padding: theme.spacing(3, 0, 3, 12),
    whiteSpace: "nowrap",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 3),
    },
  },
  saleHeader: {
    color: theme.palette.primary.contrastText,
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(1),
  },
  price: {
    color: "#00FFB0",
    fontFamily: "Avenir Next LT Pro",
    display: "flex",
    marginTop: theme.spacing(.5)
  },
  buttonContainer: {
    width: theme.spacing(16),
    overflow: "visible",
    direction: "rtl",
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      direction: "inherit",
      width: "100%",
    },
  },
  zapScore: {
    fontFamily: "Avenir Next LT Pro",
    display: "flex",
    justifyContent: "center",
  },
  zapLogo: {
    marginLeft: theme.spacing(1)
  },
  labelInfo: {
    display: "flex",
    alignItems: "center"
  },
  infoIcon: {
    opacity: 0.5,
    fontSize: 16
  },
  infoBottom: {
    opacity: 0.5,
    display: "flex",
    justifyContent: "center",
  },
  rarityLabel: {
    color: "#7B61FF",
    fontFamily: "Avenir Next LT Pro",
    fontWeight: 900,
    textAlign: "center",
  },
  expiryDate: {
    display: "flex",
    flexShrink: 1,
    alignItems: "center",
    padding: theme.spacing(0.6, 1.8),
    borderRadius: "12px",
    backgroundColor: "#DEFFFF",
    color: theme.palette.primary.main
  },
  halfOpacity: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText
  },
  aboutText: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText,
    marginTop: theme.spacing(1),
    fontSize: 14,
    lineHeight: 1.4,
  },
  linkText: {
  },
  aboutContainer: {
    maxWidth: 450,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(7, 6),
    borderRadius: 12,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      maxWidth: "none",
    },
  },
  traitContainer: {
    display: "flex",
    minWidth: 400,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(4, 5),
    borderRadius: 12,
    marginLeft: theme.spacing(2),
    overflowX: 'auto',
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      minWidth: 0,
      marginTop: theme.spacing(2),
    },
  },
  aboutMenuItem: {
    extend: 'text',
    padding: "0",
    maxWidth: 200,
    margin: 0,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1),
    },
  },
  avatar: {
    width: 65,
    height: 65,
  },
  aboutNameText: {
    color: "#6BE1FF",
    fontWeight: "bold",
  },
  xsColumn: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  },
  smColumn: {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  }
}));

export default NftView;