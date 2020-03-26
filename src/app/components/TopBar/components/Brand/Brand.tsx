import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import cls from "classnames";
import React from "react";
import { ReactComponent as BrandSVG } from "./brand.svg";
import { BrandProps } from "./types";

const useStyles = makeStyles(theme => ({
  root: (props: BrandProps) => ({
    position: "relative",
    display: "flex",
    flexDirection: "row",
    "& path#brand-text": {
      fill: props.theme === "dark" ? "#ffffff" : "rgba(0,0,0,.9)",
    }
  }),
}));

const Brand: React.FC<BrandProps> = (props: BrandProps) => {
  const { className, ...rest } = props;
  const classes = useStyles(props);

  return (
    <Box className={cls(classes.root, className)} {...rest}>
      <BrandSVG />
    </Box>
  );
};

Brand.propTypes = {
};

export default Brand;
