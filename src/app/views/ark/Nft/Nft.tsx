import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { Box, Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { ArkBidsTable, ArkBreadcrumb } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Cheque, Nft } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ReactComponent as VerifiedBadge } from "../Collection/verified-badge.svg";
import { BuyDialog, SellDialog } from "./components";

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
    flexDirection: "column",
    padding: theme.spacing(8, 10),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 5),
      width: "100%",
    },
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#DEFFFF",
    textTransform: "uppercase",
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
  },
  buyButton: {
    height: 56,
    minWidth: 200,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #29475A",
    "& .MuiButton-label": {
      color: "#DEFFFF",
    },
    "&:hover": {
      backgroundColor: "rgba(222, 255, 255, 0.08)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
  },
  bidButton: {
    height: 56,
    minWidth: 200,
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
  tableContainer: {
    "&::-webkit-scrollbar": {
      width: "0.4rem",
      height: "0.4rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(222, 255, 255, 0.1)",
      borderRadius: 12,
    },
  },
  tableHead: {
    "& th.MuiTableCell-root": {
      borderBottom: "none",
      padding: "10px 6px",
      "& .MuiTypograhy-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
      },
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  tableRow: {
    "& .MuiTableCell-root": {
      border: "1px transparent",
      padding: "6px",
      "& .MuiTypography-root": {
        fontSize: "16px",
        lineHeight: "20px",
      },
      color: "#DEFFFF",
    },
  },
}));

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
    runGetBids(async () => {
      const address = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftCheques(address, tokenId);

      setBids(result.result.entries);
    })

    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);


  const isOwnToken = useMemo(() => {
    return token?.user?.address && wallet?.addressInfo.byte20?.toLowerCase() === token?.user?.address;
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
        <Box display="flex" mt={3} justifyContent="flex-end">
          <Box className={classes.mainInfoBox}>
            {/* Collection name */}
            <Typography className={classes.collectionName}>
              the bear market{" "}
              <VerifiedBadge className={classes.verifiedBadge} />
            </Typography>

            {/* Token id */}
            <Typography className={classes.id}>#{tokenId}</Typography>

            <Box display="flex" mt={2} gridGap={20}>
              {/* Buy button */}
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

              {/* Bid button */}
              <Button className={classes.bidButton} disableRipple>
                Place a Bid
              </Button>
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
      </Container>
      <BuyDialog />
      <SellDialog />
    </ArkPage>
  );
};

export default NftView;
