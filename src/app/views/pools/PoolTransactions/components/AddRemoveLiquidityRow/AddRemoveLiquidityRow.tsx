/* eslint-disable no-lone-blocks */
import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import TxStatusIndicator from "app/components/TxStatusIndicator";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useNetwork, useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { PoolTransaction } from "core/utilities";
import React from "react";
import { useSelector } from "react-redux";

interface Props extends TableRowProps {
  transaction: PoolTransaction;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  titleHeader: {
    "& .external-link": {
      visibility: "hidden",
    },
    "&:hover .external-link": {
      visibility: "visible",
    },
  },
  placeholderCell: {
    borderBottom: "none !important",
    padding: `${theme.spacing(2)}px !important`,
  },
  text: {
    fontSize: "inherit",
  },
}));

const AddRemoveLiquidityRow: React.FC<Props> = (props: Props) => {
  const { children, className, transaction, ...rest } = props;
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    isError,
    type,
    zilToken,
    poolToken,
    zilAmount,
    tokenAmount,
    totalValue,
  } = React.useMemo(() => {
    const zilToken = tokenState.tokens[ZIL_ADDRESS];
    const poolToken = tokenState.tokens[transaction.token_address];

    let type = transaction.change_amount?.isPositive() ? "add": "remove";

    let tokenAmount = transaction.token_amount;
    let zilAmount = transaction.zil_amount;

    let zilValue: BigNumber = BIG_ZERO;
    let tokenValue: BigNumber = BIG_ZERO;
    let totalValue: BigNumber = BIG_ZERO;


    if (poolToken) {
      zilValue = valueCalculators.amount(tokenState.prices, zilToken, zilAmount);
      tokenValue = valueCalculators.amount(tokenState.prices, poolToken, tokenAmount);
      totalValue = tokenValue.plus(zilValue);
    }

    return {
      isError: false,
      type,
      zilToken,
      poolToken,
      zilAmount,
      tokenAmount,
      totalValue,
    };
  }, [transaction, tokenState, valueCalculators]);

  return (
    <TableRow {...rest} className={clsx(classes.root, className)}>
      <TableCell className={classes.placeholderCell} />
      <TableCell>
        <TxStatusIndicator error={isError} />
      </TableCell>
      <TableCell className={classes.titleHeader}>
        <Box display="flex">
          <span>
            <Tooltip title={""}>
              <Text>{type === "add" ? "Add" : "Remove"} Liquidity</Text>
            </Tooltip>
          </span>
          <Box className="external-link" marginLeft={1}>
            <a target="_blank" rel="noopener noreferrer" href={`https://viewblock.io/zilliqa/tx/${transaction.transaction_hash}?network=${network.toLowerCase()}`}>
              <NewLinkIcon />
            </a>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <PoolRouteIcon route={[poolToken, zilToken]} marginRight={1} />
          <Text className={classes.text}>{poolToken?.symbol} {zilToken.symbol}</Text>
        </Box>
      </TableCell>
      <TableCell align="right">
        ${totalValue.toFormat(2)}
      </TableCell>
      <TableCell align="right">
        <AmountLabel
          hideIcon
          justifyContent="flex-end"
          amount={zilAmount}
          currency={zilToken.symbol}
          address={zilToken.address}
          compression={zilToken.decimals} />
        <AmountLabel
          hideIcon
          justifyContent="flex-end"
          amount={tokenAmount}
          currency={poolToken?.symbol}
          address={poolToken?.address}
          compression={poolToken?.decimals} />
      </TableCell>
      <TableCell align="right">
        {transaction.block_timestamp?.fromNow()}
      </TableCell>
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default AddRemoveLiquidityRow;
