import { Button, ButtonGroup, ButtonGroupProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { PoolType, RootState } from "app/store/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles(theme => ({
  root: {
  },
  button: {
    borderRadius: 4,
    width: 90,
    padding: theme.spacing(1.5, 4),
    "&.MuiButton-contained": {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: theme.palette.primary.main,
    },
  },
}));
const PoolToggleButton: React.FC<ButtonGroupProps> = (props: ButtonGroupProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const poolType = useSelector<RootState, PoolType>(state => state.layout.showPoolType);

  const onTypeChange = (type: PoolType) => {
    if (type !== poolType)
      dispatch(actions.Layout.showPoolType(type));
  };

  return (
    <ButtonGroup {...rest} color="primary" className={cls(classes.root, className)}>
      <Button
        onClick={() => onTypeChange("add")}
        variant={poolType === "add" ? "contained" : "outlined"}
        className={classes.button}>
        Add
      </Button>
      <Button
        onClick={() => onTypeChange("manage")}
        variant={poolType === "manage" ? "contained" : "outlined"}
        className={classes.button}>
        Manage
      </Button>
    </ButtonGroup>
  );
};

export default PoolToggleButton;
