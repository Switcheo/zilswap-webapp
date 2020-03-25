import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import cls from "classnames";
import React from "react";
import { ReactComponent as LogoSVG } from "./logo.svg";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
  },
}));

const Brand: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className } = props;
  const classes = useStyles();

  return (
    <Box className={cls(classes.root, className)}>
      <LogoSVG />
      <Typography>zilswap</Typography>
    </Box>
  );
};

Brand.propTypes = {
};

export default Brand;
