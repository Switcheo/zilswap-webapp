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
  tab: {
    borderRadius: 12,
    width: 90,
    padding: theme.spacing(1.5, 4),
    [theme.breakpoints.down("xs")]: {
      width: 76,
      padding: theme.spacing(1, 2),
      "& .MuiButton-label": {
        fontSize: "14px",
      },
    },
    '&:not(:first-child)': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    },
    '&:not(:last-child)': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
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
    <ButtonGroup {...rest} color="secondary" className={cls(classes.root, className)}>
      <Button
        onClick={() => onTypeChange("add")}
        variant={poolType === "add" ? "contained" : "outlined"}
        className={classes.tab}>
        Add
      </Button>
      <Button
        onClick={() => onTypeChange("manage")}
        variant={poolType === "manage" ? "contained" : "outlined"}
        className={classes.tab}>
        Manage
      </Button>
    </ButtonGroup>
  );
};

export default PoolToggleButton;
