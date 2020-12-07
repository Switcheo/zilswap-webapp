import { Box, BoxProps, Checkbox, Container, FormControlLabel, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FirstPageRounded as FirstPageIcon, KeyboardArrowLeftRounded as KeyboardArrowLeftIcon, KeyboardArrowRightRounded as KeyboardArrowRightIcon, LastPageRounded as LastPageIcon } from "@material-ui/icons";
import { PoolRouteIcon, PoolsNavigationTabs, PoolsOverviewBanner, Text } from "app/components";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  tableSurface: {
    borderRadius: 4,
    boxShadow: theme.palette.cardBoxShadow,
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
}));

const PoolTransactions: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const [showAllTransactions, setShowAllTransactions] = useState<boolean>(true);
  const classes = useStyles();

  const onChangeShowAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllTransactions(!event.target.checked);
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

            <FormControlLabel
              label={<Text color="textSecondary">Your Transactions Only</Text>}
              control={(
                <Checkbox color="primary"
                  checked={!showAllTransactions}
                  onChange={onChangeShowAll} />
              )} />
          </Box>

          <Paper className={classes.tableSurface}>
            <TableContainer>
              <Table>
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell className={classes.placeholderCell} />
                    <TableCell>Transaction</TableCell>
                    <TableCell>Pool / Route</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">Token Amount</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell className={classes.placeholderCell} />
                  </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                  <TableRow>
                    <TableCell className={classes.placeholderCell} />
                    <TableCell>Add Liquidity</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PoolRouteIcon route={["SWTH", "ZIL"]} marginRight={1} />
                        <Text className={classes.text}>SWTH - ZIL</Text>
                      </Box>
                    </TableCell>
                    <TableCell align="right">$4,123</TableCell>
                    <TableCell align="right">
                      - 1,123 SWTH
                      <br />
                      - 123 DAI
                  </TableCell>
                    <TableCell align="right">
                      14 minutes ago
                    </TableCell>
                    <TableCell className={classes.placeholderCell} />
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.placeholderCell} />
                    <TableCell>Swap SWTH for DAI</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PoolRouteIcon route={["SWTH", "ZIL", "DAI"]} marginRight={1} />
                        <Text className={classes.text}>SWTH - ZIL - DAI</Text>
                      </Box>
                    </TableCell>
                    <TableCell align="right">$4,123</TableCell>
                    <TableCell align="right">
                      - 1,123 SWTH
                      <br />
                      + 123 DAI
                    </TableCell>
                    <TableCell align="right">
                      14 minutes ago
                    </TableCell>
                    <TableCell className={classes.placeholderCell} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" paddingRight={4}>
              <IconButton>
                <FirstPageIcon color="primary" />
              </IconButton>
              <IconButton>
                <KeyboardArrowLeftIcon color="primary" />
              </IconButton>
              <IconButton>
                <KeyboardArrowRightIcon color="primary" />
              </IconButton>
              <IconButton>
                <LastPageIcon color="primary" />
              </IconButton>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default PoolTransactions;
