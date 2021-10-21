import React, { useState } from "react";
import { Box, BoxProps, FormControlLabel, Switch, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  totalCount?: number,
  header: string,
  switchLabel?: string,
  hideCount?: boolean,
  overrideSm?: boolean,
  isChecked?: boolean,
  onChecked?: (check: boolean) => void,
}

const ActiveBidToggle: React.FC<Props> = (props: Props) => {
  const {
    switchLabel, hideCount = false, overrideSm = false,
    isChecked, onChecked, header, totalCount = 0, children, className, ...rest
  } = props;
  const classes = useStyles();
  const isSm = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("sm"));
  const [checked, setChecked] = useState(!!isChecked);

  const handleChange = () => {
    setChecked(!checked);
    if (typeof onChecked === "function") {
      onChecked(!checked)
    }
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Typography className={cls(classes.root, { [classes.smRoot]: isSm && !overrideSm })}>{header}
        {!hideCount && <Typography className={classes.count} >({totalCount})</Typography>}
      </Typography>
      <Box flexGrow={1} />
      <FormControlLabel
        className={overrideSm ? undefined : classes.formLabel}
        control={<PurpleSwitch onChange={() => handleChange()} checked={checked} />}
        labelPlacement={(isSm && !overrideSm) ? "end" : "start"}
        label={<Typography className={classes.switchLabel}>{switchLabel}</Typography>}
      />
    </Box>
  );
};

const PurpleSwitch = withStyles((theme) => ({
  root: {
    width: 36,
    height: 20,
    padding: 0,
    display: 'flex',
    marginRight: 8,
    fontFamily: "'Raleway', sans-serif",
    fontSize: "14px",
  },
  switchBase: {
    padding: 2,
    color: "#0D1B24",
    '&$checked': {
      transform: 'translateX(16px)',
      color: "#DEFFFF",
    },
  },
  thumb: {
    width: 16,
    height: 16,
    boxShadow: 'none',
  },
  track: {
    borderRadius: 10,
    opacity: 1,
    backgroundColor: "#00FFB0",
    '$checked$checked + &': {
      backgroundColor: "#00FFB0",
    },
  },
  checked: {},
}))(Switch);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    padding: "4px 4px 0px 0px",
    display: "flex",
    fontSize: "14px",
    flexDirection: 'row',
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
  },
  smRoot: {
    fontSize: "14px",
    flexDirection: "column",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
  },
  formLabel: {
    fontSize: "14px",
    fontFamily: "'Raleway', sans-serif",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "left",
      marginLeft: 0,
      marginTop: theme.spacing(1),
    }
  },
  count: {
    fontSize: "14px",
    marginLeft: theme.spacing(1),
  },
  switchLabel: {
    fontSize: "14px",
    "& .MuiFormControlLabel": {
      fontFamily: "'Raleway', sans-serif",
    }
  }
}));

export default ActiveBidToggle;
