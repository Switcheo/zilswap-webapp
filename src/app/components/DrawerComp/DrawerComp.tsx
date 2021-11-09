import React, { Fragment, useMemo } from "react";
import {
  Box, Button, Drawer, DrawerProps, IconButton,
  List, ListItem, makeStyles,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForwardRounded";
import cls from "classnames";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Text } from "app/components";
import { ReactComponent as SwapLogo } from "app/components/TopBar/assets/swap.svg";
import { ReactComponent as PoolLogo } from "app/components/TopBar/assets/pool.svg";
import { ReactComponent as ZilBridgeLogo } from "app/components/TopBar/assets/zilbridge.svg";
import { ReactComponent as ZiloLogo } from "app/components/TopBar/assets/zilo.svg";
import { Brand } from "app/components/TopBar/components";
import { RootState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import DrawerConfig from "./DrawerConfig";

interface Props extends DrawerProps {
  navPath: string;
}

const DrawerComp: React.FC<Props> = (props: Props) => {
  const { navPath, children, className, onClose, ...rest } = props;
  const classes = useStyles();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet)
  const location = useLocation();
  const drawerInfos = DrawerConfig[navPath];

  const renderLogo = useMemo(() => {
    switch (navPath) {
      case "pool": return <PoolLogo />
      case "swap": return <SwapLogo />
      case "bridge": return <ZilBridgeLogo />
      case "zilo": return <ZiloLogo />
      default: return <Brand />
    }
  }, [navPath]);

  if (!drawerInfos) return null;



  return (
    <Drawer
      anchor="right"
      PaperProps={{ className: classes.paper }}
      onClose={onClose}
      {...rest}
      className={cls(classes.root, className)}
    >
      <Box className={classes.drawerHeader}>
        <Button
          component={Link}
          to="/ark"
          className={classes.brandButton}
          disableRipple
        >
          {renderLogo}
        </Button>
        <IconButton className={classes.closeButton} onClick={(ev) => onClose && onClose(ev, "escapeKeyDown")}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        <List>
          {drawerInfos.map((info) =>
            <Fragment>
              {(!info.connectedOnly || (info.connectedOnly && walletState.wallet)) && (
                <ListItem
                  button
                  component={Link}
                  to={info.navLink}
                  className={cls(classes.listItem, {
                    [classes.buttonLeafActive]: info.highlightPaths.indexOf(location.pathname) > -1
                  })}
                >
                  <Text variant="button">{info.drawerText}</Text>
                </ListItem>
              )}
            </Fragment>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiTypography-button": {
      paddingLeft: "34px",
    },
    "& .MuiList-padding": {
      padding: 0,
    },
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "unset",
    minWidth: 250,
  },
  content: {
    flex: 1,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "4px 22px",
    justifyContent: "space-between",
    height: "49px",
    backgroundColor: theme.palette.toolbar.main,
  },
  listItem: {
    padding: 0,
    minHeight: 48,
  },
  brandButton: {
    padding: "4px 10px",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  closeButton: {
    padding: "8px",
    "& svg": {
      height: 22,
      width: 22,
    },
    "& path": {
      fill:
        theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "#D4FFF2",
    },
  },
  buttonLeafActive: {
    boxShadow: "inset 5px 0 0 #6BE1FF",
    "& .MuiButton-label": {
      color: "#6BE1FF",
    },
  },
  logo: {
    height: "28px"
  }
}));

export default DrawerComp;