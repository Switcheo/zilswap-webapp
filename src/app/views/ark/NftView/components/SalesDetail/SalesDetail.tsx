import React, { useMemo } from "react";
import { Box, BoxProps, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ReplayIcon from '@material-ui/icons/Replay';
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { toBech32Address } from "@zilliqa-js/crypto";
import { darken } from '@material-ui/core/styles';
import { ArkBox, FancyButton, ZapWidget } from "app/components";
import { getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useBlockTime, useNetwork, useToaster } from "app/utils";
import { ArkClient } from "core/utilities";
import { ReactComponent as VerifiedBadge } from "../assets/verified-badge.svg";
import { InfoBox, PrimaryPrice, SecondaryPrice } from "./components";
import { PriceInfo, PriceType } from "./types";

interface Props extends BoxProps {
  token: Nft;
  tokenId: string;
  isCancelling?: boolean | null;
  tokenUpdatedCallback: () => void;
}

const SalesDetail: React.FC<Props> = (props: Props) => {
  const { token, tokenId, children, className, tokenUpdatedCallback, isCancelling, ...rest } = props;
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const network = useNetwork();
  const toaster = useToaster(false);
  const { wallet } = useSelector(getWallet);
  const [blockTime, currentBlock] = useBlockTime();
  const [runResyncMetadata] = useAsyncTask("resyncMetadata");

  const isOwnToken = useMemo(() => {
    return (
      token.owner?.address &&
      wallet?.addressInfo.byte20?.toLowerCase() === token.owner?.address
    );
  }, [token, wallet?.addressInfo]);

  // compute where price information should be displayed
  const priceInfos: {
    primaryPrice?: PriceInfo,
    secondaryPrice1?: PriceInfo,
    secondaryPrice2?: PriceInfo,
  } = {}
  if (token.bestAsk) {
    priceInfos.primaryPrice = {
      type: PriceType.BestAsk,
      cheque: token.bestAsk
    }
  }
  if (token.bestBid) {
    const entry = priceInfos.primaryPrice ? 'secondaryPrice1' : 'primaryPrice'
    priceInfos[entry] = {
      type: PriceType.BestBid,
      cheque: token.bestBid
    }
  }
  if (token.lastTrade) {
    const entry = priceInfos.primaryPrice ? (priceInfos.secondaryPrice1 ? 'secondaryPrice2' : 'secondaryPrice1') : 'primaryPrice'
    priceInfos[entry] = {
      type: PriceType.LastTrade,
      cheque: token.lastTrade,
    }
  }

  const onSell = () => {
    if (!token.collection?.address) return;
    history.push(`/arky/collections/${toBech32Address(token.collection.address)}/${token.tokenId}/sell`);
  }

  const onBuy = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("open"));
  };

  const onBid = () => {
    dispatch(actions.Layout.toggleShowBidNftDialog("open"));
  };

  const onCancel = () => {
    dispatch(actions.Layout.toggleShowCancelSellNftDialog("open"));
  };

  const onResyncMetadata = () => {
    runResyncMetadata(async () => {
      const arkClient = new ArkClient(network);
      const { result } = await arkClient.resyncMetadata(token.collection!.address, token.tokenId);
      toaster(result.status);
    })
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        {/* Collection name */}
        <Box display="flex" flexDirection="row">
          <Box>
            <Typography className={classes.collectionName}>
              {token.collection?.name ?? ""}{" "}
              {token.collection?.verifiedAt && <VerifiedBadge className={classes.verifiedBadge} />}
            </Typography>
            {<Typography className={classes.tokenId}><span className={classes.hexSymbol}>{token.name?.replace(/#\s*\d+$/i, "")} #</span>{tokenId}</Typography>}
          </Box>
          <Box flexGrow={1} />
          <Box>
            <IconButton onClick={onResyncMetadata} className={classes.menuButton}><ReplayIcon /></IconButton>
          </Box>
        </Box>

        <Box mt={2} display="flex" flexDirection="column">
          <Box className={classes.infoBoxContainer}>
            {/* <InfoBox topLabel="ARKY Score" bottomLabel="Top 51.1%" tooltip={""} flex={1}>
              <Typography className={classes.rarityLabel} variant="h3">SUPAH RARE</Typography>
            </InfoBox> */}

            <InfoBox topLabel="ZAPs" bottomLabel="Like it? ZAP it!">
              <ZapWidget variant="bold" onZap={tokenUpdatedCallback} token={token} />
            </InfoBox>
          </Box>
          {priceInfos.primaryPrice &&
            <ArkBox className={classes.saleInfoContainer}>
              <PrimaryPrice data={priceInfos.primaryPrice} blockTime={blockTime} currentBlock={currentBlock} />
              <Box className={classes.secondaryInfo}>
                {priceInfos.secondaryPrice1 && <SecondaryPrice data={priceInfos.secondaryPrice1} blockTime={blockTime} currentBlock={currentBlock} mr={2} />}
                {priceInfos.secondaryPrice2 && <SecondaryPrice data={priceInfos.secondaryPrice2} blockTime={blockTime} currentBlock={currentBlock} />}
              </Box>
            </ArkBox>
          }
          <Box display="flex" className={cls(classes.buttonBox, { overlap: !!priceInfos.primaryPrice })}>
            {!isOwnToken && (
              <FancyButton containerClass={classes.button} className={classes.bidButton} disableRipple onClick={onBid}>
                Place Offer
              </FancyButton>
            )}
            {isOwnToken && token.bestAsk && (
              <FancyButton loading={!!isCancelling} containerClass={classes.button} className={classes.bidButton} disableRipple onClick={onCancel}>
                Cancel Listing
              </FancyButton>
            )}
            {isOwnToken && token.collection && (
              <FancyButton containerClass={classes.button} className={classes.buyButton} disableRipple onClick={onSell}>
                {token.bestAsk ? "Lower Price" : "Sell"}
              </FancyButton>
            )}
            {!isOwnToken && token.bestAsk && (
              <FancyButton containerClass={classes.button} className={classes.buyButton} disableRipple onClick={onBuy}>
                Buy Now
              </FancyButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: theme.spacing(1.5),
    border: theme.palette.border,
    color: theme.palette.text!.primary,
    boxShadow: theme.palette.type === "dark" ? "0px 4px 20px #002028" : 'none',
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "transparent",
  },
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    padding: theme.spacing(8, 9, 5, 6),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(4),
    },
  },
  tokenId: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 600,
    fontSize: "36px",
    lineHeight: "36px",
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(1),
    },
  },
  hexSymbol: {
    fontSize: '30px',
    overflowWrap: "anywhere",
  },
  buttonBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(-.5),
    marginLeft: theme.spacing(-.5),
    '&.overlap': {
      marginTop: theme.spacing(0),
      padding: theme.spacing(0, 4),
      transform: "translateY(-50%)",
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      '&.overlap': {
        marginTop: theme.spacing(3),
        padding: theme.spacing(0),
        transform: "translateY(0%)",
      }
    },
  },
  button: {
    flex: 1,
    margin: theme.spacing(0, .5),
    maxWidth: 280,
    [theme.breakpoints.down("sm")]: {
      maxWidth: "unset",
    },
  },
  bidButton: {
    padding: theme.spacing(2.5, 4),
    borderRadius: theme.spacing(1.5),
    backgroundColor: "#6BE1FF",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      border: 'none',
      backgroundColor: darken("#6BE1FF", 0.1),
      "& .MuiButton-label": {
        color: darken("#003340", 0.1),
      },
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  buyButton: {
    padding: theme.spacing(2.5, 4),
    borderRadius: theme.spacing(1.5),
    border: theme.palette.border,
    backgroundColor: "#FFDF6B",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      backgroundColor: darken("#FFDF6B", 0.15),
      "& .MuiButton-label": {
        color: darken("#003340", 0.15),
      },
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: "24px",
    letterSpacing: "0.2px",
  },
  infoBoxContainer: {
    display: "flex",
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-2),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  secondaryInfo: {
    display: "flex",
    flex: 1,
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  saleInfoContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    minHeight: theme.spacing(5),
    padding: theme.spacing(2.5, 4, 7),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
    },
  },
  rarityLabel: {
    color: "#7B61FF",
    fontFamily: "Avenir Next",
    fontWeight: 900,
    textAlign: "center",
    WebkitTextStroke: "4px #7B61FF33"
  },
  menuButton: {
    borderRadius: 8,
    padding: "8px",
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    "&:hover": {
      opacity: 0.5,
    },
    "& .MuiButton-label": {
      padding: "12px 14px",
    }
  },
  noPadding: {
    padding: 0,
    margin: 0,
  },
  verifiedBadge: {
    marginLeft: "4px",
    marginTop: 2,
    width: "20px",
    height: "20px",
    verticalAlign: "text-top",
    alignSelf: 'flex-start',
    [theme.breakpoints.down('md')]: {
      height: 14,
      width: 14,
    }
  },
}));

export default SalesDetail;
