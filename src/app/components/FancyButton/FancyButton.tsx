import { Button, ButtonProps, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

export interface FancyButtonProps extends ButtonProps {
  loading?: boolean;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
  progress: {
    color: "rgba(255,255,255,.8)",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));
const FancyButton: React.FC<FancyButtonProps> = (props: any) => {
  const { children, loading, className, onClick, ...rest } = props;
  const classes = useStyles();

  const onButtonClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (loading) return;
    return typeof onClick === "function" && onClick(e);
  };

  return (
    <Button {...rest} className={cls(classes.root, className)} onClick={onButtonClick}>
      {!loading && children}
      {!!loading && (
        <CircularProgress size={24} className={classes.progress} />
      )}
    </Button>
  );
};

export default FancyButton;