import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    padding: theme.spacing(3),
    borderRadius: 12,
    backgroundColor: theme.palette.background.contrast,
    "&+$root": {
      marginTop: theme.spacing(4),
    },
    [theme.breakpoints.down("sm")]: {
      "&+$root": {
        marginTop: theme.spacing(1.5),
      }
    }
  },
}));
const ContrastBox: React.FC<BoxProps> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {children}
    </Box>
  );
};

export default ContrastBox;