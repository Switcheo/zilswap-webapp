import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { ZIL_TOKEN_NAME } from "app/utils/contants";
import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilTransaction } from "core/utilities";
import React from "react";
import { useSelector } from "react-redux";

interface Props extends TableRowProps {
  transaction: ZilTransaction;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    swapEvent,
    inToken,
    outToken,
    swapRoute,
    totalValue,
    inAmount,
    outAmount,
  } = React.useMemo(() => {
    const swapEvent = transaction.events.find(event => event.name === "Swapped");
    const swapParams = swapEvent?.params as any;
    const poolAddress = swapParams?.pool;
    const swapRoute: string[] = [];

    // in - into the users address (out of contract)
    // out - out of the users address (into the contract)

    let inToken!: TokenInfo;
    let outToken!: TokenInfo;

    let inAmount!: BigNumber;
    let outAmount!: BigNumber;

    let totalValue!: BigNumber;

    if (poolAddress) {
      switch (transaction.data?._tag) {
        case "SwapExactTokensForZIL": {
          inToken = tokenState.tokens[ZIL_TOKEN_NAME];
          outToken = tokenState.tokens[poolAddress];

          swapRoute.push(inToken.symbol, outToken.symbol);

          inAmount = bnOrZero(transaction.internalTransfers?.[0]?.value);
          const transferEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
          outAmount = bnOrZero(transferEvent?.params?.amount);

          totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
          break;
        };
        case "SwapExactZILForTokens": {
          inToken = tokenState.tokens[poolAddress];
          outToken = tokenState.tokens[ZIL_TOKEN_NAME];

          swapRoute.push(inToken.symbol, outToken.symbol);

          outAmount = transaction.value;
          const transferEvent = transaction.events.find(event => event.name === "TransferSuccess");
          inAmount = bnOrZero(transferEvent?.params?.amount);

          totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
          break;
        };
        case "SwapExactTokensForTokens": {
          inToken = tokenState.tokens[poolAddress];
          const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
          swapRoute.push(zilToken.symbol, inToken.symbol);
          
          // assumes swap route is max 2 steps
          const swapEvent2 = transaction.events.find((event, index) => index > 0 && event.name === "Swapped");
          if (swapEvent2) {
            outToken = tokenState.tokens[swapEvent2.params?.pool];
            swapRoute.unshift(outToken?.symbol);
          }

          const transferOutEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
          outAmount = bnOrZero(transferOutEvent?.params?.amount);

          const transferInEvent = transaction.events.find(event => event.name === "TransferSuccess");
          inAmount = bnOrZero(transferInEvent?.params?.amount);

          totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
          break;
        };
      }
    }

    return {
      swapEvent,
      inToken,
      outToken,
      swapRoute,
      inAmount,
      outAmount,
      totalValue,
    };
  }, [transaction, tokenState, valueCalculators]);

  return (
    <TableRow {...rest} className={cls(classes.root, className)}>
      <TableCell className={classes.placeholderCell} />
      {!!swapEvent && (
        <React.Fragment>
          <TableCell>
            <Tooltip title={(transaction.data as any)?._tag}>
              <Text>Swap {outToken?.symbol} for {inToken?.symbol}</Text>
            </Tooltip>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <PoolRouteIcon route={[...swapRoute]} marginRight={1} />
              <Text className={classes.text}>{swapRoute.join(" - ")}</Text>
            </Box>
          </TableCell>
          <TableCell align="right">
            ${totalValue.toFormat(2)}
          </TableCell>
          <TableCell align="right">
            {!!outToken && (
              <AmountLabel
                hideIcon
                prefix="-"
                justifyContent="flex-end"
                amount={outAmount}
                currency={outToken.symbol}
                compression={outToken.decimals} />
            )}
            {!!inToken && (
              <AmountLabel
                hideIcon
                justifyContent="flex-end"
                amount={inAmount}
                currency={inToken.symbol}
                compression={inToken.decimals} />
            )}
          </TableCell>
          <TableCell align="right">
            {transaction.timestamp?.fromNow()}
          </TableCell>
        </React.Fragment>
      )}
      {!swapEvent && (
        <TableCell colSpan={5}>
          <Text color="textSecondary" variant="body2" align="center">
            Transaction Failed
          </Text>
        </TableCell>
      )}
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default SwapTxRow;
