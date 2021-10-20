import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, TableProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { TraitValue } from "app/store/types";

interface Props extends TableProps {
  traits?: TraitValue[]
}

const TraitTable: React.FC<Props> = (props: Props) => {
  const { traits, children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Table {...rest} className={cls(classes.root, className)}>
      <TableHead>
        <TableRow>
          {["Category", "Attribute", "Rarity", "Rarity %"].map((head, index) => (
            <TableCell align="center">{head}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {traits?.map((trait, index) => (
          <TableRow className={classes.bodyRow} key={`traits-row-${index}`}>
            <TableCell className={classes.base} align="center">{trait.traitType?.trait}</TableCell>
            <TableCell className={classes.attribute} align="center">{trait.value}</TableCell>
            <TableCell align="center">-</TableCell>
            <TableCell align="center">-</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiTableCell-root": {
      borderBottom: "1px solid #29475A",
    }
  },
  header: {

  },
  base: {
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    opacity: 0.5
  },
  attribute: {
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
  },
  bodyRow: {
    "&:last-child": {
      "& .MuiTableCell-root": {
        borderBottom: "none",
      }
    }
  }
}));

export default TraitTable;
