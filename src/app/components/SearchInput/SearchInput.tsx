import { CircularProgress, InputAdornment, TextField, TextFieldProps } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";

type Props = Omit<Omit<TextFieldProps, "onChange">, "variant"> & {
  onSearch: (query: string | undefined) => void;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  progress: {
    height: `24px !important`,
    width: `24px !important`,
    "& svg": {
      height: 24,
      width: 24,
    },
  },
}));

const SEARCH_DEBOUNCE = 300;

let queryTimeout: number | undefined;

const SearchInput: React.FC<Props> = (props: Props) => {
  const { children, onSearch, className, ...rest } = props;
  const [input, setInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const classes = useStyles();

  const callCallback = (query?: string) => {
    if (typeof onSearch === "function")
      onSearch(query);
  }

  const onTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);
    if (!searching)
      setSearching(true);

    clearTimeout(queryTimeout);
    queryTimeout = setTimeout(() => {
      if (value === "")
        callCallback()
      else
        callCallback(value)
      setSearching(false);
    }, SEARCH_DEBOUNCE) as unknown as number;
  };

  return (
    <TextField
      variant="outlined"
      onChange={onTextChange}
      value={input} {...rest} className={cls(classes.root, className)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {searching && <CircularProgress className={classes.progress} color="primary" />}
            {!searching && <SearchOutlined color="primary" />}
          </InputAdornment>
        )
      }}
    >
      {children}
    </TextField>
  );
};

export default SearchInput;
