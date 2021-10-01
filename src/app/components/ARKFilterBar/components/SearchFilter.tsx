import { Box, makeStyles, OutlinedInput } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: AppTheme) =>({
  root: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: "#29475A",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "10px 24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    position: "relative"
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    borderColor: "#29475A",
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
}))

const SearchFilter = () => {
  const classes = useStyles();
  const [search, setSearch] = useState<string>("");

  return (
    <Box>
      <OutlinedInput
        placeholder="Search by name"
        value={search}
        fullWidth
        classes={{ input: classes.inputText }}
        className={classes.input}
        onChange={(e) => setSearch(e.target.value)}
      />
    </Box>
  )
}

export default SearchFilter