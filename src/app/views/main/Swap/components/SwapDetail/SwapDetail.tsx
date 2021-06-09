import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay } from "app/components";
import { RootState, SwapFormState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/constants";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React from "react";
import { useSelector } from "react-redux";

export interface SwapDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  textWrapper: {
    color: theme.palette.label
  }
}));
const SwapDetail: React.FC<SwapDetailProps> = (props: SwapDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const { inAmount, inToken, outAmount, outToken, expectedExchangeRate, expectedSlippage } = useSelector<RootState, SwapFormState>(store => store.swap);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, showCurrency: true });

  const getExchangeRateValue = () => {
    if (!outToken) return <span className={classes.textWrapper}>-</span>;
    let exchangeRate = expectedExchangeRate || BIG_ZERO;

    if (exchangeRate.eq(0)) {
      try {
        const rateResult = ZilswapConnector.getExchangeRate({
          amount: BIG_ONE.shiftedBy(inToken!.decimals),
          exactOf: "in",
          tokenInID: inToken!.address,
          tokenOutID: outToken!.address,
        });
        if (!rateResult.expectedAmount.isNaN() && !rateResult.expectedAmount.isNegative())
          exchangeRate = rateResult.expectedAmount.shiftedBy(-outToken!.decimals).pow(1);
      } catch (e) {
        exchangeRate = BIG_ZERO;
      }
    }
    return (
      <span className={classes.textWrapper}>1 {inToken?.symbol} = <span className={classes.textColoured}>{moneyFormat(exchangeRate.pow(1))}</span> {outToken?.symbol}</span>
    )
  };
  
  const getMinimumValue = () => {
    if (outAmount.isEqualTo(0)) return <span className={classes.textWrapper}>-</span>;

    return (
      <span className={classes.textWrapper}><span className={classes.textColoured}>{moneyFormat(outAmount, { maxFractionDigits: outToken?.decimals })}</span> {outToken?.symbol}</span>
    )
  };

  const getPriceImpact = () => {
    if (!expectedSlippage) return <span className={classes.textWrapper}>-</span>;

    return (
      <span className={classes.textWrapper}><span className={classes.textColoured}>{moneyFormat((expectedSlippage || 0) * 100)}%</span></span>
    )
  }

  const getFeeValue = () => {
    if (inAmount.isEqualTo(0)) return <span className={classes.textWrapper}>-</span>;

    return (
      <span className={classes.textWrapper}><span className={classes.textColoured}>≈ {moneyFormat(inAmount.multipliedBy(0.003))} {inToken?.symbol}</span></span>
    )
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Price"} mb="8px">{getExchangeRateValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Min. Received"} mb="8px">{getMinimumValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Price Impact"} mb="8px">{getPriceImpact()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Estimated Fee"} mb="8px">{getFeeValue()} <HelpInfo placement="top" title="Liquidity providers will receive 0.3% of this trade." /></KeyValueDisplay>
    </Box>
  );
};

export default SwapDetail;
