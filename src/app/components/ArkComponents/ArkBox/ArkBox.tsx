import React from "react";
import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  variant?: "base" | "overlay"
}

// Contrast box to be used on Ark backgrounds
const ArkBox: React.FC<Props> = (props: Props) => {
  const { children, className, variant = "overlay", ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className, variant)}>
      {children}
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    background: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "rgba(222, 255, 255, 0.5)",
    border: theme.palette.type === "dark" ? "none" : "1px solid rgba(107, 225, 255, 0.2)",
    borderRadius: theme.spacing(1.5),
    '&.base': {
      border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
      background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "rgba(222, 255, 255, 0.5)",
    }
  },
}));

export default ArkBox;
