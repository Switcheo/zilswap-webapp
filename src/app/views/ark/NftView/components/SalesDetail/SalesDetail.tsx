import React, { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { toBech32Address } from "@zilliqa-js/crypto";
import { CurrencyLogo, FancyButton, Text, ZapIconButton } from "app/components";
import { getTokens, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, useValueCalculators, useBlockTime } from "app/utils";
import { ZIL_ADDRESS, PRICE_REGEX } from "app/utils/constants";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { InfoBox } from "./components";

interface Props extends BoxProps {
  token?: Nft;
  tokenId: string;
}

const SalesDetail: React.FC<Props> = (props: Props) => {
  const { token, tokenId, children, className, ...rest } = props;
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const { wallet } = useSelector(getWallet);
  const { tokens, prices } = useSelector(getTokens);
  const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null);
  const [tokenAmount, setTokenAmount] = useState<BigNumber | null>(null);
  const [zapChange, setZapChange] = useState<number>(0);
  const [purchaseCurrency, setPurchaseCurrency] = useState<TokenInfo>();
  const valueCalculator = useValueCalculators();
  const [blockTime, currentBlock, currentTime] = useBlockTime();

  const isOwnToken = useMemo(() => {
    return (
      token?.owner?.address &&
      wallet?.addressInfo.byte20?.toLowerCase() === token?.owner?.address
    );
  }, [token, wallet?.addressInfo]);

  const bestBid = useMemo(() => {
    if (!token?.bestBid) return undefined;

    const bidToken = tokens[token?.bestBid?.price.address] || tokens[ZIL_ADDRESS]
    if (!bidToken) return undefined;

    const blocksLeft = token.bestBid.expiry - currentBlock;
    const expiryTime = currentTime.add(blocksLeft * BLOCKS_PER_MINUTE, "minutes");
    const expireText = expiryTime.isAfter(dayjs()) ? "Expires " + expiryTime.fromNow() : "Expired " + expiryTime.fromNow();

    return { amount: bnOrZero(token?.bestBid?.price.amount).shiftedBy(-bidToken?.decimals ?? 0), timeLeft: expireText, token: bidToken }
    // eslint-disable-next-line
  }, [token?.bestBid, tokens, blockTime])

  const lastTrade = useMemo(() => {
    if (!token?.lastTrade) return undefined;

    const tradeToken = tokens[token?.lastTrade?.price.address] || tokens[ZIL_ADDRESS]
    if (!tradeToken) return undefined;

    return {
      amount: bnOrZero(token?.lastTrade?.price.amount).shiftedBy(-tradeToken?.decimals ?? 0), token: tradeToken
    }
  }, [token?.lastTrade, tokens])

  useEffect(() => {
    if (Object.keys(tokens).length && token && token.bestAsk) {
      const priceToken = tokens[token?.bestAsk?.price.address] || tokens[ZIL_ADDRESS];

      const askPrice = bnOrZero(token.bestAsk.price.amount)
      const usdPrice = valueCalculator.amount(prices, priceToken, askPrice);
      setTokenPrice(usdPrice)
      setTokenAmount(askPrice.shiftedBy(-priceToken.decimals));
      setPurchaseCurrency(priceToken)
    }
  }, [tokens, token, valueCalculator, prices]);

  const onSell = () => {
    if (!token?.collection?.address) return;
    history.push(`/ark/collections/${toBech32Address(token.collection.address)}/${token.tokenId}/sell`);
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

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        {/* Collection name */}
        <Typography className={classes.collectionName}>
          {token?.collection?.name ?? ""}{" "}
          {/* <VerifiedBadge className={classes.verifiedBadge} /> */}
        </Typography>

        {/* Token id */}
        <Typography className={classes.id}>#{tokenId}</Typography>

        <Box mt={2} display="flex" flexDirection="column">
          <Box className={classes.infoBoxContainer}>
            <InfoBox topLabel="ARK Score" bottomLabel="Top 51.1%" tooltip={""} flex={1}>
              <Typography className={classes.rarityLabel} variant="h3">SUPAH RARE</Typography>
            </InfoBox>

            <InfoBox topLabel="ZAPs" bottomLabel="Like it? ZAP it!" tooltip={""}>
              <Text className={classes.zapScore} variant="h3">
                {parseInt(token?.statistics?.favourites ?? "0") + zapChange}
                {" "}
                <ZapIconButton onZap={setZapChange} className={classes.zapLogo} token={token} />
              </Text>
            </InfoBox>
          </Box>
          <Box className={classes.saleInfoContainer}>
            {(token?.bestAsk || token?.bestBid) && (
              <React.Fragment>
                {/* this section is WIP */}
                <Typography variant="h6" className={cls(classes.saleHeader, classes.halfOpacity)}>
                  Price{isXs && (
                    <Typography component="span" variant="body1" className={classes.halfOpacity}>
                      &nbsp;${tokenPrice?.dp(11).toString() ?? "-"}
                    </Typography>
                  )}
                </Typography>

                <Typography variant="h1" className={classes.price}>
                  <Box mr={1} display="flex">
                    {tokenAmount?.toString().replace(PRICE_REGEX, ",") ?? "-"}

                    {(tokenAmount && purchaseCurrency) ? <CurrencyLogo address={purchaseCurrency.address} currency={purchaseCurrency.symbol} /> : ""}
                  </Box>

                  {(!isXs && tokenAmount) && (
                    <Typography component="span" variant="body1" className={cls(classes.halfOpacity, classes.usdPrice)}>
                      ${tokenPrice?.dp(11).toString() ?? "-"}
                    </Typography>
                  )}
                </Typography>
                <Box className={classes.bestLastBox}>
                  {!!bestBid && (
                    <Box mr={2}>
                      <Typography variant="body1" className={classes.saleHeader}>
                        <Typography className={classes.bestLastLabel}>
                          BEST
                        </Typography>
                        {bestBid.amount.toString(10)}
                        &nbsp;
                        {bestBid.token.symbol}
                        &nbsp;
                        <Typography className={classes.halfOpacity}>
                          {bestBid.timeLeft}
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                  {!!lastTrade && (
                    <Box>
                      <Typography variant="body1" className={classes.saleHeader}>
                        <Typography component="span" className={classes.bestLastLabel}>LAST</Typography>
                        {lastTrade.amount.toString(10)} &nbsp;{lastTrade.token.symbol}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </React.Fragment>
            )}
          </Box>
          <Box display="flex" className={classes.buttonBox}>
            {!isOwnToken && (
              <FancyButton containerClass={classes.button} className={classes.bidButton} disableRipple onClick={onBid}>
                Place Bid
              </FancyButton>
            )}
            {isOwnToken && token?.bestAsk && (
              <FancyButton containerClass={classes.button} className={classes.bidButton} disableRipple onClick={onCancel}>
                Cancel Listing
              </FancyButton>
            )}
            {isOwnToken && token?.collection && (
              <FancyButton containerClass={classes.button} className={classes.buyButton} disableRipple onClick={onSell}>
                {token.bestAsk ? "Lower Price" : "Sell"}
              </FancyButton>
            )}
            {!isOwnToken && token?.bestAsk && (
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
    boxShadow: "0px 4px 20px #002028",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
  },
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    padding: theme.spacing(9),
    paddingLeft: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      textAlign: "center",
      width: "100%",
    },
  },
  id: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "45px",
    color: "#DEFFFF",
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(1),
    },
  },
  buttonBox: {
    transform: "translateY(-50%)",
    width: "100%",
    padding: theme.spacing(0, 4),
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(2),
      transform: "translateY(0%)",
      padding: theme.spacing(0),
    },
  },
  button: {
    flex: 1,
    margin: theme.spacing(0, .5),
    maxWidth: 280,
  },
  bidButton: {
    padding: theme.spacing(2.5, 4),
    borderRadius: theme.spacing(1.5),
    border: theme.palette.border,
    backgroundColor: "#FFDF6B",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      "& .MuiButton-label": {
        color: "#DEFFFF",
      },
    },
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      width: "100%",
    },
  },
  buyButton: {
    padding: theme.spacing(2.5, 4),
    borderRadius: theme.spacing(1.5),
    backgroundColor: "#6BE1FF",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      border: theme.palette.border,
      "& .MuiButton-label": {
        color: "#DEFFFF",
      },
    }
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#DEFFFF",
    textTransform: "uppercase",
  },
  infoBoxContainer: {
    display: "flex",
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  saleInfoContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    minHeight: theme.spacing(5),
    border: `1px solid #003340`,
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(3, 5),
    paddingBottom: theme.spacing(6),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 3),
      alignItems: "center"
    },
  },
  saleHeader: {
    color: theme.palette.primary.contrastText,
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(1),
    alignItems: "center",

  },
  price: {
    color: "#00FFB0",
    fontWeight: "bold",
    fontFamily: "Avenir Next",
    display: "flex",
    marginTop: theme.spacing(0.5),
    alignItems: "flex-end",
    fontSize: 30,
  },
  zapScore: {
    fontFamily: "'Raleway', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  zapLogo: {
    marginLeft: theme.spacing(1),
    fontSize: 21,
  },
  rarityLabel: {
    color: "#7B61FF",
    fontFamily: "Avenir Next",
    fontWeight: 900,
    textAlign: "center",
    WebkitTextStroke: "4px #7B61FF33"

  },
  halfOpacity: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText,
  },
  bestLastBox: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  bestLastLabel: {
    backgroundColor: "#6be1ff33",
    fontFamily: "Avenir Next",
    color: "#6BE1FF",
    padding: theme.spacing(1, 2),
    borderRadius: 10,
    fontWeight: "bold",
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      borderRadius: 14,
      padding: theme.spacing(.8, 1.6),
    },
  },
  usdPrice: {
    paddingBottom: theme.spacing(.5),
  }
}));

export default SalesDetail;
