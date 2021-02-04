import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import TxStatusIndicator from "app/components/TxStatusIndicator";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useNetwork, useValueCalculators } from "app/utils";
import { ZIL_TOKEN_NAME } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilTransaction } from "core/utilities";
import { toBech32Address } from "core/zilswap";
import React from "react";
import { useSelector } from "react-redux";

interface Props extends TableRowProps {
  transaction: ZilTransaction;
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
    const swapRoute: string[] = [];

    // in - into the users address (out of contract)
    // out - out of the users address (into the contract)

    let inToken!: TokenInfo;
    let outToken!: TokenInfo;

    let inAmount!: BigNumber;
    let outAmount!: BigNumber;

    let totalValue!: BigNumber;

    switch (transaction.data?._tag) {
      case "SwapExactTokensForZIL": {
        const poolAddress = transaction.data?.params.find(param => param.vname === "token_address")?.value;
        inToken = tokenState.tokens[ZIL_TOKEN_NAME];
        outToken = tokenState.tokens[toBech32Address(poolAddress ?? "")];

        swapRoute.push(inToken?.symbol, outToken?.symbol);

        if (transaction.events.length) {
          inAmount = bnOrZero(transaction.internalTransfers?.[0]?.value);
          const transferEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
          outAmount = bnOrZero(transferEvent?.params?.amount);
        } else {
          inAmount = bnOrZero(transaction.data?.params.find(param => param.vname === "min_zil_amount")?.value);
          outAmount = bnOrZero(transaction.data?.params.find(param => param.vname === "token_amount")?.value);
        }

        totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
        break;
      };
      case "SwapExactZILForTokens": {
        const poolAddress = transaction.data?.params.find(param => param.vname === "token_address")?.value;
        inToken = tokenState.tokens[toBech32Address(poolAddress ?? "")];
        outToken = tokenState.tokens[ZIL_TOKEN_NAME];

        swapRoute.push(inToken?.symbol, outToken?.symbol);

        if (!transaction.events.length) {
          outAmount = transaction.value;
          const transferEvent = transaction.events.find(event => event.name === "TransferSuccess");
          inAmount = bnOrZero(transferEvent?.params?.amount);
        } else {
          inAmount = bnOrZero(transaction.data?.params.find(param => param.vname === "min_token_amount")?.value);
          outAmount = bnOrZero(transaction.value);
        }

        totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
        break;
      };
      case "SwapExactTokensForTokens": {
        const pool0Address = transaction.data?.params.find(param => param.vname === "token1_address")?.value;
        inToken = tokenState.tokens[toBech32Address(pool0Address ?? "")];
        const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
        swapRoute.push(zilToken.symbol, inToken?.symbol);

        const pool1Address = transaction.data?.params.find(param => param.vname === "token0_address")?.value;
        outToken = tokenState.tokens[toBech32Address(pool1Address ?? "")];
        swapRoute.unshift(outToken?.symbol);

        if (transaction.events) {
          const transferOutEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
          outAmount = bnOrZero(transferOutEvent?.params?.amount);

          const transferInEvent = transaction.events.find(event => event.name === "TransferSuccess");
          inAmount = bnOrZero(transferInEvent?.params?.amount);
        } else {
          inAmount = bnOrZero(transaction.data?.params.find(param => param.vname === "min_token1_amount")?.value);
          outAmount = bnOrZero(transaction.data?.params.find(param => param.vname === "token0_amount")?.value);
        }

        totalValue = valueCalculators.amount(tokenState.prices, outToken, outAmount);
        break;
      };
    }

    return {
      isError: !transaction.events.length,
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
      <TableCell>
        <TxStatusIndicator error={isError} />
      </TableCell>
      <TableCell className={classes.titleHeader}>
        <Box display="flex">
          <Tooltip title={(transaction.data as any)?._tag}>
            <span>
              <Text>Swap {outToken?.symbol} for {inToken?.symbol}</Text>
            </span>
          </Tooltip>
          <Box className="external-link" marginLeft={1}>
            <a target="_blank" rel="noopener noreferrer" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=${network}`}>
              <NewLinkIcon />
            </a>
          </Box>
        </Box>
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
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default SwapTxRow;
