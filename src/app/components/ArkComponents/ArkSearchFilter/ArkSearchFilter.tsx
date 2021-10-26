import React, { useState } from 'react';
import { Box, OutlinedInput, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppTheme } from 'app/theme/types';
import { RootState, MarketPlaceState } from 'app/store/types';
import { updateFilter } from 'app/store/marketplace/actions';

const useStyles = makeStyles((theme: AppTheme) =>({
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    border: theme.palette.border,
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
}))

const ArkSearchFilter = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const [search, setSearch] = useState<string>(marketPlaceState.filter.search)

  const onSearchChange = (search: string) => {
    setSearch(search)
    // TODO: debounce me
    dispatch(updateFilter({ search }))
  }

  return (
    <Box>
      <OutlinedInput
        placeholder="Search by ID"
        value={search}
        fullWidth
        classes={{ input: classes.inputText }}
        className={classes.input}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </Box>
  )
}

export default ArkSearchFilter
