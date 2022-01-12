import React, { useEffect, useState } from "react";
import { BoxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import cls from "classnames"
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { BIG_ZERO } from "app/utils/constants";

import { AppTheme } from "app/theme/types";
import { ArkBox, ArkPaginator } from "app/components";
import { getBlockchain, getTokens } from "app/saga/selectors";
import { bnOrZero, toHumanNumber, useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { ArkOwnerLabel } from "..";

const ITEMS_PER_PAGE = 10

interface Props extends BoxProps {
  collectionId: string;
  tokenId: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  mobileContainer: {
    marginTop: theme.spacing(2),
  },
  headerCell: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    borderBottom: theme.palette.border,
    padding: "8px 16px",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
    opacity: 0.5
  },
  iconButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
  },
  buttonText: {
    color: "#DEFFFF",
    opacity: "100%",
  },
  bodyCell: {
    borderBottom: theme.palette.border,
    padding: "8px 16px",
  },
  emptyState: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    '&.row': {
      paddingTop: theme.spacing(3),
      borderBottom: 'none',
    },
    '&.box': {
      padding: theme.spacing(2, 0),
    }
  },
}));

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}

const HEADERS: HeadersProp[] = [
  { align: "right", value: "Type" },
  { align: "right", value: "Price" },
  { align: "center", value: "From" },
  { align: "center", value: "To" },
]

const ArkEventHistoryTable: React.FC<Props> = (props: Props) => {
  const { collectionId, tokenId } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [runGetNftTokenHistory] = useAsyncTask("getNftTokenHistory");
  const [history, sethistory] = useState<any[]>([]);
  const { tokens } = useSelector(getTokens);

  useEffect(() => {
    getHistory();
    // eslint-disable-next-line
  }, [])

  const getHistory = () => {
    runGetNftTokenHistory(async () => {
      const arkClient = new ArkClient(network)
      const result = await arkClient.getNftTokenHistory(collectionId, tokenId);
      sethistory(result.result.entries)
    })
  }

  const handlePageChange = (page: number) => {

  }

  const headers = HEADERS

  return (
    <ArkBox variant="base" className={classes.container}>
      <TableContainer>
        <Table>
         <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  key={`offers-${index}`}
                  className={classes.headerCell}
                  align={header.align}
                >
                  {header.value}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map(event => {
              const token = event['additionalData']['priceDenom'] ? tokens[toBech32Address(event.additionalData.priceDenom)] : null
              var amount = BIG_ZERO
              if(event['additionalData']['priceAmount'] && token) {
                amount = bnOrZero(event['additionalData']['priceAmount']).shiftedBy(-token.decimals)
              }
              return (
                <TableRow>
                  <TableCell align="right">{event.historyType}</TableCell>
                  <TableCell align="right">
                    {amount.isGreaterThan(0) ? (
                      <>{toHumanNumber(amount)} {token?.symbol}</>
                    ) : (
                      <>—</>
                    )}
                  </TableCell>
                  <TableCell><ArkOwnerLabel address={event.from} /></TableCell>
                  <TableCell><ArkOwnerLabel address={event.to} /></TableCell>
                </TableRow>
              )
            })}
            {history.length === 0 &&
              <TableRow>
                <TableCell colSpan={headers.length} className={cls(classes.emptyState, 'row')}>
                  No bid data yet.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
      <ArkPaginator itemPerPage={ITEMS_PER_PAGE} totalItem={history.length} onPageChange={handlePageChange} />
    </ArkBox>
  )
}

export default ArkEventHistoryTable;