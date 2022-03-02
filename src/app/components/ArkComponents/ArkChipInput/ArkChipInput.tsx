import React, { useState } from "react";
import { BoxProps, Chip, FormControl, FormHelperText, InputBase, Box, Typography } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import ClearIcon from "@material-ui/icons/ClearRounded";
import cls from "classnames"
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  chips: string[];
  error?: string;
  startAdornment?: JSX.Element;
  onInputBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onDelete: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

const BootstrapInput = withStyles(theme => ({
  root: {
    borderRadius: 12,
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
    border: (theme as unknown as AppTheme).palette.border,
    'label + &': {
      marginTop: theme.spacing(3.5),
    },
    '&:focus': {
      borderColor: theme.palette.action.selected,
    },
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    padding: "5px 12px",
    minHeight: "39.25px",
    display: "flex",
    flexWrap: "wrap",
  },
  input: {
    position: "relative",
    fontSize: 12,
    width: "100%",
  },
}))(InputBase);

const ArkChipInput: React.FC<Props> = (props: Props) => {
  const { startAdornment, error = "", chips, onInputBlur, onDelete, onKeyDown, className, ...rest } = props;
  const classes = useStyles();
  const [onFocus, setOnFocus] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const element = event.currentTarget as HTMLInputElement;

    if (onInputBlur && element.value.length > 0) {
      event.preventDefault();
      setInputValue("");
      onInputBlur(event);
    }
    
    setOnFocus(false);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const element = event.currentTarget as HTMLInputElement;

    if ((event.key === ";" || event.key === "Enter") && element.value.length > 0) {
      event.preventDefault();
      setInputValue("");
      onKeyDown(event);
    }
  }

  return (
    <Box className={cls(classes.root, className)}>
      <FormControl fullWidth>
        <BootstrapInput
          startAdornment={
            chips.map((value: string, index: number) => {
              return (
                <Chip
                  key={index}
                  label={
                    <Typography>
                      {value}
                    </Typography>
                  }
                  deleteIcon={
                    <ClearIcon className={classes.deleteIcon} />
                  }
                  className={classes.chip}
                  onDelete={() => onDelete(value)}
                />
              )
            })
          }
          onFocus={() => setOnFocus(true)} onBlur={onBlur} className={cls({ [classes.focused]: onFocus && !error, [classes.error]: error, [classes.flexBasis]: chips.length })}
          value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => handleKeyDown(event)} fullWidth defaultValue="react-bootstrap" {...rest} />
        {error &&
          <FormHelperText className={classes.errorText} >{error}</FormHelperText>
        }
      </FormControl>
    </Box >
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(1),
    width: "100%",
    maxWidth: "506px",
    display: "flex",
    alignItems: "center",
    "& .MuiChip-root": {
      color: theme.palette.text?.primary,
    },
  },
  error: {
    border: "1px solid #FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 10,
    marginTop: "2px",
    margin: 0
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 12,
    margin: theme.spacing(0.4, 0),
  },
  hiddenText: {
    visibility: "hidden"
  },
  focused: {
    borderColor: theme?.palette?.action?.selected,
  },
  focusAdornment: {
    color: theme.palette.action?.selected
  },
  wordLimit: {
    float: "right",
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontFamily: 'Avenir Next',
    fontWeight: 700,
    fontSize: 10,
  },
  chip: {
    height: "22px",
    margin: theme.spacing(0.25, 0),
    background: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "rgba(107, 225, 255, 0.2)",
    "& .MuiChip-label": {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
    "&:focus": {
      background: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "rgba(107, 225, 255, 0.2)",
    },
    marginRight: "4px",
  },
  deleteIcon: {
    padding: "3px",
    margin: "0 2px 0 -6px",
    color: theme.palette.text?.primary,
  },
  flexBasis: {
    "& .MuiInputBase-input": {
      flexBasis: "content",
    }
  }
}));

export default ArkChipInput;
