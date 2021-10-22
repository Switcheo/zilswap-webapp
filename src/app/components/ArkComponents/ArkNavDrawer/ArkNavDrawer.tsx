import React from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerProps,
  IconButton,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForwardRounded";
import cls from "classnames";
import { Link } from "react-router-dom";
import { Text } from "app/components";
import ArkLogo from "app/components/ArkComponents/ArkTopBar/ark-logo.png";
import { AppTheme } from "app/theme/types";
import { useRouter } from "app/utils";

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

const ArkNavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const classes = useStyles();
  const router = useRouter();
  const location = router.location;

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
          <img src={ArkLogo} alt="logo" className={classes.logo} />
        </Button>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        <List>
          {/* <ListItem
            button
            component={Link}
            to="/ark"
            className={cls(classes.listItem, {[classes.buttonLeafActive]: }
          >
            <ListItemText primary="Discover" />
          </ListItem> */}
          <ListItem
            button
            component={Link}
            to="/ark/collections"
            className={cls(classes.listItem, {
              [classes.buttonLeafActive]:
                location.pathname === "/ark/collections",
            })}
          >
            <Text variant="button">Discover</Text>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/ark/profile"
            className={cls(classes.listItem, {
              [classes.buttonLeafActive]: location.pathname === "/ark/profile",
            })}
          >
            <Text variant="button">My Profile</Text>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default ArkNavDrawer;
