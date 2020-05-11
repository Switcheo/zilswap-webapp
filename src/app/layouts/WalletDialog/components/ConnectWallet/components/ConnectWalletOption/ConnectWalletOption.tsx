import { Box, Button, Typography, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as SecurityLevelIcon } from "./security-bars.svg";

export interface ConnectWalletOptionProps {
  secureLevel: number;
  label: string;
  icon?: React.FunctionComponent;
  buttonText: string;
  onSelect?: () => {};
  loading?: Boolean;
  disable?: Boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
  },
  icon: {
    height: 40,
    width: 40,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
  label: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  button: {
    minWidth: 200,
    marginLeft: theme.spacing(12),
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
  iconButton: {
    height: 32,
    width: 32,
    minWidth: 0,
    borderRadius: 42,
    padding: theme.spacing(.5),
    alignSelf: "center",
    [theme.breakpoints.up("md")]: {
      display: "none",
    }
  },
  securityLevelIcon: {
    marginLeft: theme.spacing(1.5),
  },
  securityLevel1: {
    "& path:first-child": {
      fill: theme.palette.primary.main,
    },
  },
  securityLevel2: {
    "& path:first-child+path": {
      fill: theme.palette.primary.main,
    },
  },
  securityLevel3: {
    "& path:first-child+path+path": {
      fill: theme.palette.primary.main,
    },
  },
  securityLevel4: {
    "& path:first-child+path+path+path": {
      fill: theme.palette.primary.main,
    },
  },
}));
const ConnectWalletOption: React.FC<ConnectWalletOptionProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { loading, disable, children, className, secureLevel, label, icon: Icon, buttonText, onSelect, ...rest } = props;
  const classes = useStyles();
  const securityLevelClass = {
    [classes.securityLevel1]: secureLevel >= 1,
    [classes.securityLevel2]: secureLevel >= 2,
    [classes.securityLevel3]: secureLevel >= 3,
    [classes.securityLevel4]: secureLevel >= 4,
  };
  return (
    <ContrastBox {...rest} className={cls(classes.root, className)}>
      <Icon className={classes.icon} />
      <Box className={classes.label}>
        <Typography variant="h3">{label}</Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Secure Level
          <SecurityLevelIcon className={cls(classes.securityLevelIcon, securityLevelClass)} />
        </Typography>
      </Box>
      <Button disabled={disable} className={classes.button} color="primary" variant="contained" onClick={() => { if (loading) return; onSelect() }}>{loading ? <CircularProgress size={14} /> : buttonText}</Button>
      <Button disabled={disable} className={classes.iconButton} color="primary" variant="contained" onClick={onSelect}>
        <ChevronRightIcon />
      </Button>
    </ContrastBox>
  );
};

export default ConnectWalletOption;