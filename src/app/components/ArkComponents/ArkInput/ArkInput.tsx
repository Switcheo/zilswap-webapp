import { BoxProps, InputBase, FormControl, InputLabel } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import React from "react";

interface Props extends BoxProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  multiline?: boolean;
}

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 12,
    backgroundColor: "#0D1B24",
    position: 'relative',
    border: '1px solid #29475A',
    fontSize: 16,
    width: '100%',
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderColor: "#FFFFFF",
    },
  },

}))(InputBase);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(2)
  },
  label: {
    fontSize: "16px",
    color: "#DEFFFF"
  }
}));

const ArkInput: React.FC<Props> = (props: Props) => {
  const { label, multiline, value, onValueChange, className, ...rest } = props;
  const classes = useStyles();


  return (
    <FormControl fullWidth className={classes.root} {...rest}>
      <InputLabel shrink focused={false} className={classes.label}>
        {label}
      </InputLabel>
      <BootstrapInput multiline={multiline} value={value} onChange={(e) => onValueChange(e.target.value)} fullWidth defaultValue="react-bootstrap" />
    </FormControl>
  );
};

export default ArkInput;
