import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SearchInput } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {
  onSearch: (query: string | undefined) => void;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiSvgIcon-colorPrimary": {
      color: "currentColor"
    }
  },
}));

const PoolsSearchInput: React.FC<Props> = (props: Props) => {
  const { children, className, onSearch, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <SearchInput
        placeholder="Search Pool"
        onSearch={onSearch}
        fullWidth />
    </Box>
  );
};

export default PoolsSearchInput;
