import { Box, TableCell, TableRow, TableRowProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, PoolRouteIcon, Text } from "app/components";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ZIL_TOKEN_NAME } from "app/utils/contants";
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
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    type,
    zilToken,
    poolToken,
    zilAmount,
    tokenAmount,
  } = React.useMemo(() => {
    const addRemoveEvent = transaction.events.find(event => ["Mint", "Burnt"].includes(event.name));
    const addRemoveParams = addRemoveEvent?.params as any;
    const poolAddress = addRemoveParams?.pool;

    const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
    const zilAmount = bnOrZero(transaction.internalTransfers?.[0]?.value);

    const poolToken = tokenState.tokens[poolAddress];
    const transferEvent = transaction.events.find(event => event.name === "TransferFromSuccess");
    const tokenAmount = bnOrZero(transferEvent?.params?.amount);

    let type!: "add" | "remove";

    switch (transaction.data?._tag) {
      case "AddLiquidity":
        type = "add";
        break;
      case "RemoveLiquidity":
        type = "remove";
        break;
    }

    return {
      type,
      zilToken,
      poolToken,
      zilAmount,
      tokenAmount,
    };
  }, [transaction, tokenState]);

  return (
    <TableRow {...rest} className={cls(classes.root, className)}>
      <TableCell className={classes.placeholderCell} />
      <TableCell>
        <Tooltip title={(transaction.data as any)?._tag}>
          <Text>{type === "add" ? "Add" : "Remove"} Liquidity</Text>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <PoolRouteIcon route={[poolToken.symbol, zilToken.symbol]} marginRight={1} />
          <Text className={classes.text}>{poolToken.symbol} {zilToken.symbol}</Text>
        </Box>
      </TableCell>
      <TableCell align="right">$4,123</TableCell>
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
          currency={poolToken.symbol}
          compression={poolToken.decimals} />
      </TableCell>
      <TableCell align="right">
        {transaction.timestamp?.fromNow()}
      </TableCell>
      <TableCell className={classes.placeholderCell} />
    </TableRow>
  );
};

export default AddRemoveLiquidityRow;
