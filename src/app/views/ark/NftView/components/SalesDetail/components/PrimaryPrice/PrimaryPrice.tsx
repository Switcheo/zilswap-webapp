import React, { useMemo } from "react";
import { Box, BoxProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import dayjs, { Dayjs } from "dayjs";
import { AppTheme } from "app/theme/types";
import { bnOrZero, toSignificantNumber, useValueCalculators } from "app/utils";
import { getTokens } from "app/saga/selectors";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { CurrencyLogo } from "app/components";
import { PriceInfo, PriceType } from "../../types";

interface Props extends BoxProps {
  data: PriceInfo;
  blockTime: Dayjs;
  currentBlock: number;
}

const PrimaryPrice: React.FC<Props> = (props: Props) => {
  const { children, className, data, blockTime, currentBlock, ...rest } = props;
  const classes = useStyles();
  const { tokens, prices } = useSelector(getTokens);
  const valueCalculator = useValueCalculators();

  const timeLeft = useMemo(() => {
    if (data.type === PriceType.LastTrade) return null;
    const blocksLeft = data.cheque.expiry - currentBlock;
    const expiryTime = blockTime.add(blocksLeft / BLOCKS_PER_MINUTE, "minutes");
    return expiryTime.isAfter(dayjs()) ? expiryTime.fromNow(true) + " left" : "Expired " + expiryTime.fromNow();
  }, [currentBlock, blockTime, data.cheque.expiry, data.type])

  const priceToken = tokens[toBech32Address(data.cheque.price.address)];
  if (!priceToken) return null; // loading tokens (most likely.. lol)

  const amount = bnOrZero(data.cheque.price.amount);
  const priceAmount = amount.shiftedBy(-priceToken.decimals);
  const priceValue = valueCalculator.amount(prices, priceToken, amount);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box>
        <Typography variant="h6" className={cls(classes.saleType)}>
          {data.type.toUpperCase()}
        </Typography>
      </Box>

      <Typography variant="h1" className={classes.saleInfo}>
        <Box mr={1} display="flex">
          {toSignificantNumber(priceAmount)}
          <CurrencyLogo
            currency={priceToken.symbol}
            address={priceToken.address}
            className={classes.tokenLogo}
          />
        </Box>

        <Box className={classes.secondaryInfo}>
          {timeLeft && <Typography component="span" variant="body1" className={cls(classes.secondaryText)}>
            {timeLeft}
          </Typography>}
          <Typography component="span" variant="body1" className={cls(classes.secondaryText)}>
            ${priceValue.toFormat(2).toString()}
          </Typography>
        </Box>
      </Typography>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  saleType: {
    display: 'inline-block',
    margin: theme.spacing(1, 0, 1.5, 0),
    padding: theme.spacing(1, 2),
    borderRadius: 10,
    color: '#6BE1FF',
    background: 'rgba(107, 225, 255, 0.2)',
    fontFamily: "Avenir Next",
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  saleInfo: {
    color: theme.palette.primary!.dark,
    fontWeight: "bold",
    fontFamily: "Avenir Next",
    display: "flex",
    alignItems: "flex-end",
    fontSize: 32,
  },
  secondaryInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  secondaryText: {
    color: theme.palette.text!.secondary,
    fontSize: 12,
    lineHeight: 1,
    paddingBottom: 2,
    marginLeft: 3,
  },
  tokenLogo: {
    width: 32,
    height: 32,
    marginTop: -3,
    marginLeft: 3,
  },
}));

export default PrimaryPrice;
