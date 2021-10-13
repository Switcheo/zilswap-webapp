import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import SaleTypeFilter from './components/SaleTypeFilter';
import AttributesFilter from './components/AttributesFilter';
import SortFilter from './components/SortFilter';
import SearchFilter from './components/SearchFilter';

const useStyles = makeStyles((theme: AppTheme) =>({
  root: {
    display: "flex",
    width: "100%",
    marginTop: 32
  },
  grid: {
    flexGrow: 1,
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 10
  },
}))

interface Props {
  collectionAddress: any
}

const ARKFilterBar = (props: Props) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} marginTop={2}>
      <Box className={classes.grid}>
        <SearchFilter />

        <SaleTypeFilter />

        <AttributesFilter collectionAddress={props.collectionAddress} />
      </Box>
      <SortFilter />
    </Box>
  )
}

export default ARKFilterBar