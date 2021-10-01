import {
  Box, Button, Drawer, DrawerProps,
  List, useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CurrencyLogo, Text } from "app/components";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NetworkToggle from "../NetworkToggle";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { Brand } from "../TopBar/components";
import { NavigationContent } from "./components";
import navigationConfig from "./navigationConfig";
import { ReactComponent as Logo } from "./logo2.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  paper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "unset",
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
      "& svg": {
        height: theme.spacing(2),
        width: theme.spacing(2),
      },
    },
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  badge: {
    height: "auto",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(0.5),
    "& .MuiChip-label": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "4px 22px",
    justifyContent: "flex-start",
    minHeight: "49px",
    backgroundColor: theme.palette.toolbar.main,
  },
  price: {
    color: theme.palette.primary.dark,
    fontSize: 16,
    marginTop: "1px",
  },
  currencyLogo: {
    height: 24,
    width: 24,
    marginRight: theme.spacing(0.3),
    marginLeft: theme.spacing(0.5),
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
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  brandButton: {
    padding: "4px 10px",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  hoverEffect: {
    transition: "width .4s ease-in-out",
    "&:hover": {
      width: 260,
      transition: "width .4s ease-in-out",
    }
  },
  boxCompact: {
    padding: "0",
    justifyContent: "center",
  },
  boxNotCompact: {
    minWidth: 260,
  },
  footerNotCompact: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footerCompact: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  socialInactive: {
    flexDirection: "column",
    paddingLeft: 0
  },
  compactTheme: {
    margin: 0
  },
  compactPrice: {
    fontSize: 10,
  }
}));
let queryTimeout: number | undefined;

const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>((state) => state.token);
  const network = useNetwork();
  const [drawActive, setDrawActive] = useState(false);
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));

  const zapTokenValue: BigNumber = useMemo(() => {
    const zapContractAddr = ZWAP_TOKEN_CONTRACT[network] ?? "";
    const zapToken = tokenState.tokens[zapContractAddr];
    if (!zapToken) return BIG_ZERO;

    return valueCalculators
      .amount(tokenState.prices, zapToken, BIG_ONE)
      .shiftedBy(zapToken.decimals);
  }, [network, tokenState.prices, tokenState.tokens, valueCalculators]);

  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];

  const showDrawer = !!isXs || !!drawActive;
  return (
    <Drawer
      PaperProps={{ className: cls(classes.paper, !isXs && classes.hoverEffect, drawActive && classes.boxNotCompact) }}
      onClose={() => { onClose(); setDrawActive(false) }}
      {...rest}
      className={cls(classes.root, className)}
      onMouseEnter={() => setDrawActive(true)}
      onMouseLeave={() => setDrawActive(false)}
      onMouseOver={() => {
        if (!drawActive && !queryTimeout) {
          setDrawActive(true)
          queryTimeout = setTimeout(() => {
            clearTimeout(queryTimeout);
            queryTimeout = undefined;
          }, 50) as unknown as number;
        }
      }}
      variant={!isXs ? "permanent" : undefined}
      transitionDuration={1}
      onClick={() => setDrawActive(true)}
    >
      <Box className={cls(classes.drawerHeader, !showDrawer && classes.boxCompact)}>
        <Button
          component={Link}
          to="/"
          className={classes.brandButton}
          disableRipple
        >
          {showDrawer ? <Brand /> : <Logo />}
        </Button>
      </Box>
      <Box className={classes.content}>
        {navigationConfig.map((navigation, listIndex) => (
          <List key={listIndex}>
            {navigation.pages
              .filter((navigation) => navigation.show || claimEnabled)
              .map((page, index) => (
                <NavigationContent
                  onClose={onClose}
                  key={index}
                  navigation={page}
                  showDrawer={showDrawer}
                />
              ))}
          </List>
        ))}
      </Box>
      <Box className={cls(classes.footer, !showDrawer && classes.boxCompact)}>
        <Box className={showDrawer ? classes.footerNotCompact : classes.footerCompact}>
          {/* ZWAP Price */}
          <Box className={showDrawer ? classes.footerNotCompact : classes.footerCompact}>
            <CurrencyLogo
              className={classes.currencyLogo}
              currency="ZWAP"
              address={zwapAddress}
            />
            <Text variant="h6" className={cls(classes.price, !showDrawer && classes.compactPrice)}>
              &nbsp;$ {zapTokenValue.toFormat(2)}
            </Text>
          </Box>
          <SocialLinkGroup className={showDrawer ? undefined : classes.socialInactive} />
        </Box>
        <Box className={showDrawer ? classes.footerNotCompact : classes.footerCompact}>
          <ThemeSwitch className={!showDrawer ? classes.compactTheme : undefined} singleButton={!showDrawer} forceDark />
          <NetworkToggle compact={!showDrawer} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
