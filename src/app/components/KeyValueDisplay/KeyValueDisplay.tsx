import React from "react";
import { Box, BoxProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

export interface Props extends BoxProps {
  kkey?: string | React.ReactNode;
  emphasizeValue?: boolean;
  valueColor?: "inherit" | "primary" | "secondary" | "textPrimary" | "textSecondary" | "initial";
  value?: string | React.ReactNode;
  ValueComponent?: string | React.FC;
  hideIfNoValue?: boolean;
  wrapLabel?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  label: {
    color: theme.palette.label
  },
  wrapLabel: {
    maxWidth: "30vw",
    whiteSpace: "pre-wrap",
  }
}));
const KeyValueDisplay: React.FC<Props> = (props: Props) => {
  const {
    children, className, kkey, emphasizeValue, value: inputValue,
    valueColor, ValueComponent = Typography, hideIfNoValue, wrapLabel, ...rest
  } = props;
  const classes = useStyles();

  let value = inputValue;
  if (typeof children !== "undefined")
    value = children;

  return (
    !value && hideIfNoValue ? null :
      <Box {...rest} display="flex" flexDirection={"row"} justifyContent="space-between" className={cls(classes.root, className)}>
        <Typography className={cls(classes.label, { [classes.wrapLabel]: wrapLabel })} variant="body1">
          {kkey}
        </Typography>
        <ValueComponent color={emphasizeValue ? valueColor : "textSecondary"} variant="body2">{value || <span>&nbsp;</span>}</ValueComponent>
      </Box>
  );
};

export default KeyValueDisplay;
