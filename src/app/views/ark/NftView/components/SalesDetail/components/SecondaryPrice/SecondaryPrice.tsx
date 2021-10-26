import React, { useMemo } from "react";
import { Box, BoxProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import dayjs, { Dayjs } from "dayjs";
import { AppTheme } from "app/theme/types";
import { getTokens } from "app/saga/selectors";
import { bnOrZero, toSignificantNumber } from "app/utils";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { PriceInfo, PriceType } from "../../types";

interface Props extends BoxProps {
  data: PriceInfo;
  blockTime: Dayjs;
  currentBlock: number;
}

const SecondaryPrice: React.FC<Props> = (props: Props) => {
  const { children, className, data, blockTime, currentBlock, ...rest } = props;
  const classes = useStyles();
  const { tokens } = useSelector(getTokens);

  const timeLeft = useMemo(() => {
    if (data.type === PriceType.LastTrade) return null;
    const blocksLeft = data.cheque.expiry - currentBlock;
    const expiryTime = blockTime.add(blocksLeft / BLOCKS_PER_MINUTE, "minutes");
    return expiryTime.isAfter(dayjs()) ? expiryTime.fromNow(true) + " left" : null;
  }, [currentBlock, blockTime, data.cheque.expiry, data.type])

  const priceToken = tokens[toBech32Address(data.cheque.price.address)];
  if (!priceToken) return null; // loading tokens (most likely.. lol)
  const priceAmount = bnOrZero(data.cheque.price.amount).shiftedBy(-priceToken.decimals)

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Typography variant="body1" className={classes.container}>
        <Typography className={classes.saleType}>
          {data.type.toUpperCase()}
        </Typography>
        {toSignificantNumber(priceAmount)} {priceToken.symbol}
        {timeLeft && <Typography className={classes.secondaryText}>
          {timeLeft}
        </Typography>}
      </Typography>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    '&:not(:last-child)': {
      marginRight: theme.spacing(4),
    }
  },
  container: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(3),
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  saleType: {
    padding: theme.spacing(0.5, 1),
    marginRight: theme.spacing(0.8),
    borderRadius: 6,
    color: '#6BE1FF',
    background: 'rgba(107, 225, 255, 0.2)',
    fontFamily: "Avenir Next",
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  secondaryText: {
    color: theme.palette.text!.secondary,
    marginLeft: 5,
  },
}));

export default SecondaryPrice;
