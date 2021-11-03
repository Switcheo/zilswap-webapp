import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, ButtonGroup, Container, makeStyles, Typography } from "@material-ui/core";
import BigNumber from "bignumber.js";
import moment from "moment";
import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineData, UTCTimestamp } from "lightweight-charts";
import { ArkBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { getBlockchain, getTokens } from "app/saga/selectors";
import { ArkClient } from "core/utilities";
import { useAsyncTask, useMoneyFormatter, useValueCalculators } from "app/utils";
import { fromBech32Address } from "core/zilswap";
import { TIME_UNIX_PAIRS, ZIL_ADDRESS } from "app/utils/constants";
import { ReactComponent as ZilIcon } from "./assets/zil-icon.svg";
import { ReactComponent as BidLegend } from "./assets/bid-legend.svg";
import { ReactComponent as SaleLegend } from "./assets/sale-legend.svg";
import { ReactComponent as FloorLegend } from "./assets/floor-legend.svg";

interface Props {
  collectionId: string;
  tokenId: string;
}

interface PriceData {
  value: string,
  intervalTime: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  graph: {
    overflow: "hidden",
    minWidth: 300,
    height: "70vh",
    boxShadow: theme.palette.mainBoxShadow,
    display: "center",
  },
  noBorder: {
    border: "none",
    borderRight: "none!important",
    padding: 0,
  },
  line: {
    width: "50px",
    height: "1px",
    color: "#00FFB0",
  },
  priceHistory: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "30px",
    fontWeight: 700,
    margin: theme.spacing(4, 0, 2, 0),
  },
  salePrice: {
    fontFamily: 'Avenir Next',
    fontSize: "20px",
    fontWeight: 800,
    marginTop: theme.spacing(0.5),
  },
  zilIcon: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
  },
  legend: {
    marginTop: theme.spacing(2),
  },
  legendIcon: {
    width: 30,
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  legendInfo: {
    marginRight: "10px",
    padding: 5,
  },
  legendData: {
    fontFamily: 'Avenir Next',
    fontSize: "12px",
    fontWeight: 700,
    color: "rgba(222, 255, 255, 1)",
  },
  legendText: {
    fontFamily: 'Avenir Next',
    fontSize: "12px",
    fontWeight: 700,
    color: "rgba(222, 255, 255, 0.5)",
  },
  change: {
    fontFamily: 'Avenir Next',
    fontSize: "14px",
  },
  noChange: {
    marginRight: theme.spacing(1),
  },
  priceUp: {
    color: "#00FFB0",
    marginRight: theme.spacing(1),
  },
  priceDown: {
    color: "#FF5252",
    marginRight: theme.spacing(1),
  }
}));

