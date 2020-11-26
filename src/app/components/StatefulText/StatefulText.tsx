import { makeStyles, CircularProgress, CircularProgressProps } from "@material-ui/core";
import { useTaskSubscriber } from "app/utils";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));

const StatefulText: React.FC<CircularProgressProps & { loadingKey: string | string[] }> = (props: any) => {
  const { children, className, loadingKey, ...rest } = props;
  const classes = useStyles();
  const [loading] = useTaskSubscriber(loadingKey)

  return (
    <React.Fragment>
      {!loading && children}
      {loading && <CircularProgress size="1em" {...rest} className={cls(classes.root, className)} />}
    </React.Fragment>
  );
};

export default StatefulText;
