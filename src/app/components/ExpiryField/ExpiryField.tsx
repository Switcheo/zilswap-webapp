import { Box, InputLabel, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { ChangeEvent } from "react";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  inputWrapper: {
    height: 30,
    width: 60,
    marginRight: theme.spacing(1),
    textAlign: "center",
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#D4FFF2",
    borderRadius: "12px",
    border: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "transparent"}`,
  },
  input: {
    fontSize: "12px !important",
    textAlign: "center",
    padding: `${theme.spacing(.5, 1)} !important`,
  },
  minutes: {
    display: "flex",
    alignItems: "center",
  },
}));

const ExpiryField: React.FC<React.HTMLAttributes<HTMLDivElement> | any> = (props: any) => {
  const { children, className, newExpiry, updateNewExpiry, ...rest } = props;
  const classes = useStyles();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value.replace(/[^\d.]+/g, ""));
    if (typeof updateNewExpiry === "function") updateNewExpiry(value);
    // dispatch(actions.Swap.update({ expiry: value }))
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel>Set Expire</InputLabel>
      <Box display="flex">
        <TextField
          variant="outlined"
          value={newExpiry}
          type="number"
          InputProps={{ className: classes.inputWrapper }}
          inputProps={{ className: classes.input }}
          onChange={onChange} />
        <Typography variant="body2" className={classes.minutes}>Blocks</Typography>
      </Box>
    </Box>
  );
};

export default ExpiryField;
