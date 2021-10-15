import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { ArkBidsTable, ArkBreadcrumb } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Cheque, Nft } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { ReactComponent as VerifiedBadge } from "../Collection/verified-badge.svg";
import { ReactComponent as ZapSVG } from "./components/assets/zap.svg";
import { ReactComponent as EllipseSVG } from "./components/assets/ellipse.svg";
import { BuyDialog, SellDialog, NftImage } from "./components";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import cls from "classnames";

const NftView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const [token, setToken] = useState<Nft | null>(null);
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [bids, setBids] = useState<Cheque[]>([]);
  const [runGetBids] = useAsyncTask("getBids");
  const [saleInfo, setSaleInfo] = useState<Cheque | null>(null);
  const [runGetSales] = useAsyncTask("getSales");
  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    const arkClient = new ArkClient(network);
    runGetNFTDetails(async () => {
      const address = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftToken(address, tokenId);
      setToken(result.result.model);
    })
    runGetSales(async () => {
      const collectionAddress = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftCheques({ collectionAddress, tokenId, side: "sell" });
      setSaleInfo(result.result.entries[0]);
    })
    runGetBids(async () => {
      const collectionAddress = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftCheques({ collectionAddress, tokenId });

      setBids(result.result.entries);
    })

    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);

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
                  <Typography className={classes.zapScore} variant="h3">{token?.statistics?.favourites} <ZapSVG className={classes.zapLogo} /></Typography>
                  <Typography className={classes.infoBottom}>Like it? ZAP it!</Typography>
                </Box>
              </Box>
              <Box display="flex">
                <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoContainer}>
                  <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Price&nbsp;&nbsp;<Typography variant="body1">$20.000.09</Typography></Typography>
                  <Typography variant="h2" className={classes.price}>{saleInfo?.price || "-"}</Typography>
                  <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Last:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 day</Typography></Typography>
                  <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Best:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 hr</Typography></Typography>
                </Box>
                <Box marginLeft={1} display="flex" className={classes.buttonContainer}>
                  {isOwnToken && (
                    <Button className={classes.buyButton} disableRipple onClick={onSell}>
                      Sell
                    </Button>
                  )}
                  {!isOwnToken && (
                    <Button className={classes.buyButton} disableRipple onClick={onBuy}>
                      Buy Now
                    </Button>
                  )}
                </Box>
              </Box>

              <Box display="flex">
                <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoContainer}>
                  <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Ends on</Typography>
                  <Typography variant="body1" className={classes.saleHeader}>2 Oct 2021, 3.00pm</Typography>
                  <Box mt={1} display="flex"><Typography className={classes.expiryDate}><EllipseSVG /> 01 D : 04 H : 04 M : 17 S</Typography> <Box flexGrow={1} /> </Box>
                </Box>
                <Box marginLeft={1} display="flex" className={classes.buttonContainer}>
                  <Button className={classes.bidButton} disableRipple>
                    Place a Bid
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* TOOO: refactor into OngoingBidsBox */}
        {/* Ongoing bids */}
        <Box className={classes.bidsBox}>
          <Typography className={classes.bidsHeader}>Ongoing Bids</Typography>

          <ArkBidsTable bids={bids} />
        </Box>

        {/* Other info and price history */}
        <Box display="flex" mt={3}>
          {/* Other Info */}
          {/* Price History */}
        </Box>
      </Container >
      <BuyDialog />
      <SellDialog />
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
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    marginRight: theme.spacing(16),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(4, 5),
      width: "100%",
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
    maxWidth: 180,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #29475A",
    backgroundColor: "#003340",
    "& .MuiButton-label": {
      color: "#DEFFFF",
    },
    "&:hover": {
      backgroundColor: "rgba(222, 255, 255, 0.08)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
    float: "right",
    position: "absolute",
    marginTop: theme.spacing(4)
  },
  buyButton: {
    height: 56,
    maxWidth: 180,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#6BE1FF",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      backgroundColor: "rgba(107, 225, 255, 0.8)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
    float: "right",
    position: "absolute",
    marginTop: theme.spacing(4)
  },
  bidsBox: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(3, 5),
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
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      right: "0",
    }
  },
  imageInfoContainer: {
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
  },
  buttonContainer: {
    width: theme.spacing(16),
    overflow: "visible",
    direction: "rtl",
    [theme.breakpoints.down("xs")]: {
      width: 0
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
  }
}));

export default NftView;