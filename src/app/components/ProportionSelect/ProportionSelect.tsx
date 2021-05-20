import { Button, ButtonGroup, ButtonGroupProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

export interface ProportionSelectProps extends ButtonGroupProps {
  onSelectProp?: (proportion: number) => void;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
  percentageButton: {
    borderRadius: 5,
    color: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "#003340",
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    border: 0,
    margin: 4,
  },
}));
const ProportionSelect: React.FC<ProportionSelectProps> = (props: ProportionSelectProps) => {
  const { className, onSelectProp, ...rest } = props;
  const classes = useStyles();
  const onSelect = (proportion: number) => {
    if (typeof onSelectProp === "function")
      onSelectProp(proportion);
  };
  return (
    <ButtonGroup {...rest} className={cls(classes.root, className)}>
      <Button onClick={() => onSelect(0.25)} className={classes.percentageButton}>
        <Typography>25%</Typography>
      </Button>
      <Button onClick={() => onSelect(0.5)} className={classes.percentageButton}>
        <Typography>50%</Typography>
      </Button>
      <Button onClick={() => onSelect(0.75)} className={classes.percentageButton}>
        <Typography>75%</Typography>
      </Button>
      <Button onClick={() => onSelect(1)} className={classes.percentageButton}>
        <Typography>MAX</Typography>
      </Button>
    </ButtonGroup>
  );
};

export default ProportionSelect;
