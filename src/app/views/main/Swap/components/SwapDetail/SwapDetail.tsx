import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay } from "app/components";
import { RootState, SwapFormState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/constants";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizRounded';


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
const SwapDetail: React.FC<SwapDetailProps> = (props: SwapDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const { inAmount, inToken, outAmount, outToken, expectedExchangeRate, expectedSlippage } = useSelector<RootState, SwapFormState>(store => store.swap);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, showCurrency: true });
  const [reversedRate, setReversedRate] = useState(false);
  
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

  const getExchangeRateValue = () => {
    if (!(inToken && outToken)) return <span className={classes.textWrapper}>-</span>;

    let exchangeRate = expectedExchangeRate || BIG_ZERO;

    let src = inToken, dst = outToken;

    if (reversedRate) {
      dst = inToken;
      src = outToken;
    }

    if (exchangeRate.eq(0)) {
      try {
        const rateResult = ZilswapConnector.getExchangeRate({
          amount: BIG_ONE.shiftedBy(src!.decimals),
          exactOf: reversedRate ? "out" : "in",
          tokenInID: inToken!.address,
          tokenOutID: outToken!.address,
        });
        if (!rateResult.expectedAmount.isNaN() && !rateResult.expectedAmount.isNegative())
          exchangeRate = rateResult.expectedAmount.shiftedBy(-dst!.decimals).pow(reversedRate ? -1 : 1);
      } catch (e) {
        exchangeRate = BIG_ZERO;
      }
    }
    
    const shouldReverseRate = reversedRate && !exchangeRate.isZero();

    return (
      <span className={classes.textWrapper}>1 {src?.symbol || ""} = <span className={classes.textColoured}>{moneyFormat(exchangeRate.pow(shouldReverseRate ? -1 : 1))}</span> {dst?.symbol}</span>
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
      <KeyValueDisplay kkey={"Min. Received"} mb="8px">{getMinimumValue()} <HelpInfo className={classes.helpInfo} placement="top" title={<span>Minimum amount you will receive for this swap.<br />Note: Your transaction will be reverted if there is large, unfavorable price movements prior to confirmation.</span>} /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Price Impact"} mb="8px">{getPriceImpact()} <HelpInfo className={classes.helpInfo} placement="top" title="Difference between the market price and estimated price due to amount swapped." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Estimated Fee"} mb="8px">{getFeeValue()} <HelpInfo className={classes.helpInfo} placement="top" title="Liquidity providers will receive 0.3% of this trade." /></KeyValueDisplay>
    </Box>
  );
};

export default SwapDetail;
