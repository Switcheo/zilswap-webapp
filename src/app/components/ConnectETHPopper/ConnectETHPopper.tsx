import React from "react";
import { ClickAwayListener, FormControl, MenuItem, Paper, Popper, PopperProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";

export interface ConnectETHPopperProps extends PopperProps {
  onClickaway: () => void,
  onDisconnectEth: () => void,
  onChangeWallet: () => void,
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    // modal have zindex of 1300
    zIndex: 1311,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    display: "contents",
    "& .MuiSelect-select:focus": {
      backgroundColor: "transparent"
    },
    "& .MuiSelect-root": {
      borderRadius: 12,
      "&:hover": {
        backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
      }
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      fontWeight: "bold",
      fontSize: "16px"
    },
    "& .MuiSelect-icon": {
      top: "calc(50% - 14px)",
      fill: theme.palette.label
    },
    "& .MuiSelect-selectMenu": {
      minHeight: 0
    },
  },
  selectMenu: {
    width: "inherit",
    padding: theme.spacing(1),
    border: theme.palette.border,
    backgroundColor: theme.palette.background.default,
    "& .MuiListItem-root": {
      borderRadius: "12px",
      padding: theme.spacing(1.5),
      justifyContent: "center",
    },
    "& .MuiListItem-root.Mui-focusVisible": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
    },
    "& .MuiListItem-root.Mui-selected": {
      backgroundColor: theme.palette.label,
      color: theme.palette.primary.contrastText,
    },
    "& .MuiList-padding": {
      padding: "2px"
    }
  },
}));
const ConnectETHPopper: React.FC<ConnectETHPopperProps> = (props: ConnectETHPopperProps) => {
  const { onClickaway, onDisconnectEth, onChangeWallet, ...rest } = props;
  const classes = useStyles();

  const popperModifiers = {
    flip: {
      enabled: true,
    },
    preventOverflow: {
      // enabled: true,
      boundariesElement: 'scrollParent',
    },

  } as const;

  return (
    <Popper
      placement="bottom"
      modifiers={popperModifiers}
      className={classes.root}
      {...rest}
    >
      <ClickAwayListener onClickAway={() => onClickaway()}>
        <FormControl variant="outlined" className={classes.formControl}>
          <Paper className={classes.selectMenu}>
            <MenuItem onClick={() => onChangeWallet()}>Change Wallet</MenuItem>
            <MenuItem onClick={() => onDisconnectEth()}>Disconnect</MenuItem>
          </Paper>
        </FormControl>
      </ClickAwayListener>

    </Popper>
  );
};

export default ConnectETHPopper;