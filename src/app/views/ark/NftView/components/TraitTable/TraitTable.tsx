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
  const [traitCategory, setTraitCategory] = useState<string[]>([]);
  const { collectionTraits } = useSelector(getMarketplace);
  const [traits, setTraits] = useState<any>([]);
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
      const categories = currentCollectionTraits.map((collectionTrait: CollectionTrait) => collectionTrait.trait);

      let newTraits: SimpleMap<TraitsStatistic> = {};

      currentCollectionTraits.forEach((cate: any) => {
        newTraits[cate.trait] = cate
      })

      token.traitValues.forEach((trait) => {
        let currentTrait = newTraits[trait.traitType!.trait];
        currentTrait.rarity = currentTrait.values[trait.value];
        currentTrait.value = trait.value;
        currentTrait.type = trait.traitType?.trait;
        currentTrait.total = (Object.values(currentTrait.values) as number[]).reduce((prev, cur) => prev + cur, 0);

        currentTrait.percentage = new BigNumber(currentTrait.values[trait.value]).div(currentTrait.total).times(100).toFixed(1);
      })
      setTraits(newTraits);
      setTraitCategory(categories);
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
          {traitCategory.map((trait: string) => (
            <TableRow className={classes.bodyRow} key={trait}>
              <TableCell className={cls(classes.key, 'highlight')} align="center">{traits[trait].type || "-"}</TableCell>
              <TableCell className="highlight" align="center">{traits[trait].value || "-"}</TableCell>
              <TableCell align="center">{traits[trait].rarity || "-"}</TableCell>
              <TableCell align="center">{traits[trait].percentage ? `${traits[trait].percentage} %` : "-"}</TableCell>
            </TableRow>
          ))}
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
  }
}));

export default TraitTable;
