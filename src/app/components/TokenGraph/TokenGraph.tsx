import { Box, BoxProps, Paper, Typography, ButtonGroup, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useEffect, useState, useRef } from "react";
import { CrosshairMode, createChart, Time, UTCTimestamp, IChartApi, ISeriesApi } from "lightweight-charts";
import { TokenInfo, RootState, TokenState } from "app/store/types";
import { getZilStreamTokenRates, ZilStreamRates, TimeFilter } from "core/zilswap";
import { useAsyncTask } from "app/utils";
import { ReactComponent as SwapSVG } from "./components/swap.svg";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { Skeleton } from "@material-ui/lab";

interface Props extends BoxProps {
  inToken?: TokenInfo,
  outToken?: TokenInfo,
  boxHeight: number,
}

interface CandleDataPoint {
  time: Time
  low: number
  high: number
  open: number
  close: number
}

const CARD_BORDER_RADIUS = 4;
const DEFAULT_INTERVAL = "1h";
const DEFAULT_PERIOD = "2w";


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    overflow: "hidden",
    height: "auto",
    margin: "0 20px",
    maxWidth: 746,
    flex: 1,
    [theme.breakpoints.down("md")]: {
      margin: "0 auto",
      marginTop: theme.spacing(2),
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
  graph: {
    overflow: "hidden",
    minWidth: 300,
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: CARD_BORDER_RADIUS,
    zIndex: 10,
    height: "calc(100% - 80px)",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100% - 105px)",
    }
  },
  stats: {
    height: 80,
    [theme.breakpoints.down("sm")]: {
      height: 105,
    }
  },
  label: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 8,
  },
  textPadding: {
    marginLeft: 4,
  },
  noBorder: {
    border: "none",
    borderRight: "none!important",
    padding: 0,
  },
  priceUp: {
    color: theme.palette.colors.zilliqa.primary[100],
    marginRight: theme.spacing(1),
  },
  priceDown: {
    color: "#EF534F",
    marginRight: theme.spacing(1),
  },
  noChange: {
    marginRight: theme.spacing(1),
  },
  swapSvg: {
    paddingTop: "2px",
  },
  buttonGroup: {
    display: "flex",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  }
}));

