import { Box, BoxProps, CircularProgress, Container, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { KeyboardArrowLeftRounded as KeyboardArrowLeftIcon, KeyboardArrowRightRounded as KeyboardArrowRightIcon } from "@material-ui/icons";
import { PoolsNavigationTabs, PoolsOverviewBanner, Text } from "app/components";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import { ViewBlock, ZilTransaction } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { CONTRACTS as ZilswapContract } from "zilswap-sdk/lib/constants";
import { AddRemoveLiquidityRow, SwapTxRow } from "./components";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  tableSurface: {
    borderRadius: 4,
    boxShadow: theme.palette.cardBoxShadow,
    position: "relative",
  },
  text: {
    fontSize: "14px",
  },
  tableHead: {
    backgroundColor: theme.palette.background.contrastAlternate,
    "& th.MuiTableCell-root": {
      borderBottom: "none",
    },
  },
  tableBody: {
    "& > tr > td": {
      padding: theme.spacing(2.5),
      fontSize: "14px",
      borderBottom: `1px solid #9CCAD2`,
    },
  },
  placeholderCell: {
    borderBottom: "none !important",
    padding: `${theme.spacing(2)}px !important`,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    backgroundColor: "rgba(0,0,0, .7)",
  },
}));

const PoolTransactions: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;

  const [pageNumber, setPageNumber] = useState<number>(1);
  // const [showAllTransactions, setShowAllTransactions] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<ZilTransaction[]>([]);
  const [runQueryEvents, queryLoading, queryError] = useAsyncTask("queryEvents");
  const classes = useStyles();

  const network = ZilswapConnector.network;

  useEffect(() => {
    runQueryEvents(async () => {
      if (!network) return;
      const transactions = await ViewBlock.listTransactions({
        address: ZilswapContract[network],
        limit: 10,
        network: network.toLowerCase(),
        page: pageNumber,
      });

      console.log(transactions);

      setTransactions(transactions)
    })

    // eslint-disable-next-line
  }, [network, pageNumber]);

  // const onChangeShowAll = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setShowAllTransactions(!event.target.checked);
  // };

  const onPage = (change: number) => {
    return (event: React.MouseEvent) => {
      setPageNumber(Math.max(pageNumber + change, 0));
    };
  };

  return (
    <Page {...rest} className={cls(classes.root, className)}>
      <PoolsOverviewBanner />
      <Box marginTop={6.5}>
        <Container maxWidth="lg">
          <PoolsNavigationTabs />

          <Box display="flex" marginTop={4} marginBottom={2}>
            {/* <Button>XXX</Button>
            <Button>YYY</Button> */}

            <Box flex={1} />

            {/* <FormControlLabel
              label={<Text color="textSecondary">Your Transactions Only</Text>}
              control={(
                <Checkbox color="primary"
                  checked={!showAllTransactions}
                  onChange={onChangeShowAll} />
              )} /> */}
          </Box>

          {!!queryError && (
            <Text marginY={2} color="error">Query Error: {queryError.message}</Text>
          )}

          <Paper className={classes.tableSurface}>
            <TableContainer>
              {queryLoading && (
                <Box className={classes.overlay}>
                  <CircularProgress />
                </Box>
              )}
              <Table>
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell className={classes.placeholderCell} />
                    <TableCell></TableCell>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Pool / Route</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">Token Amount</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell className={classes.placeholderCell} />
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  {transactions.map((transaction) => (
                    <React.Fragment key={transaction.hash}>
                      {["SwapExactTokensForZIL", "SwapExactZILForTokens", "SwapExactTokensForTokens"].includes(transaction.data?._tag ?? "") && (
                        <SwapTxRow transaction={transaction} />
                      )}
                      {["AddLiquidity", "RemoveLiquidity"].includes(transaction.data?._tag ?? "") && (
                        <AddRemoveLiquidityRow transaction={transaction} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" alignItems="center" paddingRight={4}>
              {/* <IconButton>
                <FirstPageIcon color="primary" />
              </IconButton> */}
              <IconButton disabled={pageNumber === 1} onClick={onPage(-1)}>
                <KeyboardArrowLeftIcon color="primary" />
              </IconButton>
              <Text>{pageNumber}</Text>
              <IconButton onClick={onPage(+1)}>
                <KeyboardArrowRightIcon color="primary" />
              </IconButton>
              {/* <IconButton>
                <LastPageIcon color="primary" />
              </IconButton> */}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default PoolTransactions;
