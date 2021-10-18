import React, { useState } from "react";
import { BoxProps, FormControl, FormHelperText, InputAdornment, InputBase, InputLabel, Box } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import cls from "classnames"
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  multiline?: boolean;
  error?: string;
  instruction?: string;
  startAdorment?: JSX.Element;
  inline?: boolean;
}

const BootstrapInput = withStyles((theme) => ({
  root: {
    borderRadius: 12,
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
    border: '1px solid #29475A',
    'label + &': {
      marginTop: theme.spacing(3),
    },
    '&:focus': {
      borderColor: theme.palette.action.selected,
    },
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    padding: '5px 12px',
  },
  input: {
    position: 'relative',
    fontSize: 12,
    width: '100%',
  },
}))(InputBase);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(1),
    width: "100%",
    display: "flex",
    alignItems: "center"
  },
  label: {
    fontSize: "16px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontFamily: "Avenir Next LT Pro",
    fontWeight: "bold",
    width: 150,
    overflowX: "visible",
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
    fontSize: 10,
    margin: 0
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontSize: 12,
    margin: 0,
    opacity: 0.5,
    width: 400,
  },
  hiddenText: {
    visibility: "hidden"
  },
  focussed: {
    borderColor: theme?.palette?.action?.selected,
  },
  multiline: {
    padding: '5px 12px',
    minHeight: 50,
  },
  inline: {
    display: "flex",
    justifyContent: "space-between",
  },
  focusAdornment: {
    color: theme.palette.action?.selected
  }
}));

const ArkInput: React.FC<Props> = (props: Props) => {
  const { inline, startAdorment, instruction, error = "", label, multiline, value, onValueChange, className, ...rest } = props;
  const classes = useStyles();
  const [onFocus, setOnFocus] = useState(false)

  return (
    <Box className={classes.root}>
      {inline && (<InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
        {label.toLocaleUpperCase()}
      </InputLabel>)}
      <FormControl fullWidth className={cls({ [classes.inline]: inline })}>
        {!inline && (<InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
          {label.toLocaleUpperCase()}
          {instruction && <FormHelperText className={classes.instruction} >{instruction}</FormHelperText>}
        </InputLabel>)}
        <BootstrapInput
          startAdornment={startAdorment ? <InputAdornment className={cls({ [classes.focusAdornment]: onFocus && !error })} position="start">{startAdorment}</InputAdornment> : undefined}
          onFocus={() => setOnFocus(true)} onBlur={() => setOnFocus(false)} className={cls({ [classes.focussed]: onFocus && !error, [classes.multiline]: multiline, [classes.error]: error && !!value })}
          multiline={multiline} value={value} onChange={(e) => onValueChange(e.target.value)} fullWidth defaultValue="react-bootstrap" {...rest} />
        <FormHelperText className={cls({ [classes.errorText]: true })} >{error ? error : " "}</FormHelperText>
      </FormControl>
    </Box>
  );
};

export default ArkInput;
