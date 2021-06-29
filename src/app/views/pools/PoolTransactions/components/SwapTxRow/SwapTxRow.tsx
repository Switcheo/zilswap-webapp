import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import TxStatusIndicator from "app/components/TxStatusIndicator";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useNetwork, useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
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

const SwapTxRow: React.FC<Props> = (props: Props) => {
  const { children, className, transaction, ...rest } = props;
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    isError,
    inToken,
    outToken,
    swapRoute,
    totalValue,
    inAmount,
    outAmount,
  } = React.useMemo(() => {
    const swapRoute: TokenInfo[] = [];

    // in - into the contract (out of users address)
    // out - out of the contract (into the users address)

    let inAmount!: BigNumber;
    let outAmount!: BigNumber;

    let totalValue!: BigNumber;

    let inToken!: TokenInfo;
    let outToken!: TokenInfo;

    if (transaction.swap0_is_sending_zil) {
      inToken = tokenState.tokens[ZIL_ADDRESS];
      outToken = tokenState.tokens[transaction.token_address];
      swapRoute.push(inToken, outToken);
      inAmount = transaction.zil_amount;
      outAmount = transaction.token_amount;
    } else {
      inToken = tokenState.tokens[transaction.token_address];
      outToken = tokenState.tokens[ZIL_ADDRESS];
      swapRoute.push(inToken, outToken);
      inAmount = transaction.token_amount;
      outAmount = transaction.zil_amount;
    }

    if (transaction.swap1_token_address) {
      inToken = tokenState.tokens[transaction.swap1_token_address];
      swapRoute.unshift(inToken);
      inAmount = transaction.swap1_token_amount ?? BIG_ZERO;
    }

    totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);

    return {
      isError: false,
      inToken,
      outToken,
      swapRoute,
      inAmount,
      outAmount,
      totalValue,
    };
  }, [transaction, tokenState, valueCalculators]);

  if (!tokenState.initialized) return null;

  return (
    <TableRow {...rest} className={cls(classes.root, className)}>
      <TableCell className={classes.placeholderCell} />
      <TableCell>
        <TxStatusIndicator error={isError} />
      </TableCell>
      <TableCell className={classes.titleHeader}>
        <Box display="flex">
          <Tooltip title={""}>
            <span>
              <Text>Swap {inToken?.symbol} for {outToken?.symbol}</Text>
            </span>
          </Tooltip>
          <Box className="external-link" marginLeft={1}>
            <a target="_blank" rel="noopener noreferrer" href={`https://viewblock.io/zilliqa/tx/${transaction.transaction_hash}?network=${network.toLowerCase()}`}>
              <NewLinkIcon />
            </a>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <PoolRouteIcon route={[...swapRoute]} marginRight={1} />
          <Text className={classes.text}>{swapRoute.map(token => token.symbol).join(" - ")}</Text>
        </Box>
      </TableCell>
      <TableCell align="right">
        ${totalValue.toFormat(2)}
      </TableCell>
      <TableCell align="right">
        {!!inToken && (
          <AmountLabel
            hideIcon
            prefix="-"
            justifyContent="flex-end"
            amount={inAmount}
            currency={inToken.symbol}
            address={inToken.address}
            compression={inToken.decimals} />
        )}
        {!!outToken && (
          <AmountLabel
            hideIcon
            justifyContent="flex-end"
            amount={outAmount}
            currency={outToken.symbol}
            address={outToken.address}
            compression={outToken.decimals} />
        )}
      </TableCell>
      <TableCell align="right">
        {transaction.block_timestamp.fromNow()}
      </TableCell>
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default SwapTxRow;
