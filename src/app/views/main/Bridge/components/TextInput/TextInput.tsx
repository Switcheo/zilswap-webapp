import React from "react";
import { Box, InputLabel, OutlinedInput, makeStyles } from "@material-ui/core";
import cls from "classnames";

const useStyles = makeStyles(theme => ({
  root: {
  },
  input: {
    marginBottom: 20,
  },
  inputError: {
    border: `1px solid ${theme.palette.error.main}`
  },
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px!important"
    },
    padding: "18.5px 14px!important"
  },
  preview: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  error: {
    float: "right",
  },
  floatLeft: {
    float: "left",
  },
}));

export interface TextInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  placeholder: string;
  text: string;

  onInputChange?: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = (props: any) => {
  const { children, className, label, placeholder, text, onInputChange, ...rest } = props;
  const classes = useStyles();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onInputChange === "function") {
      onInputChange(event.target.value);
    }
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel className={classes.floatLeft}>{label}</InputLabel>
      <OutlinedInput
        placeholder={placeholder}
        value={text}
        fullWidth
        className={cls(classes.input)}
        onChange={onChange}
        classes={{ input: classes.inputText }}
      />
    </Box>
  );
};

export default TextInput;
