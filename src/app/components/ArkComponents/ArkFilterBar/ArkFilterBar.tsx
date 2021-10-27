import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import SearchFilter from '../ArkSearchFilter';
import SaleTypeFilter from './components/SaleTypeFilter';
import AttributesFilter from './components/AttributesFilter';
import SortFilter from './components/SortFilter';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    width: "100%",
    marginTop: 32
  },
  grid: {
    flexGrow: 1,
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 10,
    [theme.breakpoints.down("sm")]: {
      gridTemplate: "auto / repeat(2, minmax(0,1fr))"
    },
    [theme.breakpoints.down("xs")]: {
      '& > *': {
        gridColumn: "span 2 / span 2",
      },
    },
  },
}))

interface Props {
  collectionAddress: string;
}

const ArkFilterBar = (props: Props) => {
  const { collectionAddress } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root} marginTop={2}>
      <Box className={classes.grid}>
        <SearchFilter />

        <SaleTypeFilter />

        <AttributesFilter collectionAddress={collectionAddress} />
      </Box>
      <SortFilter />
    </Box>
  )
}

export default ArkFilterBar
