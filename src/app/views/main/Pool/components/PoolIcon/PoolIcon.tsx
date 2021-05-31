import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import { ReactComponent as SvgMinus } from "./minus_pool.svg";
import { ReactComponent as SvgPlus } from "./plus_pool.svg";
import { AppTheme } from "app/theme/types";

export interface PoolIconProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "plus" | "minus";
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: 12,
    margin: "16px auto",
    height: 24,
    width: 24,
    padding: 6,
    background: theme.palette.type === "dark" ? "#303637": "#F7FAFA",
  },
  icon: {
    height: 12,
    width: 12,
    "& path": {
      fill: theme.palette.icon
    }
  }
}));
const PoolIcon: React.FC<PoolIconProps> = (props: PoolIconProps) => {
  const { children, className, type, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {type === "plus" && <SvgPlus className={classes.icon} />}
      {type === "minus" && <SvgMinus className={classes.icon} />}
    </Box>
  );
};

export default PoolIcon;