const ArkPriceHistoryGraph: React.FC<Props> = (props: Props) => {
  const { collectionId, tokenId } = props;
  const collection = fromBech32Address(collectionId).toLowerCase();
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [runGetCollectionFloor] = useAsyncTask("getCollectionFloor");
  const [runGetSalePrice] = useAsyncTask("getSalePrice");
  const [runGetBidPrice] = useAsyncTask("getBidPrice");
  const [collectionFloor, setCollectionFloor] = useState<LineData[] | null>(null);
  const [salePrice, setSalePrice] = useState<LineData[] | null>(null);
  const [bidPrice, setBidPrice] = useState<LineData[] | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [floorSeries, setFloorSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const [bidSeries, setBidSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const [saleSeries, setSaleSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const [whiteSeries, setWhiteSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const [currentInterval, setCurrentInterval] = useState("hour");
  const [endTime, setEndTime] = useState<UTCTimestamp>(moment().unix() as UTCTimestamp);
  const [growth, setGrowth] = useState<BigNumber | null>(null);
  const [change, setChange] = useState<BigNumber | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);
  const { tokens, prices } = useSelector(getTokens);
  const valueCalculator = useValueCalculators();

  const updateSize = () => {
    if (graphRef.current) {
      chart?.resize(graphRef.current.clientWidth, graphRef.current.clientHeight);
    }
  }

  useEffect(() => {
    setEndTime(moment().unix() as UTCTimestamp);
    getCollectionFloor();
    getSalePrice();
    getBidPrice();
    // eslint-disable-next-line
  }, [currentInterval])

  useEffect(() => {
    if (!collectionFloor && !salePrice && !bidPrice) return;
    if (graphRef.current && !chart) {
      const newChart = createChart(graphRef.current, {
        width: graphRef.current.clientWidth,
        height: graphRef.current.clientHeight,
        layout: {
          backgroundColor: 'rgba(0,0,0, 0.0)',
          textColor: "#DEFFFF",
        },
        grid: {
          vertLines: {
            color: 'rgba(220, 220, 220, 0.1)',
            style: 1,
            visible: false,
          },
          horzLines: {
            color: 'rgba(220, 220, 220, 0.1)',
            style: 1,
            visible: false,
          },
        },
        timeScale: {
          lockVisibleTimeRangeOnResize: true,
          timeVisible: true,
          secondsVisible: false,
          borderColor: "rgba(222, 255, 255, 0.1)",
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: "rgba(222, 255, 255, 0.1)",
        }
      });

      const floorSeries = newChart.addLineSeries({
        color: "#6BE1FF",
        lineWidth: 3,
        title: "Floor",
        priceLineVisible: false,
      });

      const bidSeries = newChart.addLineSeries({
        color: "#00FFB0",
        lineWidth: 3,
        title: "Highest Bid",
        priceLineVisible: false,
      });

      const saleSeries = newChart.addLineSeries({
        color: "rgba(255, 215, 71, 1)",
        lineWidth: 3,
        title: "Last Sale",
        priceLineVisible: false,
      });

      const whiteSeries = newChart.addLineSeries();
      if (collectionFloor) floorSeries.setData(collectionFloor);
      if (bidPrice) bidSeries.setData(bidPrice);
      if (salePrice) saleSeries.setData(salePrice);
      newChart.timeScale().fitContent();
      setChart(newChart);
      setFloorSeries(floorSeries);
      setBidSeries(bidSeries);
      setSaleSeries(saleSeries);
      setWhiteSeries(whiteSeries);
      window.addEventListener('resize', updateSize)
    }
    if (chart && floorSeries && bidSeries && saleSeries && whiteSeries) {
      if (collectionFloor) floorSeries.setData(collectionFloor);
      if (bidPrice) bidSeries.setData(bidPrice);
      if (salePrice) saleSeries.setData(salePrice);
      chart.timeScale().fitContent();
    }
    // eslint-disable-next-line
  }, [collectionFloor, bidPrice, salePrice])

  const getCollectionFloor = () => {
    runGetCollectionFloor(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getCollectionFloor({ collection, interval: currentInterval });
      const floors: PriceData[] = result.result;
      if (floors.length === 0) return;
      const collectionFloors: Array<LineData> = fillData(floors);
      setCollectionFloor(collectionFloors)
    })
  }

  const getSalePrice = () => {
    runGetSalePrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getSalePrice({ collection, tokenId, interval: currentInterval });
      const priceData: PriceData[] = result.result;
      if (priceData.length === 0) return
      const salePrices: Array<LineData> = fillData(priceData);
      setSalePrice(salePrices);
      if (salePrices.length <= 1) return;
      const lastSale = salePrices[salePrices.length - 1].value;
      const secondLastSale = salePrices[salePrices.length - 2].value;
      const change = lastSale - secondLastSale;
      const percentageChange = (change * 100) / secondLastSale;
      setGrowth(new BigNumber(percentageChange));
      const priceToken = tokens[ZIL_ADDRESS];
      const priceValue = valueCalculator.amount(prices, priceToken, new BigNumber(change).shiftedBy(12))
      setChange(priceValue);
    })
  }

  const getBidPrice = () => {
    runGetBidPrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getBidPrice({ collection, tokenId, interval: currentInterval });
      const priceData: PriceData[] = result.result;
      if (priceData.length === 0) return;
      const bidPrices: Array<LineData> = fillData(priceData);
      setBidPrice(bidPrices);
    })
  }

  const fillData = (data: PriceData[]) => {
    const unixInterval = TIME_UNIX_PAIRS[currentInterval];
    let result = new Array<LineData>();
    let currentTimestamp = (Date.parse(data[0].intervalTime) / 1000);
    let currentValue = new BigNumber(data[0].value).shiftedBy(-12).toNumber();
    let index = 0;
    while (currentTimestamp <= endTime) {
      if (index === data.length) {
        result.push({
          value: currentValue,
          time: currentTimestamp as UTCTimestamp,
        })
        currentTimestamp += unixInterval;
        continue;
      }
      const floorsTimestamp = (Date.parse(data[index].intervalTime) / 1000);
      if (floorsTimestamp === currentTimestamp) {
        const latestValue = new BigNumber(data[index].value).shiftedBy(-12).toNumber();
        result.push({
          value: latestValue,
          time: currentTimestamp as UTCTimestamp,
        })
        currentTimestamp += unixInterval;
        index++;
        currentValue = latestValue;
      } else {
        result.push({
          value: currentValue,
          time: currentTimestamp as UTCTimestamp,
        })
        currentTimestamp += unixInterval;
      }
    }
    return result;
  }

  const getColor = (interval: string) => {
    if (interval === currentInterval) {
      return "default";
    }
    return "inherit"
  }

  const moneyFormat = useMoneyFormatter({});

  return (
    <ArkBox variant="base" className={classes.container}>
      <Typography className={classes.priceHistory}>Price History</Typography>
      <Box display="flex" justifyContent="flex-start">
        {salePrice ? <Typography className={classes.salePrice}> {moneyFormat(salePrice[salePrice.length - 1].value, {
          maxFractionDigits: 5,
        })}</Typography>
          : <Typography className={classes.salePrice}>-</Typography>}
        <ZilIcon className={classes.zilIcon} />
      </Box>

      <Box display="flex" justifyContent="space-between">
        {growth ? <Typography className={classes.change}>
          <span className={growth.isZero() ? classes.noChange : (growth.isPositive() ? classes.priceUp : classes.priceDown)}>
            {`${change?.isNegative ? "-" : ""}`}${change?.abs().toFormat(2).toString()}
            {` (${growth.isGreaterThan(0) ? "+" : ""}${growth.toFixed(2)}%)`}
          </span>
          Past 1 {currentInterval}
        </Typography>
          : <Typography />}
        <ButtonGroup variant="text">
          <Button color={getColor("hour")} onClick={() => setCurrentInterval("hour")} className={classes.noBorder}><Typography>1H</Typography></Button>
          <Button color={getColor("day")} onClick={() => setCurrentInterval("day")} className={classes.noBorder}><Typography>1D</Typography></Button>
          <Button color={getColor("week")} onClick={() => setCurrentInterval("week")} className={classes.noBorder}><Typography>1W</Typography></Button>
        </ButtonGroup>
      </Box>

      <Box display="flex" justifyContent="flex-start" className={classes.legend}>
        <Box display="flex">
          <Container flex-direction="row" className={classes.legendIcon}>
            <BidLegend />
          </Container>
          <Container flex-direction="row" className={classes.legendInfo}>
            <Typography flex-direction="column" className={classes.legendText}>
              Highest Bid
            </Typography>
            <Typography flex-direction="column" className={classes.legendData}>
              {bidPrice ? moneyFormat(bidPrice[bidPrice.length - 1].value, { maxFractionDigits: 4 })
                : "-"}
              <span className={classes.legendText}> ZIL</span>
            </Typography>
          </Container>
        </Box>
        <Box display="flex">
          <Container flex-direction="row" className={classes.legendIcon}>
            <SaleLegend />
          </Container>
          <Container flex-direction="row" className={classes.legendInfo}>
            <Typography flex-direction="column" className={classes.legendText}>
              Last Traded
            </Typography>
            <Typography flex-direction="column" className={classes.legendData}>
              {salePrice ? moneyFormat(salePrice[salePrice.length - 1].value, { maxFractionDigits: 4 })
                : "-"}
              <span className={classes.legendText}> ZIL</span>
            </Typography>
          </Container>
        </Box>
        <Box display="flex">
          <Container flex-direction="row" className={classes.legendIcon}>
            <FloorLegend />
          </Container>
          <Container flex-direction="row" className={classes.legendInfo}>
            <Typography flex-direction="column" className={classes.legendText}>
              Floor Price
            </Typography>
            <Typography flex-direction="column" className={classes.legendData}>
              {collectionFloor ? moneyFormat(collectionFloor[collectionFloor.length - 1].value, { maxFractionDigits: 4 })
                : "-"}
              <span className={classes.legendText}> ZIL</span>
            </Typography>
          </Container>
        </Box>
      </Box>
      <Box className={classes.graph} {...{ ref: graphRef }}></Box>
    </ArkBox >
  )
};

export default ArkPriceHistoryGraph;
