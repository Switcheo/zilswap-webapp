import { Box, BoxProps, Checkbox, CircularProgress, Container, FormControlLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Pagination } from "@material-ui/lab";
import { PoolsNavigationTabs, PoolsOverviewBanner, Text } from "app/components";
import Page from "app/layouts/Page";
import { RootState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useNetwork } from "app/utils";
import cls from "classnames";
import { PoolTransaction, ZAPStats } from "core/utilities";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AddRemoveLiquidityRow, SwapTxRow } from "./components";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiPaginationItem-page.Mui-selected": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected
    }
  },
  tableSurface: {
    borderRadius: 12,
    boxShadow: theme.palette.cardBoxShadow,
    position: "relative",
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    marginBottom: theme.spacing(2)
  },
  text: {
    fontSize: "14px",
  },
  tableHead: {
    "& th.MuiTableCell-root": {
      borderBottom: "none",
    },
    "& .MuiTableCell-head": {
      fontWeight: "bold"
    }
  },
  tableBody: {
    "& > tr > td": {
      padding: theme.spacing(2.5),
      fontSize: "14px",
      borderBottom: theme.palette.type === "dark" ? `1px solid rgba${hexToRGBA("#DEFFFF", 0.5)}` : `1px solid rgba${hexToRGBA("#003340", 0.5)}`
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
    borderRadius: 12
  },
}));

interface QueryOptions {
  page: number;
  address?: string;
};

const defaultOpts: QueryOptions = {
  page: 1,
};

const PoolTransactions: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;

  const [queryOpts, setQueryOpts] = useState<QueryOptions>(defaultOpts);
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [runQueryEvents, queryLoading, queryError] = useAsyncTask("queryEvents");
  const classes = useStyles();
  const network = useNetwork();

  useEffect(() => {
    runQueryEvents(async () => {
      if (!network) return;
      const { records, total_pages } = await ZAPStats.getPoolTransactions({
        per_page: 25,
        network,
        ...queryOpts,
      });

      setPagesCount(total_pages);
      setTransactions(records);
    })

    // eslint-disable-next-line
  }, [network, queryOpts]);

  const onChangeShowAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!walletState.wallet) return;

    setQueryOpts({
      ...queryOpts,
      address: undefined,

      ...!queryOpts.address && {
        address: walletState.wallet?.addressInfo.bech32,
      },
    });
  };

  const onPage = (event: React.ChangeEvent<any>, newPage: number) => {
    setQueryOpts({
      ...queryOpts,
      page: Math.max(newPage, 1)
    });
  };

  return (
    <Page {...rest} className={cls(classes.root, className)}>
      <Box mt={8}>
        <Container maxWidth="lg">
          <PoolsOverviewBanner />
        </Container>
      </Box>
      <Box marginTop={6.5}>
        <Container maxWidth="lg">
          <PoolsNavigationTabs />

          <Box display="flex" marginTop={4} marginBottom={2}>
            {/* <Button>XXX</Button>
            <Button>YYY</Button> */}

            <Box flex={1} />

            <FormControlLabel
              label={<Text color="textSecondary">Your Transactions Only</Text>}
              control={(
                <Checkbox color="primary"
                  checked={!!queryOpts.address}
                  onChange={onChangeShowAll} />
              )} />
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
                    <React.Fragment key={transaction.id}>
                      {transaction.tx_type === "swap" && (
                        <SwapTxRow transaction={transaction} />
                      )}
                      {transaction.tx_type === "liquidity" && (
                        <AddRemoveLiquidityRow transaction={transaction} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" alignItems="center" paddingTop={2} paddingBottom={2} paddingRight={4}>
              <Pagination count={pagesCount} page={queryOpts.page} onChange={onPage} showFirstButton showLastButton />
            </Box>
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default PoolTransactions;
