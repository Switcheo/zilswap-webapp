import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import React from 'react';
import TextFilter from './components/TextFilter';
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

const ARKFilterBar = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root} marginTop={2}>
      <Box className={classes.grid}>
        <SearchFilter />

        <TextFilter
          label="Sale Type"
          currentValue="ALL"
          options={[
            {value: "FIXED"},
            {value: "AUCTION"},
            {value: "OFFER"},
            {value: "NOT FOR SALE"}
          ]}
        />

        <AttributesFilter />
      </Box>
      <SortFilter />
    </Box>
  )
}

export default ARKFilterBar