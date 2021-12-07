import React, { useState } from 'react';
import cls from "classnames";
import { OutlinedInput, makeStyles, FormControl, InputLabel } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppTheme } from 'app/theme/types';
import { RootState, MarketPlaceState } from 'app/store/types';
import { updateFilter } from 'app/store/marketplace/actions';

const useStyles = makeStyles((theme: AppTheme) => ({
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    border: theme.palette.border,
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
  label: {
    fontSize: 16,
    marginTop: 2,
    marginLeft: 6,
    fontWeight: 700,
    paddingLeft: "8px",
    "&.MuiFormLabel-root.Mui-focused": {
      color: theme.palette.text?.secondary
    }
  },
  withLabel: {
    transform: "translateY(8px)",
  }
}))

interface Props {
  label?: string;
}

const ArkSearchFilter = (props: Props) => {
  const { label } = props
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
    <FormControl fullWidth>
      {label && (<InputLabel className={classes.label} variant="filled" shrink={true}>{label}</InputLabel>)}
      <OutlinedInput
        placeholder="Search by ID"
        value={search}
        fullWidth
        classes={{ input: cls(classes.inputText, label && classes.withLabel) }}
        className={classes.input}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FormControl>
  )
}

export default ArkSearchFilter
