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
import { PriceInfo } from "../../types";

interface Props extends BoxProps {
  data: PriceInfo;
  blockTime: Dayjs;
  currentBlock: number;
}

const SecondaryPrice: React.FC<Props> = (props: Props) => {
  const { children, className, data, blockTime, currentBlock, ...rest } = props;
  const classes = useStyles();
  const { tokens } = useSelector(getTokens);

  const priceToken = tokens[toBech32Address(data.cheque.price.address)];
  const priceAmount = bnOrZero(data.cheque.price.amount).shiftedBy(-priceToken.decimals)

  const timeLeft = useMemo(() => {
    const blocksLeft = data.cheque.expiry - currentBlock;
    const expiryTime = blockTime.add(blocksLeft * BLOCKS_PER_MINUTE, "minutes");
    return expiryTime.isAfter(dayjs()) ? expiryTime.fromNow() + "left" : "Expired " + expiryTime.fromNow();
  }, [currentBlock, blockTime, data.cheque.expiry])

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Typography variant="body1" className={classes.saleHeader}>
        <Typography className={classes.bestLastLabel}>
          BEST
        </Typography>
        {toSignificantNumber(priceAmount)} {priceToken.symbol}
        <Typography className={classes.halfOpacity}>
          {timeLeft}
        </Typography>
      </Typography>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  saleHeader: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(1),
    alignItems: "center",
  },
  halfOpacity: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText,
  },
  bestLastLabel: {
    backgroundColor: "#6be1ff33",
    fontFamily: "Avenir Next",
    color: "#6BE1FF",
    padding: theme.spacing(1, 2),
    borderRadius: 10,
    fontWeight: "bold",
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      borderRadius: 14,
      padding: theme.spacing(.8, 1.6),
    },
  },
}));

export default SecondaryPrice;
