import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  makeStyles,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { useRouter } from "app/utils";
import React from "react";
import { Link } from "react-router-dom";
import cls from "classnames";
import { ReactComponent as ARKBrand } from "./ARK-logo.svg";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  appBar: {
    backgroundColor: "#192434",
    border: "1px solid #0D1B24",
    borderRadius: 12,
  },
  toolbar: {},
  borderTopLeft: {
    position: "absolute",
    width: "10px",
    height: "10px",
    top: 0,
    left: 0,
    borderTop: "1px solid rgba(222, 255, 255, 0.5)",
    borderLeft: "1px solid rgba(222, 255, 255, 0.5)",
  },
  borderTopRight: {
    position: "absolute",
    width: "10px",
    height: "10px",
    top: 0,
    right: 0,
    borderTop: "1px solid rgba(222, 255, 255, 0.5)",
    borderRight: "1px solid rgba(222, 255, 255, 0.5)",
  },
  borderBottomLeft: {
    position: "absolute",
    width: "10px",
    height: "10px",
    bottom: 0,
    left: 0,
    borderBottom: "1px solid rgba(222, 255, 255, 0.5)",
    borderLeft: "1px solid rgba(222, 255, 255, 0.5)",
  },
  borderBottomRight: {
    position: "absolute",
    width: "10px",
    height: "10px",
    bottom: 0,
    right: 0,
    borderBottom: "1px solid rgba(222, 255, 255, 0.5)",
    borderRight: "1px solid rgba(222, 255, 255, 0.5)",
  },
  brandButton: {
    padding: theme.spacing(0.5, 4),
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  brand: {
    width: "113px",
    [theme.breakpoints.down("xs")]: {
      width: "100px",
    },
  },
  navLinkBox: {
    display: "flex",
    alignItems: "center",
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
  },
  selectedMenu: {
    color: "#26D4FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
    // textShadow: "0 0 4px rgba(107, 225, 255, 0.2)",
  },
}));

const ARKNavBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = () => {
  const classes = useStyles();
  const router = useRouter();
  const location = router.location;

  return (
    <Container className={classes.root}>
      <AppBar className={classes.appBar} elevation={0} position="relative">
        {/* Corner borders */}
        <Box className={classes.borderTopLeft} />
        <Box className={classes.borderTopRight} />
        <Box className={classes.borderBottomLeft} />
        <Box className={classes.borderBottomRight} />

        <Toolbar className={classes.toolbar}>
          <Grid container>
            <Button
              component={Link}
              to="/ark"
              className={classes.brandButton}
              disableRipple
            >
              <ARKBrand className={classes.brand} />
            </Button>
            <Box className={classes.navLinkBox}>
              <Button
                component={Link}
                to="/ark/collections"
                className={classes.navLinkButton}
                disableRipple
              >
                <Typography
                  className={cls(classes.navLink, {
                    [classes.selectedMenu]:
                      location.pathname.indexOf("/ark/collections") === 0,
                  })}
                >
                  Collections
                </Typography>
              </Button>
              <Button
                component={Link}
                to="/ark/profile"
                className={classes.navLinkButton}
                disableRipple
              >
                <Typography
                  className={cls(classes.navLink, {
                    [classes.selectedMenu]:
                      location.pathname === "/ark/profile",
                  })}
                >
                  My Profile
                </Typography>
              </Button>
            </Box>
          </Grid>
        </Toolbar>
      </AppBar>
    </Container>
  );
};

export default ARKNavBar;