const TokenGraph: React.FC<Props> = (props: Props) => {
  const { boxHeight, inToken, outToken, children, className, ...rest } = props;
  const classes = useStyles();
  const [runGetTokenRates] = useAsyncTask("tokenRates");
  const [runGetTokenStats] = useAsyncTask("tokenStats");
  // zilstream records for graph
  const [inTokenRates, setInTokenRates] = useState<null | ZilStreamRates[]>(null);
  const [outTokenRates, setOutTokenRates] = useState<null | ZilStreamRates[]>(null);
  // local rates from token price
  const [inTokenRate, setInTokenRate] = useState<BigNumber>();
  const [currentRate, setCurrentRate] = useState<CandleDataPoint | null>(null)
  const [currentInterval, setCurrentInterval] = useState(DEFAULT_INTERVAL);
  const [currentPeriod, setCurrentPeriod] = useState(DEFAULT_PERIOD);
  const [growth, setGrowth] = useState<BigNumber>(new BigNumber(0));
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const graphRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let inRates: ZilStreamRates[], outRates: ZilStreamRates[];
    const filter: TimeFilter = { period: currentPeriod, interval: currentInterval };

    runGetTokenRates(async () => {
      if ((inToken && !inToken.isZil) || (inToken?.isZil && !outToken)) {
        inRates = await getZilStreamTokenRates(inToken.symbol, filter);
      }
      if ((outToken && !outToken.isZil) || (outToken?.isZil && !inToken)) {
        outRates = await getZilStreamTokenRates(outToken.symbol, filter);
      }
      setInTokenRate(outToken ? tokenState.prices[outToken.symbol] : tokenState.prices["ZIL"]);
      setInTokenRates(inRates);
      setOutTokenRates(outRates);
    })

    const statsFilter = { period: "2h", interval: "1m" };
    let outStats: ZilStreamRates[];
    let changes: number;
    runGetTokenStats(async () => {
      // get token records of past 2 hour as there may be missing records inbetween
      outStats = await getZilStreamTokenRates(outToken?.symbol || "ZIL", statsFilter);

      if (outStats?.length) {
        if (outStats.length < 60) {
          return;
        }
        changes = (outStats[0].close - outStats[59].close) / outStats[59].close;

        console.log({ changes }, outStats[0].close, outStats[59].close, outStats[0].close - outStats[59].close, outStats[0].time, outStats[59].time)
      }
      setGrowth(new BigNumber(changes * 100));
    })
    // eslint-disable-next-line
  }, [inToken, outToken, currentInterval]);

  useEffect(() => {
    if (boxHeight && containerRef.current) {
      containerRef.current.style.height = boxHeight + "px";
      updateSize()
    }
    // eslint-disable-next-line
  }, [boxHeight])

  useEffect(() => {
    if (!inTokenRates && !outTokenRates)
      return;
    let ratesData = calculateData(inTokenRates || undefined, outTokenRates || undefined);
    if (graphRef.current && !chart) {
      const newChart = createChart(graphRef.current, {
        width: graphRef.current.clientWidth,
        height: graphRef.current.clientHeight,
        layout: {
          backgroundColor: 'rgba(0,0,0, 0.0)',
          textColor: themeType === "dark" ? "#F7FAFA" : "#313131",
        },
        grid: {
          vertLines: {
            color: 'rgba(220, 220, 220, 0.1)',
            style: 1,
            visible: true,
          },
          horzLines: {
            color: 'rgba(220, 220, 220, 0.1)',
            style: 1,
            visible: true,
          },
        },
        timeScale: {
          rightOffset: 10,
          lockVisibleTimeRangeOnResize: true,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
      })

      const newSeries = newChart.addCandlestickSeries({
        priceFormat: {
          precision: (ratesData && ratesData?.[0].low < 0.01) ? 5 : 2,
          minMove: (ratesData && ratesData?.[0].low < 0.01) ? 0.00001 : 0.01
        }
      })

      newSeries.setData(ratesData);
      setChart(newChart);
      setSeries(newSeries);

      window.addEventListener('resize', updateSize)
    }
    if (chart && series) {
      series.applyOptions({
        priceFormat: {
          precision: (ratesData && ratesData?.[0].low < 0.01) ? 5 : 2,
          minMove: (ratesData && ratesData?.[0].low < 0.01) ? 0.00001 : 0.01
        }
      })
      series.setData(ratesData);
      setVisibleRange();
    }
    // eslint-disable-next-line
  }, [inTokenRates, outTokenRates])

  useEffect(() => {
    if (!chart) {
      return;
    }
    const chartOptions = chart.options()
    chartOptions.layout.textColor = themeType === "dark" ? "#F7FAFA" : "#313131";
    chartOptions.grid.vertLines.color = themeType === 'dark' ? 'rgba(220, 220, 220, 0.1)' : 'rgba(220, 220, 220, 0.8)';
    chartOptions.grid.horzLines.color = themeType === 'dark' ? 'rgba(220, 220, 220, 0.1)' : 'rgba(220, 220, 220, 0.8)';
    chart.applyOptions(chartOptions);
    // eslint-disable-next-line
  }, [themeType])

  const updateSize = () => {
    if (graphRef.current) {
      chart?.resize(graphRef.current.clientWidth, graphRef.current.clientHeight);
      setVisibleRange();
    }
  }

  const setVisibleRange = () => {
    var numberOfDays = 1

    switch (currentInterval) {
      case "15m": return numberOfDays = 2;
      case "1h": return numberOfDays = 14;
      case "1d": return numberOfDays = 56;
      case "1w": return numberOfDays = 365;
    }

    chart?.timeScale().setVisibleRange({
      from: ((new Date()).getTime() / 1000) - (numberOfDays * 24 * 60 * 60) as UTCTimestamp,
      to: (new Date()).getTime() / 1000 as UTCTimestamp,
    })
  }

  const calculateData = (inRates?: ZilStreamRates[], outRates?: ZilStreamRates[]): CandleDataPoint[] => {
    let returnResult = new Array<CandleDataPoint>();
    if (!inRates) {
      if (outToken?.isZil) {
        outRates?.forEach(rate => {
          returnResult.push({
            time: (Date.parse(rate.time) / 1000) as UTCTimestamp,
            low: 1 / rate.low,
            high: 1 / rate.high,
            open: 1 / rate.open,
            close: 1 / rate.close,
          })
        })
      } else {
        outRates?.forEach(rate => {
          returnResult.push({
            time: (Date.parse(rate.time) / 1000) as UTCTimestamp,
            low: rate.low,
            high: rate.high,
            open: rate.open,
            close: rate.close,
          })
        })
      }
    } else if (!outRates) {
      inRates?.forEach(rate => {
        returnResult.push({
          time: (Date.parse(rate.time) / 1000) as UTCTimestamp,
          low: 1 / rate.low,
          high: 1 / rate.high,
          open: 1 / rate.open,
          close: 1 / rate.close,
        })
      })
    } else {
      outRates.forEach((rate) => {
        inRates.forEach((inRate) => {
          if (Date.parse(rate.time) !== Date.parse(inRate.time)) {
            return;
          }
          else {
            returnResult.push({
              time: (Date.parse(rate.time) / 1000) as UTCTimestamp,
              low: rate.low / inRate.low,
              high: rate.high / inRate.high,
              open: rate.open / inRate.open,
              close: rate.close / inRate.close,
            })
          }
        })
      })
      returnResult.filter(rat => !!rat);
    }
    returnResult.sort((a, b) => (a.time > b.time) ? 1 : -1);
    setCurrentRate(returnResult[returnResult.length - 1]);
    return returnResult;
  }

  const setIntervalAndPeriod = (interval?: string, period?: string) => {
    if (interval) {
      setCurrentInterval(interval);
    }
    if (period) {
      setCurrentPeriod(period);
    }
  }

  const getColor = (interval: string) => {
    if (interval === currentInterval) {
      return "default";
    }
    return "inherit"
  }

  const getRates = () => {
    if (inTokenRate) {
      return "$" + inTokenRate.toFixed(2);
    }
    return "-";
    
  }

  return (
    <Box {...{ ref: containerRef }} {...rest} className={cls(classes.root, className)}>
      <Box className={classes.stats}>
        <Box className={classes.label}>
          <SwapSVG className={classes.swapSvg} /><Typography className={classes.textPadding} variant="h3">{" "}{outToken?.symbol || "ZIL"} / {inToken?.symbol || "ZIL"}</Typography>
        </Box>
        {(inTokenRates || outTokenRates) && (
          <>
            <Typography variant="h1">{new BigNumber(currentRate?.close || 0).toFixed(6) || "0.00"}</Typography>
            <Box className={classes.buttonGroup}>
              <Typography className={growth.isZero() ? classes.noChange : (growth.isPositive() ? classes.priceUp : classes.priceDown)}>
                {getRates()}{` (${growth.isGreaterThan(0) ? "+" : ""}${growth.toFixed(growth.isZero() ? 2 : 8)}%)`}
              </Typography>
              <Typography>Past 1 Hour</Typography>
              <Box flexGrow="1" />
              <Box display="flex" justifyContent="flex-end">
                <ButtonGroup variant="text">
                  {/* <Button color={getColor("1month")} onClick={() => setIntervalAndPeriod("1month", "24month")} className={classes.noBorder}><Typography>1M</Typography></Button> */}
                  <Button color={getColor("1w")} onClick={() => setIntervalAndPeriod("1w", "1y")} className={classes.noBorder}><Typography>1W</Typography></Button>
                  <Button color={getColor("1d")} onClick={() => setIntervalAndPeriod("1d", "8w")} className={classes.noBorder}><Typography>1D</Typography></Button>
                  <Button color={getColor("1h")} onClick={() => setIntervalAndPeriod("1h", "2w")} className={classes.noBorder}><Typography>1H</Typography></Button>
                  <Button color={getColor("15m")} onClick={() => setIntervalAndPeriod("15m", "1w")} className={classes.noBorder}><Typography>15M</Typography></Button>
                </ButtonGroup>
              </Box>
            </Box>
          </>
        )}
        {(!inTokenRates && !outTokenRates) && (
          <>
            <Skeleton variant="text" />
            <Skeleton className={classes.buttonGroup} variant="rect" />
          </>
        )}
      </Box>
      <Box component={Paper} className={classes.graph} {...{ ref: graphRef }}></Box>
    </Box>
  );
};

export default TokenGraph;
