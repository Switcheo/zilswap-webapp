import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import React from 'react';
import TextFilter from './TextFilter';
import AttributesFilter from './AttributesFilter';
import RaritySlider from './RaritySlider';

const useStyles = makeStyles((theme: AppTheme) =>({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 10
  },
}))

const ARKFilterBar = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root} marginTop={2}>
      <TextFilter
        label="Sort by"
        currentValue={`NEWEST -> OLDEST`}
        options={[
          {value: "PRICE", detail: "Low - High"},
          {value: "PRICE", detail: "High - Low"},
          {value: "RARITY"},
          {value: "NEWEST -> OLDEST"},
          {value: "OLDEST -> NEWEST"}
        ]}
      />

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

      <RaritySlider />
    </Box>
  )
}

export default ARKFilterBar