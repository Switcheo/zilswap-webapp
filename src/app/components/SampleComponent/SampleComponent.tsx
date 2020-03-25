import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const SampleComponent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {children}
    </Box>
  );
};

export default SampleComponent;