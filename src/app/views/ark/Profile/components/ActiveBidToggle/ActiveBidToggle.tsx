import { Box, BoxProps, Switch, Typography, FormControlLabel, useMediaQuery } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {
  totalCount?: number,
  header: string,
}

const PurpleSwitch = withStyles({
  root: {
    width: 36,
    height: 20,
    padding: 0,
    display: 'flex',
    marginRight: 8
  },
  switchBase: {
    padding: 2,
    color: "#0D1B24",
    '&$checked': {
      transform: 'translateX(16px)',
      color: "#00FFB0",
    },
  },
  thumb: {
    width: 16,
    height: 16,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid #0D1B24`,
    borderRadius: 10,
    opacity: 1,
    backgroundColor: "#00FFB0"
  },
  checked: {},
})(Switch);

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    padding: "16px 12px 16px 0px",
    display: "flex",
    flexDirection: 'row',
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  },
  header: {
    display: "flex",
    flexDirection: "row",
  },
  formLabel: {
    [theme.breakpoints.down("sm")]: {
      justifyContent: "left",
      marginLeft: 0,
      marginTop: theme.spacing(1),
    }
  },
  count: {
    marginLeft: theme.spacing(1),
  },
  switch: {

  }
}));

const ActiveBidToggle: React.FC<Props> = (props: Props) => {
  const { header, totalCount = 0, children, className, ...rest } = props;
  const classes = useStyles();
  const isSm = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("sm"));

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Typography className={classes.header} variant="h1">{header}<Typography className={classes.count} variant="h1">({totalCount})</Typography></Typography>
      <Box flexGrow={1} />
      <FormControlLabel
        className={classes.formLabel}
        control={<PurpleSwitch />}
        labelPlacement={isSm ? "end" : "start"}
        label="Show active offers only&nbsp;"
      />
    </Box>
  );
};

export default ActiveBidToggle;
