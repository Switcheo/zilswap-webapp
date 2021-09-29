import {
  Box,
  Button,
  Drawer,
  DrawerProps,
  IconButton,
  List,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import { CurrencyLogo, Text } from "app/components";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NetworkToggle from "../NetworkToggle";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { Brand } from "../TopBar/components";
import { NavigationContent } from "./components";
import navigationConfig from "./navigationConfig";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
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
}));

const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>((state) => state.token);
  const network = useNetwork();

  const zapTokenValue: BigNumber = useMemo(() => {
    const zapContractAddr = ZWAP_TOKEN_CONTRACT[network] ?? "";
    const zapToken = tokenState.tokens[zapContractAddr];
    if (!zapToken) return BIG_ZERO;

    return valueCalculators
      .amount(tokenState.prices, zapToken, BIG_ONE)
      .shiftedBy(zapToken.decimals);
  }, [network, tokenState.prices, tokenState.tokens, valueCalculators]);

  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
  return (
    <Drawer
      PaperProps={{ className: classes.paper }}
      onClose={onClose}
      {...rest}
      className={cls(classes.root, className)}
      // onMouseEnter={() => }
      // onMouseLeave={() => }
      // variant="permanent"
    >
      <Box className={classes.drawerHeader}>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Button
          component={Link}
          to="/"
          className={classes.brandButton}
          disableRipple
        >
          <Brand />
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
                />
              ))}
          </List>
        ))}
      </Box>
      <Box className={classes.footer}>
        <Box display="flex" justifyContent="space-around">
          {/* ZWAP Price */}
          <Box display="flex" alignItems="center">
            <CurrencyLogo
              className={classes.currencyLogo}
              currency="ZWAP"
              address={zwapAddress}
            />
            <Text variant="h6" className={classes.price}>
              &nbsp;$ {zapTokenValue.toFormat(2)}
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
