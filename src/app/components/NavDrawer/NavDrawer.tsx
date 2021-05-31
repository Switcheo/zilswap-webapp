import { Box, Drawer, DrawerProps, List, IconButton } from "@material-ui/core";
// import Divider from '@material-ui/core/Divider';
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled } from "app/utils";
import cls from "classnames";
import React from "react";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { ReactComponent as CloseSVG } from "./close.svg";
import { NavigationContent } from "./components";
// import { ReactComponent as LogoSVG } from "./logo.svg";
import navigationConfig from "./navigationConfig";
import NetworkToggle from "../NetworkToggle";
import { Text } from "app/components";
import { CurrencyLogo } from "app/components";

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
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2)
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
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: "0px 22px",
    justifyContent: 'flex-start',
    minHeight: "49px",
    borderBottom: theme.palette.type === "dark" ? "1px solid #003340" : "1px solid transparent",
    backgroundColor: theme.palette.toolbar.main
  },
  price: {
    color: theme.palette.primary.dark
  }
}));

const ZWAP_TOKEN_ADDRESS = "zil1p5suryq6q647usxczale29cu3336hhp376c627";

const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();

  return (
    <Drawer PaperProps={{ className: classes.paper }} onClose={onClose} {...rest} className={cls(classes.root, className)}>
      <div className={classes.drawerHeader}>
        <IconButton onClick={onClose}>
          <CloseSVG />
        </IconButton>
      </div>
      <Box className={classes.content}>
        {navigationConfig.map((navigation, listIndex) => (
          <List key={listIndex}>
            {navigation.pages.filter(navigation => navigation.show || claimEnabled).map((page, index) => (
              <NavigationContent onClose={onClose} key={index} navigation={page}/>
            ))}
          </List>
        ))}
      </Box>
      <Box className={classes.footer}>
        <Box display="flex" justifyContent="space-around">
          {/* ZWAP Price */}
          <Box display="flex" alignItems="center">
            <CurrencyLogo currency="ZWAP" address={ZWAP_TOKEN_ADDRESS} />
              <Text variant="h3" className={classes.price}>
                &nbsp;$ 363.63
              </Text>
          </Box>
          <SocialLinkGroup />
        </Box>
        <Box display="flex" justifyContent="space-around">
          <ThemeSwitch forceDark />
          <NetworkToggle />
        </Box>
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
