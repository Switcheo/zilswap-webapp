import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import cls from "classnames";
import MainCard from "app/layouts/MainCard";
import { RandomAsciiEmoji } from "app/components";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const Pool: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      <div style={{ height: 300 }}>
        <RandomAsciiEmoji />
      </div>
    </MainCard>
  );
};

export default Pool;