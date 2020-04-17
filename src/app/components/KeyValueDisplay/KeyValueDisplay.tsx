import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const KeyValueDisplay: any = (props: any) => {
  const { children, className, kkey, value, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} display="flex" flexDirection={"row"} justifyContent="space-between" className={cls(classes.root, className)}>
      <Typography color="textSecondary" variant="body1">{kkey}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
};

export default KeyValueDisplay;