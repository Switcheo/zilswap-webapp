import React, { useMemo } from "react";
import { Box, Button, Drawer, DrawerProps, List, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import { CurrencyLogo, Text } from "app/components";
import { actions } from "app/store";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/constants";
import NetworkToggle from "../NetworkToggle";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { Brand } from "../TopBar/components";
import { NavigationContent } from "./components";
import { ReactComponent as Logo } from "./logo2.svg";
import navigationConfig from "./navigationConfig";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiList-padding": {
      padding: 0,
    },
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "unset",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "0.5rem",
    // },
    // "&::-webkit-scrollbar-thumb": {
    //   backgroundColor: `rgba${hexToRGBA(
    //     theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    //     1
    //   )}`,
    //   borderRadius: 12,
    // },
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
    minHeight: "48px",
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
    },
  },
  boxCompact: {
    padding: 0,
    justifyContent: "center",
  },
  footerBoxCompact: {
    padding: theme.spacing(2, 0),
    justifyContent: "center",
  },
  box: {
    minWidth: 260,
  },
  footerBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerCompact: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  socialCompact: {
    flexDirection: "column",
    paddingLeft: 0,
  },
  compactTheme: {
    margin: 0,
  },
  compactPrice: {
    fontSize: 10,
    paddingBottom: "12px",
  },
}));

const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>((state) => state.token);
  const navDrawerExpanded = useSelector<RootState, boolean>(
    (state) => state.layout.expandNavDrawer
  );
  const network = useNetwork();
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

  const showDrawer = !!isXs || !!navDrawerExpanded;

  const expandNavDrawer = () => {
    dispatch(actions.Layout.toggleExpandNavDrawer("open"));
  };

  const closeNavDrawer = () => {
    dispatch(actions.Layout.toggleExpandNavDrawer("close"));
  };

  return (
    <Drawer
      PaperProps={{
        className: cls(classes.paper, {
          [classes.hoverEffect]: !isXs,
          [classes.box]: !!navDrawerExpanded,
        }),
      }}
      onClose={() => {
        onClose();
        closeNavDrawer();
      }}
      {...rest}
      className={cls(classes.root, className)}
      onMouseEnter={() => expandNavDrawer()}
      onMouseLeave={() => closeNavDrawer()}
      variant={!isXs ? "permanent" : ""}
      transitionDuration={1}
      onClick={() => expandNavDrawer()}
    >
      <Box
        className={cls(classes.drawerHeader, {
          [classes.boxCompact]: !showDrawer,
        })}
      >
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
      <Box
        className={cls(classes.footer, {
          [classes.footerBoxCompact]: !showDrawer,
        })}
      >
        <Box className={showDrawer ? classes.footerBox : classes.footerCompact}>
          {/* ZWAP Price */}
          <Box
            className={showDrawer ? classes.footerBox : classes.footerCompact}
          >
            <CurrencyLogo
              className={classes.currencyLogo}
              currency="ZWAP"
              address={zwapAddress}
            />
            <Text
              variant="h6"
              className={cls(classes.price, {
                [classes.compactPrice]: !showDrawer,
              })}
            >
              &nbsp;$ {zapTokenValue.toFormat(2)}
            </Text>
          </Box>
          <SocialLinkGroup
            className={!showDrawer ? classes.socialCompact : ""}
            compact={!showDrawer}
          />
        </Box>
        <Box className={showDrawer ? classes.footerBox : classes.footerCompact}>
          <ThemeSwitch
            className={!showDrawer ? classes.compactTheme : ""}
            compact={!showDrawer}
            forceDark
          />
          <NetworkToggle compact={!showDrawer} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
