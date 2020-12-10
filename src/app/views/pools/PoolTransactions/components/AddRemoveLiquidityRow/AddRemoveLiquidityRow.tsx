import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/contants";
import { bnOrZero } from "app/utils/strings/strings";
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

const AddRemoveLiquidityRow: React.FC<Props> = (props: Props) => {
  const { children, className, transaction, ...rest } = props;
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    addRemoveEvent,
    type,
    zilToken,
    poolToken,
    zilAmount,
    tokenAmount,
    totalValue,
  } = React.useMemo(() => {
    const addRemoveEvent = transaction.events.find(event => ["Mint", "Burnt"].includes(event.name));
    const addRemoveParams = addRemoveEvent?.params as any;
    const poolAddress = addRemoveParams?.pool;
    const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
    const poolToken = tokenState.tokens[poolAddress];

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

        const transferEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
        tokenAmount = bnOrZero(transferEvent?.params?.amount);
        break;
      };
      case "RemoveLiquidity": {
        type = "remove";
        zilAmount = bnOrZero(transaction.internalTransfers?.[0]?.value);

        const transferEvent = transaction.events.find(event => event.name === "TransferSuccess");
        tokenAmount = bnOrZero(transferEvent?.params?.amount);
        break;
      };
    }


    if (poolToken) {
      zilValue = valueCalculators.amount(tokenState.prices, zilToken, zilAmount);
      tokenValue = valueCalculators.amount(tokenState.prices, poolToken, tokenAmount);
      totalValue = tokenValue.plus(zilValue);
    }

    return {
      addRemoveEvent,
      type,
      zilToken,
      poolToken,
      zilAmount,
      tokenAmount,
      totalValue,
    };
  }, [transaction, tokenState, valueCalculators]);

  return (
    <TableRow {...rest} className={cls(classes.root, className)}>
      <TableCell className={classes.placeholderCell} />
      {!!addRemoveEvent && (
        <React.Fragment>
          <TableCell>
            <Tooltip title={(transaction.data as any)?._tag}>
              <Text>{type === "add" ? "Add" : "Remove"} Liquidity</Text>
            </Tooltip>
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
        </React.Fragment>
      )}
      {!addRemoveEvent && (
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

export default AddRemoveLiquidityRow;
