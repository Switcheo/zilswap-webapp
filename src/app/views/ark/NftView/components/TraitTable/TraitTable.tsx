import React, { useState, useEffect } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, TableProps, TableContainer } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import BigNumber from "bignumber.js";
import { useDispatch, useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { CollectionTrait, Nft, TraitValue } from "app/store/types";
import { SimpleMap, useAsyncTask, useNetwork } from "app/utils";
import { ArkClient } from "core/utilities";
import { getMarketplace } from "app/saga/selectors";
import { actions } from "app/store";

interface Props extends TableProps {
  traits?: TraitValue[];
  token?: Nft;
}

interface TraitsStatistic {
  trait: string;
  rarity?: number;
  value?: string;
  type?: string;
  total?: number;
  percentage?: string;
  values: SimpleMap<number>;
}

const TraitTable: React.FC<Props> = (props: Props) => {
  const { token, children, className, ...rest } = props;
  const classes = useStyles();
  const [runGetCollectionTraits] = useAsyncTask("getCollectionTraits");
  const network = useNetwork();
  const { collectionTraits } = useSelector(getMarketplace);
  const [traits, setTraits] = useState<TraitsStatistic[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    runGetCollectionTraits(async () => {
      if (!token?.collection || !token?.traitValues?.length) return;

      const address = token.collection.address.toLowerCase();
      const arkClient = new ArkClient(network);
      let currentCollectionTraits = collectionTraits[address];
      if (!currentCollectionTraits) {
        const { result } = await arkClient.getCollectionTraits(address);
        const resultTraits: CollectionTrait[] = result.entries;
        currentCollectionTraits = resultTraits;
        dispatch(actions.MarketPlace.updateCollectionTraits({ address, traits: resultTraits }));
      }

      const traitMap: SimpleMap<CollectionTrait> = currentCollectionTraits.reduce((prev, curr) => ({ ...prev, [curr.trait]: curr }), {});

      let newTraits: SimpleMap<TraitsStatistic> = {};

      token.traitValues.forEach((trait) => {
        if (!trait.traitType?.trait) return;
        const traitName = trait.traitType.trait;
        newTraits[traitName] = traitMap[traitName];

        const currentTrait = newTraits[traitName];
        currentTrait.rarity = currentTrait.values[trait.value];
        currentTrait.value = trait.value;
        currentTrait.type = trait.traitType?.trait;
        currentTrait.total = (Object.values(currentTrait.values) as number[]).reduce((prev, cur) => prev + cur, 0);

        const percent = new BigNumber(currentTrait.values[trait.value]).div(currentTrait.total);
        currentTrait.percentage = percent.shiftedBy(2).toFormat(percent.lt(1) ? 2 : 0);
      })
      setTraits(Object.values(newTraits));
    })
    // eslint-disable-next-line
  }, [token?.traitValues])

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
          {traits.map((trait: TraitsStatistic) => (
            <TableRow className={classes.bodyRow} key={trait.value}>
              <TableCell className={cls(classes.key, 'highlight')} align="center">{trait.type || "-"}</TableCell>
              <TableCell className="highlight" align="center">{trait.value || "-"}</TableCell>
              <TableCell align="center">{trait.rarity || "-"}</TableCell>
              <TableCell align="center">{trait.percentage ? `${trait.percentage} %` : "-"}</TableCell>
            </TableRow>
          ))}
          {traits.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className={cls(classes.emptyState, 'row')}>
                No data yet.
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
