import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, ButtonGroup, makeStyles, Typography } from "@material-ui/core";
import BigNumber from "bignumber.js";
import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineData, UTCTimestamp, WhitespaceData } from "lightweight-charts";
import { ArkBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { getBlockchain } from "app/saga/selectors";
import { ArkClient } from "core/utilities";
import { useAsyncTask } from "app/utils";
import { fromBech32Address } from "core/zilswap";
import { TIME_UNIX_PAIRS } from "app/utils/constants";

interface Props {
  collectionId: string;
  tokenId: string;
}

interface FloorPrice {
  floorPrice: number,
  intervalTime: string,
}

interface SalePrice {
  highestSale: number,
  intervalTime: string,
}

interface BidPrice {
  highestBid: number,
  intervalTime: string,
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
  const [startTime, setStartTime] = useState<UTCTimestamp | null>(null);
  const [endTime, setEndTime] = useState<UTCTimestamp | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);

  const generateWhitespaceData = (start: UTCTimestamp, end: UTCTimestamp, interval: string) => {
    const unixInterval = TIME_UNIX_PAIRS[interval]
    let data = new Array<WhitespaceData>();
    let currentTimestamp = start as number;
    while (currentTimestamp <= end) {
      data.push({
        time: currentTimestamp as UTCTimestamp,
      });
      currentTimestamp += unixInterval;
    }
    return data;
  }
  const updateSize = () => {
    if (graphRef.current) {
      chart?.resize(graphRef.current.clientWidth, graphRef.current.clientHeight);
    }
  }

  useEffect(() => {
    // setStartTime(null);
    // setEndTime(null);
    getCollectionFloor();
    getSalePrice();
    getBidPrice();
    // eslint-disable-next-line
  }, [currentInterval])

  useEffect(() => {
    console.log(startTime);
    console.log(endTime);
    if (!collectionFloor || !salePrice || !bidPrice) return;
    if (graphRef.current && !chart && startTime && endTime) {
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
      const whitespaceData = generateWhitespaceData(startTime, endTime, currentInterval)
      floorSeries.setData(collectionFloor);
      bidSeries.setData(bidPrice);
      saleSeries.setData(salePrice);
      whiteSeries.setData(whitespaceData);
      newChart.timeScale().fitContent();
      setChart(newChart);
      setFloorSeries(floorSeries);
      setBidSeries(bidSeries);
      setSaleSeries(saleSeries);
      setWhiteSeries(whiteSeries);
      window.addEventListener('resize', updateSize)
    }
    console.log("here")
    console.log(startTime)
    console.log(endTime)
    if (chart && floorSeries && bidSeries && saleSeries && whiteSeries && startTime && endTime) {
      console.log("oh here");
      const whitespaceData = generateWhitespaceData(startTime, endTime, currentInterval);
      floorSeries.setData(collectionFloor);
      bidSeries.setData(bidPrice);
      saleSeries.setData(salePrice);
      whiteSeries.setData(whitespaceData);
      chart.timeScale().fitContent();
    }
    // eslint-disable-next-line
  }, [collectionFloor, bidPrice, salePrice, startTime, endTime])

  const getCollectionFloor = () => {
    runGetCollectionFloor(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getCollectionFloor({ collection, interval: currentInterval });
      const floors: FloorPrice[] = result.result;
      let collectionFloors = new Array<LineData>();
      floors.forEach(floor => {
        collectionFloors.push({
          value: new BigNumber(floor.floorPrice).shiftedBy(-12).toNumber(),
          time: (Date.parse(floor.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      const firstTimestamp = collectionFloors[0].time as UTCTimestamp;
      const lastTimestamp = collectionFloors[collectionFloors.length - 1].time as UTCTimestamp;
      if (!startTime || firstTimestamp < startTime) {
        console.log("start set")
        console.log(firstTimestamp)
        setStartTime(firstTimestamp);
      }
      console.log(endTime)
      if (!endTime || lastTimestamp > endTime) {
        console.log("end set")
        console.log(lastTimestamp)
        setEndTime(lastTimestamp);
      }
      setCollectionFloor(collectionFloors)
    })
  }

  const getSalePrice = () => {
    runGetSalePrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getSalePrice({ collection, tokenId, interval: currentInterval });
      const prices: SalePrice[] = result.result;
      let salePrices = new Array<LineData>();
      prices.forEach(price => {
        salePrices.push({
          value: new BigNumber(price.highestSale).shiftedBy(-12).toNumber(),
          time: (Date.parse(price.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      const firstTimestamp = salePrices[0].time as UTCTimestamp;
      const lastTimestamp = salePrices[salePrices.length - 1].time as UTCTimestamp;
      if (!startTime || firstTimestamp < startTime) {
        console.log("start set")
        console.log(firstTimestamp)
        setStartTime(firstTimestamp);
      }
      if (!endTime || lastTimestamp > endTime) {
        console.log("end set")
        console.log(lastTimestamp)
        setEndTime(lastTimestamp);
      }
      setSalePrice(salePrices);
    })
  }

  const getBidPrice = () => {
    runGetBidPrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getBidPrice({ collection, tokenId, interval: currentInterval });
      const prices: BidPrice[] = result.result;
      let bidPrices = new Array<LineData>();
      prices.forEach(price => {
        bidPrices.push({
          value: new BigNumber(price.highestBid).shiftedBy(-12).toNumber(),
          time: (Date.parse(price.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      const firstTimestamp = bidPrices[0].time as UTCTimestamp;
      const lastTimestamp = bidPrices[bidPrices.length - 1].time as UTCTimestamp;
      if (!startTime || firstTimestamp < startTime) {
        console.log("start set")
        console.log(firstTimestamp)
        setStartTime(firstTimestamp);
      }
      if (!endTime || lastTimestamp > endTime) {
        console.log("end set")
        console.log(lastTimestamp)
        setEndTime(lastTimestamp);
      }
      setBidPrice(bidPrices);
    })
  }

  const getColor = (interval: string) => {
    if (interval === currentInterval) {
      return "default";
    }
    return "inherit"
  }

  return (
    <ArkBox variant="base" className={classes.container}>
      <Box display="flex" justifyContent="flex-end">
        <ButtonGroup variant="text">
          <Button color={getColor("hour")} onClick={() => setCurrentInterval("hour")} className={classes.noBorder}><Typography>1H</Typography></Button>
          <Button color={getColor("day")} onClick={() => setCurrentInterval("day")} className={classes.noBorder}><Typography>1D</Typography></Button>
          <Button color={getColor("week")} onClick={() => setCurrentInterval("week")} className={classes.noBorder}><Typography>1W</Typography></Button>
          {/* <Button color={getColor("1month")} onClick={() => setIntervalAndPeriod("1month", "24month")} className={classes.noBorder}><Typography>1M</Typography></Button> */}
        </ButtonGroup>
      </Box>
      <Box className={classes.graph} {...{ ref: graphRef }}></Box>
    </ArkBox>
  )
};

export default ArkPriceHistoryGraph;
