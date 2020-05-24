import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RootState } from "app/store/types";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";
import { ReactComponent as BrandSVG } from "./brand.svg";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    "& path#brand-text": {
      fill: "rgba(0,0,0,.9)",
    },
  },
  darkMode: {
    "& path#brand-text": {
      fill: "#ffffff",
    },
  },
}));

const Brand: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  const classes = useStyles(props);
  const themeType = useSelector<RootState, string>(state => state.preference.theme);

  return (
    <Box className={cls(classes.root, { [classes.darkMode]: themeType === "dark" }, className)} {...rest}>
      <BrandSVG />
    </Box>
  );
};

export default Brand;
