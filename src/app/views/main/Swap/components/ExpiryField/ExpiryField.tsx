import { Box, InputLabel, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  inputWrapper: {
    height: 30,
    width: 60,
    marginRight: theme.spacing(1),
    textAlign: "center",
  },
  input: {
    textAlign: "center",
  },
  minutes: {
    display: "flex",
    alignItems: "center",
  },
}));

const SampleComponent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const dispatch = useDispatch();
  const expiry = useSelector<RootState, number>(state => state.swap.expiry);
  const classes = useStyles();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value.replace(/[^\d.]+/g, ""));
    dispatch(actions.Swap.update({ expiry: value }))
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel>Set Expire</InputLabel>
      <Box display="flex">
        <TextField
          variant="outlined"
          value={expiry}
          type="number"
          InputProps={{ className: classes.inputWrapper }}
          inputProps={{ className: classes.input }}
          onChange={onChange} />
        <Typography variant="body2" className={classes.minutes}>Blocks</Typography>
      </Box>
    </Box>
  );
};

export default SampleComponent;