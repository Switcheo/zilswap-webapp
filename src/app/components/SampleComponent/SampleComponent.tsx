import React from "react";
import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {

}

const SampleComponent: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {children}
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

export default SampleComponent;
