import { Box, Typography, TypographyProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { extractBoxProps, PartialBoxProps } from "app/utils";
import clsx from "clsx";
import React from "react";

interface Props extends TypographyProps, PartialBoxProps {

}

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const Text: React.FC<Props> = (props: Props) => {
  const { boxProps, restProps } = extractBoxProps(props)
  const { className, children, ...rest } = restProps

  const classes = useStyles(props)
  return (
    <Box {...boxProps}>
      <Typography
        variant="body1"
        color="textPrimary"
        {...rest}
        className={clsx(classes.root, className)}
      >
        {children}
      </Typography>
    </Box>
  );
};

export default Text;
