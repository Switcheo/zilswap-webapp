import React, { useState } from "react";
import { Box, BoxProps, FormControlLabel, Switch, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  header?: string,
  label?: string,
  overrideSm?: boolean,
  initialIsChecked?: boolean,
  onCheck?: (check: boolean) => void,
}

const ArkToggle: React.FC<Props> = (props: Props) => {
  const {
    overrideSm = false,
    header,
    label,
    initialIsChecked,
    onCheck,
    children,
    className,
    ...rest
  } = props;
  const classes = useStyles();
  const isSm = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("sm"));
  const [checked, setChecked] = useState(!!initialIsChecked);

  const handleChange = () => {
    setChecked(!checked);
    if (typeof onCheck === "function") {
      onCheck(!checked)
    }
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {
        header && <Typography className={cls(classes.header, { [classes.smRoot]: isSm && !overrideSm })}>
          {header}
        </Typography>
      }
      <Box flexGrow={1} />
      <FormControlLabel
        className={overrideSm ? undefined : classes.formLabel}
        control={<GreenSwitch onChange={() => handleChange()} checked={checked} />}
        labelPlacement={(isSm && !overrideSm) ? "end" : "start"}
        label={<Typography className={classes.switchLabel}>{label}</Typography>}
      />
    </Box>
  );
};

const GreenSwitch = withStyles((theme) => ({
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
    color: "#DEFFFF",
    '&$checked': {
      transform: 'translateX(16px)',
      color: "#0D1B24",
    },
  },
  thumb: {
    width: 16,
    height: 16,
    boxShadow: 'none',
  },
  track: {
    borderRadius: 10,
    opacity: 0.5,
    backgroundColor: "#00FFB0",
    '$checked$checked + &': {
      opacity: 1,
      backgroundColor: "#00FFB0",
    },
  },
  checked: {},
}))(Switch);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    extend: 'text',
    padding: "4px 4px 0px 0px",
    display: "flex",
    flexDirection: 'row',
  },
  text: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "14px",
  },
  header: {
    extend: 'text',
    fontWeight: 900,
    textTransform: "uppercase",
  },
  smRoot: {
    extend: 'text',
    fontWeight: 900,
    flexDirection: "column",
  },
  formLabel: {
    extend: 'text',
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

export default ArkToggle;
