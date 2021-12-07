import React, { Fragment } from "react";
import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { Link } from "react-router-dom";
import ConnectWalletButton from "app/components/ConnectWalletButton";
import { ReactComponent as Logo } from "app/components/NavDrawer/logo2.svg";
import { ReactComponent as MenuIcon } from "app/components/TopBar/menu.svg";
import RewardsInfoButton from "app/layouts/RewardsInfoButton";
import { AppTheme } from "app/theme/types";
import { useRouter } from "app/utils";
import ArkyLogo from "./logo-arky-small.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: "100%",
    "& .MuiGrid-container": {
      flexWrap: "nowrap",
    },
  },
  toolBar: {
    justifyContent: "space-between",
    padding: 0,
    borderBottom: "1px solid transparent",
    borderImage:
      theme.palette.type === "dark"
        ? "linear-gradient(to left, #003340 1%, #6BE1FF 50%, #003340 100%) 0 0 100% 0/0 0 1px 0 stretch"
        : "",
    [theme.breakpoints.up("sm")]: {
      "&>div": {
        flex: 1,
        flexBasis: 1,
        display: "flex",
        flexDirection: "row",
      },
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 0,
    },
  },
  themeSwitch: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  grow: {
    flexGrow: 1,
  },
  chipText: {
    color: theme.palette.text.primary,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 2),
    justifyContent: "flex-start",
  },
  brandButton: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  brandBox: {
    paddingLeft: theme.spacing(15),
    "& svg": {
      width: 110,
    },
  },
  navLinkBox: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(2)
  },
  navLinkButton: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  navLink: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#DEFFFF",
    whiteSpace: "nowrap",
  },
  selectedMenu: {
    color: "#26D4FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  menuIcon: {
    padding: theme.spacing(0, 2),
  },
  logo: {
    height: "28px",
  }
}));

export interface ArkTopBarProps {
  onToggleDrawer: (override?: boolean) => void;
  onToggleArkDrawer: (override?: boolean) => void;
}

const ArkTopBar: React.FC<
  ArkTopBarProps & React.HTMLAttributes<HTMLDivElement>
> = (props: any) => {
  const { children, className, onToggleDrawer, onToggleArkDrawer, ...rest } =
    props;
  const classes = useStyles();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const router = useRouter();
  const location = router.location;

  return (
    <AppBar
      {...rest}
      elevation={0}
      position="static"
      className={cls(classes.root, className)}
    >
      <Toolbar className={classes.toolBar} variant="dense">
        {isXs ? (
          <Fragment>
            <Box flex={1}>
              <div className={classes.drawerHeader}>
                <IconButton onClick={onToggleDrawer}>
                  <Logo />
                </IconButton>
              </div>
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                component={Link}
                to="/arky"
                className={classes.brandButton}
                disableRipple
              >
                <img src={ArkyLogo} alt="logo" className={classes.logo} />
              </Button>
            </Box>
          </Fragment>
        ) : (
          <Grid container>
            <Link to="/arky" className={classes.brandBox}>
              <img src={ArkyLogo} alt="logo" className={classes.logo} />
            </Link>
            <Box className={classes.navLinkBox}>
              <Button
                component={Link}
                to="/arky/discover"
                className={classes.navLinkButton}
                disableRipple
              >
                <Typography
                  className={cls(classes.navLink, {
                    [classes.selectedMenu]:
                      (
                        location.pathname.indexOf("/arky/discover") === 0
                        || location.pathname.indexOf("/arky/collections") === 0
                      ),
                  })}
                >
                  Discover
                </Typography>
              </Button>
              <Button
                component={Link}
                to="/arky/profile"
                className={classes.navLinkButton}
                disableRipple
              >
                <Typography
                  className={cls(classes.navLink, {
                    [classes.selectedMenu]:
                      location.pathname.indexOf("/arky/profile") === 0,
                  })}
                >
                  My Profile
                </Typography>
              </Button>
              <Button
                component={Link}
                to="/ark/mint"
                className={classes.navLinkButton}
                disableRipple
              >
                <Typography
                  className={cls(classes.navLink, {
                    [classes.selectedMenu]:
                      location.pathname.indexOf("/arky/mint") === 0,
                  })}
                >
                  Mint
                </Typography>
              </Button>
            </Box>
          </Grid>
        )}
        <Box
          display="flex"
          flex={1}
          justifyContent="flex-end"
          alignItems="center"
        >
          {!isXs ? (
            <Fragment>
              <RewardsInfoButton />
              <ConnectWalletButton />
            </Fragment>
          ) : (
            <div className={classes.menuIcon}>
              <IconButton onClick={onToggleArkDrawer}>
                <MenuIcon />
              </IconButton>
            </div>
          )}
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default ArkTopBar;
