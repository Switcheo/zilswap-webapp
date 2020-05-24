import { CircularProgress, CircularProgressProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
    display: "block",
    margin: "0 auto",
  },
}));
const LoadableArea: React.FC<{ loading?: boolean } & CircularProgressProps> = (props: any) => {
  const { children, loading, ...rest } = props;
  const classes = useStyles();

  if (loading) return (
    <CircularProgress size={20} {...rest} className={classes.root} />
  );
  return children || <></>;
};

export default LoadableArea;