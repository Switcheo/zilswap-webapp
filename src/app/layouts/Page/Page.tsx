import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
    whiteSpace: "nowrap",
    maxWidth: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
}));
const Page: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, staticContext, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {children}
    </Box>
  );
};

export default Page;
