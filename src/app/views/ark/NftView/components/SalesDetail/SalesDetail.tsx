import React, { useMemo, useEffect, useState } from "react";
import { Box, BoxProps, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import cls from "classnames";
import BigNumber from "bignumber.js";
import { CurrencyLogo, FancyButton } from "app/components";
import { getWallet, getTokens } from "app/saga/selectors";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { Nft, TokenInfo } from "app/store/types";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ReactComponent as ZapSVG } from "../assets/zap.svg";
import { ReactComponent as EllipseSVG } from "../assets/ellipse.svg";

interface Props extends BoxProps {
  token?: Nft;
  tokenId: string;
}

const SalesDetail: React.FC<Props> = (props: Props) => {
  const { token, tokenId, children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const { wallet } = useSelector(getWallet);
  const { tokens, prices } = useSelector(getTokens);
  const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null);
  const [tokenAmount, setTokenAmount] = useState<BigNumber | null>(null);
  const [purchaseCurrency, setPurchaseCurrency] = useState<TokenInfo>();

  const isOwnToken = useMemo(() => {
    return token?.owner?.address && wallet?.addressInfo.byte20?.toLowerCase() === token?.owner?.address;
  }, [token, wallet?.addressInfo]);

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


  const onSell = () => {
    dispatch(actions.Layout.toggleShowSellNftDialog("open"))
  };

  const onBuy = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("open"))
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {/* Collection name */}
      <Typography className={classes.collectionName}>
        {token?.collection?.name || ""}{" "}
        {/* <VerifiedBadge className={classes.verifiedBadge} /> */}
      </Typography>

      {/* Token id */}
      <Typography className={classes.id}>#{tokenId}</Typography>

      <Box display="flex" flexDirection="column" gridGap={20}>
        <Box className={classes.scoreBox} display="flex" justifyContent="flex-end">
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
          <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoBox}>
            <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Price&nbsp;&nbsp;<Typography variant="body1">${tokenPrice ? tokenPrice.toFixed(11).toString() : "-"}</Typography></Typography>
            <Typography variant="h2" className={classes.price}>{tokenAmount ? tokenAmount.toString() : "-"}{(tokenAmount && purchaseCurrency) ? <CurrencyLogo address={purchaseCurrency.address} currency={purchaseCurrency.symbol} /> : ""}</Typography>
            <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Last:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 day</Typography></Typography>
            <Typography variant="body1" className={classes.saleHeader}><Typography className={classes.halfOpacity}>Best:</Typography>&nbsp;150,320&nbsp;<Typography className={classes.halfOpacity}>ZIL Expires in 1 hr</Typography></Typography>
          </Box>
          {!isXs && (
            <Box display="flex" className={classes.buttonBox}>
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
          <Box flexGrow={1} display="flex" flexDirection="column" className={classes.saleInfoBox}>
            <Typography variant="body1" className={cls(classes.saleHeader, classes.halfOpacity)}>Ends on</Typography>
            <Typography variant="body1" className={classes.saleHeader}>2 Oct 2021, 3.00pm</Typography>
            <Box mt={1} display="flex"><Typography className={classes.expiryDate}><EllipseSVG /> 01 D : 04 H : 04 M : 17 S</Typography> <Box flexGrow={1} /> </Box>
          </Box>
          {!isXs && (
            <Box display="flex" className={classes.buttonBox}>
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
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
  buttonBox: {
    width: theme.spacing(16),
    overflow: "visible",
    direction: "rtl",
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      direction: "inherit",
      width: "100%",
    },
  },
  saleInfoBox: {
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
  scoreBox: {
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
  xsColumn: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  },
}));

export default SalesDetail;
