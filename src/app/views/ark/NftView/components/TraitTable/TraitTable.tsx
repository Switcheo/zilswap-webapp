import React, { useEffect } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, TableProps, TableContainer } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { Nft } from "app/store/types";
import { bnOrZero, useAsyncTask, useNetwork } from "app/utils";
import { ArkClient } from "core/utilities";
import { getMarketplace } from "app/saga/selectors";
import { actions } from "app/store";

interface Props extends TableProps {
  token: Nft;
}

const TraitTable: React.FC<Props> = (props: Props) => {
  const { token, children, className, ...rest } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const network = useNetwork();
  const { collections, collectionTraits } = useSelector(getMarketplace);
  const [runGetCollectionTraits] = useAsyncTask("getCollectionTraits");

  const collectionAddress = token.collection.address.toLowerCase();
  const currentCollectionTraits = collectionTraits[collectionAddress];
  const collection = collections[collectionAddress]

  const total = bnOrZero(collection?.tokenStat.tokenCount);

  useEffect(() => {
    runGetCollectionTraits(async () => {
      if (!collection || !currentCollectionTraits) {
        const arkClient = new ArkClient(network);
        const res = await arkClient.getCollectionTraits(collectionAddress);
        dispatch(actions.MarketPlace.updateCollectionTraits(res));
      }
    })
    // eslint-disable-next-line
  }, [])

  const getPercent = (c?: number) => {
    const count = bnOrZero(c)
    if (count.lte(0) || total.isZero()) return "-"
    const percent = count.div(total);
    return `${percent.shiftedBy(2).toFormat(percent.lt(1) ? 2 : 0)} %`
  }

  return (
    <TableContainer>
      <Table {...rest} className={cls(classes.root, className)}>
        <TableHead>
          <TableRow className={classes.header}>
            {["Category", "Attribute", "Rarity", "Rarity %"].map((head, index) => (
              <TableCell align="center" key={head}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {token.traitValues.sort((a, b) => a.traitType.trait.localeCompare(b.traitType.trait)).map((value) => {
            const trait = value.traitType.trait
            return <TableRow className={classes.bodyRow} key={value.value}>
              <TableCell className={cls(classes.key, 'highlight')} align="center">{trait}</TableCell>
              <TableCell className="highlight" align="center">{value.value || "-"}</TableCell>
              <TableCell align="center">{value.count || "-"}</TableCell>
              <TableCell align="center">{getPercent(value.count)}</TableCell>
            </TableRow>
          })}
          {(!token.traitValues || token.traitValues.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className={cls(classes.emptyState, 'row')}>
                No trait data yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiTableCell-root": {
      borderBottom: theme.palette.border,
    }
  },
  header: {
    "& .MuiTableCell-root": {
      fontSize: 12,
      fontFamily: 'Avenir Next',
      fontWeight: 600,
      opacity: 0.8,
      letterSpacing: '0.1px',
    }
  },
  key: {
    opacity: 0.8,
  },
  bodyRow: {
    "&:last-child": {
      "& .MuiTableCell-root": {
        borderBottom: "none",
      }
    },
    "& .MuiTableCell-root": {
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'Avenir Next',
      whiteSpace: "nowrap",
      '&.highlight': {
        fontSize: 15,
        fontWeight: 700,
      }
    }
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

export default TraitTable;
