import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, makeStyles } from "@material-ui/core";
import BigNumber from "bignumber.js";
import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineData, UTCTimestamp } from "lightweight-charts";
import { ArkBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { getBlockchain } from "app/saga/selectors";
import { ArkClient } from "core/utilities";
import { useAsyncTask } from "app/utils";
import { fromBech32Address } from "core/zilswap";

interface Props {
  collectionId: string;
  tokenId: string;
  interval: string;
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
    boxShadow: theme.palette.mainBoxShadow,
    display: "center",
  },
}));

const ArkPriceHistoryGraph: React.FC<Props> = (props: Props) => {
  const { collectionId, tokenId, interval } = props;
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
  const [series, setSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getCollectionFloor();
    getSalePrice();
    getBidPrice();
    // eslint-disable-next-line
  }, [])

  const getCollectionFloor = () => {
    runGetCollectionFloor(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getCollectionFloor({ collection, interval });
      const floors: FloorPrice[] = result.result;
      let collectionFloors = new Array<LineData>();
      floors.forEach(floor => {
        collectionFloors.push({
          value: new BigNumber(floor.floorPrice).shiftedBy(-12).toNumber(),
          time: (Date.parse(floor.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      console.log(collectionFloors);
      setCollectionFloor(collectionFloors)
    })
  }

  const getSalePrice = () => {
    runGetSalePrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getSalePrice({ collection, tokenId, interval });
      const prices: SalePrice[] = result.result;
      let salePrices = new Array<LineData>();
      prices.forEach(price => {
        salePrices.push({
          value: new BigNumber(price.highestSale).shiftedBy(-12).toNumber(),
          time: (Date.parse(price.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      console.log(salePrices);
      setSalePrice(salePrices);
    })
  }

  const getBidPrice = () => {
    runGetBidPrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getBidPrice({ collection, tokenId, interval });
      const prices: BidPrice[] = result.result;
      let bidPrices = new Array<LineData>();
      prices.forEach(price => {
        bidPrices.push({
          value: new BigNumber(price.highestBid).shiftedBy(-12).toNumber(),
          time: (Date.parse(price.intervalTime) / 1000) as UTCTimestamp,
        })
      });
      console.log(bidPrices);
      setBidPrice(bidPrices);
    })
  }

  useEffect(() => {
    if (!collectionFloor || !salePrice || !bidPrice) return;
    if (graphRef.current && !chart) {
      const newChart = createChart(graphRef.current, {
        width: 600,
        height: 400,
        layout: {
          backgroundColor: "#131722",
          textColor: "#d1d4dc"
        },
        grid: {
          vertLines: {
            color: "rgba(42, 46, 57, 0.6)",
            style: 1,
            visible: false,
          },
          horzLines: {
            color: "rgba(42, 46, 57, 0.6)",
            style: 1,
            visible: false,
          },
        },
        timeScale: {
          rightOffset: 10,
          lockVisibleTimeRangeOnResize: true,
          timeVisible: true,
          secondsVisible: false,
          borderColor: "rgba(222, 255, 255, 0.1)",
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
      });

      const floorSeries = newChart.addLineSeries({
        color: "rgba(73, 194, 121, 1)",
        lineWidth: 1
      });

      const bidSeries = newChart.addLineSeries({
        color: "rgba(73, 14, 121, 1)",
        lineWidth: 1
      });

      const saleSeries = newChart.addLineSeries({
        color: "rgba(155, 14, 121, 1)",
        lineWidth: 1
      });

      floorSeries.setData(collectionFloor);

      bidSeries.setData(bidPrice);

      saleSeries.setData(salePrice);

      setChart(newChart);
      setSeries(floorSeries);
    }
  }, [collectionFloor, bidPrice, salePrice])

  return (
    <ArkBox variant="base" className={classes.container}>
      <Box className={classes.graph} {...{ ref: graphRef }}></Box>
    </ArkBox>

  )
};

export default ArkPriceHistoryGraph;
