import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const KeyValueDisplay: any = (props: any) => {
  const { children, className, kkey, emphasizeValue, value: inputValue, ValueComponent = Typography, hideIfNoValue, ...rest } = props;
  const classes = useStyles();

  let value = inputValue;
  if (typeof children !== undefined)
    value = children;

  return (
    !value && hideIfNoValue ? null :
    <Box {...rest} display="flex" flexDirection={"row"} justifyContent="space-between" className={cls(classes.root, className)}>
      <Typography color="textSecondary" variant="body1">
        {kkey}
      </Typography>
      <ValueComponent color={emphasizeValue ? undefined : "textSecondary"} variant="body2">{value || <span>&nbsp;</span>}</ValueComponent>
    </Box>
  );
};

export default KeyValueDisplay;
