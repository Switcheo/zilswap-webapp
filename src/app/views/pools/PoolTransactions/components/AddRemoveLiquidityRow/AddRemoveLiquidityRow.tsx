/* eslint-disable no-lone-blocks */
import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import TxStatusIndicator from "app/components/TxStatusIndicator";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useNetwork, useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import clsx from "clsx";
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
    const tokenAddressParam = transaction.data?.params.find(param => param.vname === "token_address");
    const poolAddress = tokenAddressParam?.value ?? "";
    const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
    const poolToken = tokenState.tokens[toBech32Address(poolAddress)];

    let type!: "add" | "remove";

    let zilValue = BIG_ZERO;
    let tokenValue = BIG_ZERO;
    let totalValue = BIG_ZERO;
    let tokenAmount = BIG_ZERO;
    let zilAmount = BIG_ZERO;

    switch (transaction.data?._tag) {
      case "AddLiquidity": {
        type = "add";
        zilAmount = bnOrZero(transaction.value);

        if (transaction.events.length) {
          const transferEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
          tokenAmount = bnOrZero(transferEvent?.params?.amount);
        } else {
          tokenAmount = bnOrZero(transaction.data.params.find(param => param.vname === "max_token_amount")?.value);
        }
        break;
      };

      case "RemoveLiquidity": {
        type = "remove";
        if (transaction.events) {
          const transferEvent = transaction.events.find(event => event.name === "TransferSuccess");
          zilAmount = bnOrZero(transaction.internalTransfers?.[0]?.value);
          tokenAmount = bnOrZero(transferEvent?.params?.amount);
        } else {
          zilAmount = bnOrZero(transaction.data.params.find(param => param.vname === "min_zil_amount")?.value);
          tokenAmount = bnOrZero(transaction.data.params.find(param => param.vname === "min_token_amount")?.value);
        }
        break;
      };
    }


    if (poolToken) {
      zilValue = valueCalculators.amount(tokenState.prices, zilToken, zilAmount);
      tokenValue = valueCalculators.amount(tokenState.prices, poolToken, tokenAmount);
      totalValue = tokenValue.plus(zilValue);
    }

    return {
      isError: !transaction.events.length,
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
            <Tooltip title={(transaction.data as any)?._tag}>
              <Text>{type === "add" ? "Add" : "Remove"} Liquidity</Text>
            </Tooltip>
          </span>
          <Box className="external-link" marginLeft={1}>
            <a target="_blank" rel="noopener noreferrer" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=${network}`}>
              <NewLinkIcon />
            </a>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <PoolRouteIcon route={[poolToken?.symbol, zilToken.symbol]} marginRight={1} />
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
          compression={zilToken.decimals} />
        <AmountLabel
          hideIcon
          justifyContent="flex-end"
          amount={tokenAmount}
          currency={poolToken?.symbol}
          compression={poolToken?.decimals} />
      </TableCell>
      <TableCell align="right">
        {transaction.timestamp?.fromNow()}
      </TableCell>
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default AddRemoveLiquidityRow;
