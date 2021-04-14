import { Box, Button, Drawer, DrawerProps, List } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled } from "app/utils";
import cls from "classnames";
import React from "react";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { ReactComponent as CloseSVG } from "./close.svg";
import { NavigationContent } from "./components";
import { ReactComponent as LogoSVG } from "./logo.svg";
import navigationConfig from "./navigationConfig";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "unset",
    minWidth: 260,
  },
  content: {
    flex: 1,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    "&>svg": {
      height: theme.spacing(3),
      width: theme.spacing(3),
      marginLeft: theme.spacing(2),
      marginTop: theme.spacing(1),
    },
    "& button": {
      minWidth: 0,
      padding: theme.spacing(1.5),
      color: "#A4A4A4",
      '& svg': {
        height: theme.spacing(2),
        width: theme.spacing(2),
      }
    }
  },
  footer: {
    height: theme.spacing(4.5),
    display: "flex",
    flexDirection: "row",
  },
  badge: {
    height: "auto",
    padding: theme.spacing(.5, 1.5),
    borderRadius: theme.spacing(.5),
    "& .MuiChip-label": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
}));
const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();

  return (
    <Drawer PaperProps={{ className: classes.paper }} onClose={onClose} {...rest} className={cls(classes.root, className)}>
      <Box className={classes.header}>
        <LogoSVG />
        <Box flex={1} />
        <Button onClick={onClose}>
          <CloseSVG />
        </Button>
      </Box>
      <Box className={classes.content}>
        {navigationConfig.map((navigation, index) => (
          <List key={index}>
            {navigation.pages.filter(navigation => navigation.show || claimEnabled).map((page, index) => (
              <NavigationContent navigation={page} listIndex={index} />
            ))}
          </List>
        ))}
      </Box>
      <Box className={classes.footer}>
        <SocialLinkGroup />
        <Box flex={1} />
        <ThemeSwitch forceDark />
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
