import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay, PotentialRewardInfo } from "app/components";
import { LayoutState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizRounded';

export interface PoolDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  textBold: {
    fontWeight: "bold"
  },
  textWrapper: {
    color: theme.palette.label
  },
  helpInfo: {
    marginBottom: theme.spacing(0.4)
  },
  switchIcon: {
    height: 14,
    width: 14,
    backgroundColor: theme.palette.type === "dark" ? "#2B4648" : "#E4F1F2",
    marginLeft: 8,
    borderRadius: "50%",
    cursor: "pointer",
    transform: "rotate(0)",
    transition: "transform .5s ease-in-out",
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.4),
    "& path": {
      fill: theme.palette.label,
    },
    "&:hover": {
      "& path": {
        fill: theme.palette.primary.dark,
      }
    }
  },
  activeSwitchIcon: {
    transform: "rotate(180deg)",
  },
}));
const PoolDetail: React.FC<PoolDetailProps> = (props: PoolDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const layoutState = useSelector<RootState, LayoutState>(store => store.layout);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, showCurrency: true });
  const [reversedRate, setReversedRate] = useState(false);

  const liquidityTokenRate = poolToken?.pool?.totalContribution.isPositive() ? poolToken!.pool!.tokenReserve.div(poolToken!.pool!.totalContribution) : BIG_ZERO;

  const zilFormatOpts: MoneyFormatterOptions = {
    // symbol: "ZIL",
    compression: 12,
  };
  const formatOpts: MoneyFormatterOptions = {
    // symbol: token?.symbol,
    compression: token?.decimals,
  };

  const getPoolSizeValue = () => {
    if (!token?.pool) return <span className={classes.textWrapper}>-</span>;
    const { zilReserve, tokenReserve } = token.pool;
    return (
      <span className={classes.textWrapper}><span className={classes.textColoured}>{moneyFormat(zilReserve, zilFormatOpts)}</span> ZIL + <span className={classes.textColoured}>{moneyFormat(tokenReserve, formatOpts)}</span> {token!.symbol}</span>
    )
  };
  const getShareValue = () => {
    if (!token?.pool) return <span className={classes.textWrapper}>-</span>;
    const { contributionPercentage, zilReserve, tokenReserve } = token.pool;

    const share = contributionPercentage.shiftedBy(-2);
    const tokenContribution = share.times(tokenReserve);
    const zilContribution = share.times(zilReserve);
    return (
      <span className={classes.textWrapper}> (<span className={classes.textColoured}>{moneyFormat(zilContribution, zilFormatOpts)}</span> ZIL + <span className={classes.textColoured}>{moneyFormat(tokenContribution, formatOpts)}</span> {token!.symbol})</span>
    )
  };
  const getUserPoolShare = () => {
    if (!token?.pool) return "";
    const { contributionPercentage } = token.pool;
    return `${contributionPercentage.toFixed(1)}%`;
  };
  const getPoolTokenValue = () => {
    if (!token?.pool) return <span className={classes.textWrapper}>-</span>;
    return (
      <span className={classes.textWrapper}>
        <span className={classes.textColoured}>{moneyFormat(new BigNumber(liquidityTokenRate).times(poolToken?.pool?.exchangeRate || 0), { ...zilFormatOpts, compression: 0 })}</span>
        {" "}ZIL + {" "}
        <span className={classes.textColoured}>{moneyFormat(new BigNumber(liquidityTokenRate).shiftedBy(poolToken?.decimals || 0), formatOpts)}</span>
        {" "}{token!.symbol}
      </span>
    )
  };
  const getExchangeRateValue= () => {
    if (!token?.pool) return <span className={classes.textWrapper}>-</span>;
    const zilToken = tokenState.tokens[ZIL_ADDRESS];
    const rate = token.pool.exchangeRate.shiftedBy(token!.decimals - zilToken.decimals);

    const shouldReverseRate = reversedRate;

    return (
      shouldReverseRate
        ? <span className={classes.textWrapper}>1 {token!.symbol} = <span className={classes.textColoured}>{rate.pow(1).toNumber().toLocaleString("en-US", { maximumFractionDigits: 12 })}</span> ZIL</span>
        : <span className={classes.textWrapper}>1 ZIL = <span className={classes.textColoured}>{rate.pow(-1).toNumber().toLocaleString("en-US", { maximumFractionDigits: 12 })}</span> {token!.symbol}</span>
    )
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Price"} mb="8px">
        {getExchangeRateValue()}
        { " " }
        <SwapHorizontalCircleIcon onClick={() => setReversedRate(!reversedRate)}
          className={cls(classes.switchIcon, {
            [classes.activeSwitchIcon]: reversedRate,
          })} />
      </KeyValueDisplay>
      {layoutState.showPoolType === "remove" && (
        <KeyValueDisplay kkey={"Pool Token Value"} mb="8px">{getPoolTokenValue()} <HelpInfo className={classes.helpInfo} placement="top" title="Quantity of tokens you are withdrawing at." /></KeyValueDisplay>
      )}
      <KeyValueDisplay kkey={"Current Pool Size"} mb="8px">{getPoolSizeValue()} <HelpInfo className={classes.helpInfo} placement="top" title="Total quantity of tokens in the current pool." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Current Pool Share"} mb="8px">
        <span className={cls(classes.textColoured, classes.textBold)}>{getUserPoolShare()}</span>
        {getShareValue()} <HelpInfo className={classes.helpInfo} placement="top" title="Your %  share in relation to the current pool size." />
      </KeyValueDisplay>
      {layoutState.showPoolType === "add" && (
        <PotentialRewardInfo />
      )}
    </Box>
  );
};

export default PoolDetail;
