import React from "react";
import { BoxProps, FormControl, FormHelperText, InputBase, InputLabel } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import cls from "classnames"
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  multiline?: boolean;
  error?: string;
}

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 12,
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
    position: 'relative',
    border: '1px solid #29475A',
    fontSize: 12,
    width: '100%',
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderColor: theme.palette.action.selected,
    },
  },

}))(InputBase);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  label: {
    fontSize: "14px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontFamily: "Avenir Next LT Pro",
  },
  error: {
    border: '1px solid #FF5252',
    color: "#FF5252",
    '&:focus': {
      borderColor: "#FF5252",
      color: "#FF5252",
    },
  },
  errorText: {
    color: "#FF5252",
  },
  helperText: {
    color: "#FF5252",
    fontSize: 10,
    margin: 0
  },
  hiddenText: {
    visibility: "hidden"
  }
}));

const ArkInput: React.FC<Props> = (props: Props) => {
  const { error = "", label, multiline, value, onValueChange, className, ...rest } = props;
  const classes = useStyles();

  return (
    <FormControl fullWidth className={classes.root}>
      <InputLabel shrink focused={false} className={cls({ [classes.label]: true, [classes.errorText]: error })}>
        {label.toLocaleUpperCase()}
      </InputLabel>
      <BootstrapInput  {...rest} inputProps={{ className: error ? classes.error : "", }} multiline={multiline} value={value} onChange={(e) => onValueChange(e.target.value)} fullWidth defaultValue="react-bootstrap" />
      <FormHelperText className={cls({ [classes.helperText]: true, [classes.hiddenText]: !error })} >{error ? error : ""}</FormHelperText>
    </FormControl>
  );
};

export default ArkInput;
