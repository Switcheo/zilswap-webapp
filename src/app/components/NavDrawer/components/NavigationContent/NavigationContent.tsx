import { Button, Collapse, List, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import transakSDK from "@transak/transak-sdk";
import { AppTheme } from "app/theme/types";
import { TRANSAK_API_KEY } from "app/utils/constants";
import cls from "classnames";
import React, { forwardRef, useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import { NavigationPageOptions } from "../../types";

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref} style={{ flexGrow: 1 }} >
    <RouterLink {...props} />
  </div>
));

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  listItem: {
    padding: 0,
  },
  buttonLeaf: {
    padding: theme.spacing(2, 4),
    justifyContent: "flex-start",
    textTransform: "none",
    width: "100%",
    borderRadius: 0,
    color: theme.palette.colors.zilliqa.neutral[140],
  },
  buttonLeafActive: {
    color: theme.palette.colors.zilliqa.neutral[100],
  },
  highlightTitle: {
    color: theme.palette.colors.zilliqa.primary[100]
  },
  mainFont: {
    fontSize: "16px!important",
  },
  secondaryFont: {
    fontSize: "14px!important",
  },
}))

type NavigationContentProps = {
  className?: any,
  navigation: NavigationPageOptions,
  listIndex: number,
  secondary?: boolean,
  onClose?: any
}

const NavigationContent: React.FC<NavigationContentProps> = (props: NavigationContentProps) => {
  const { navigation, secondary, listIndex, onClose } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState<any>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const initWidget = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setWidgetOpen(true);
    if (typeof onClose === "function") onClose(ev);
    let transak = new transakSDK({
      apiKey: process.env.NODE_ENV === "production" ? TRANSAK_API_KEY.PRODUCTION : TRANSAK_API_KEY.DEVELOPMENT,  // Your API Key
      environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "STAGING", // STAGING/PRODUCTION
      defaultCryptoCurrency: 'ZIL',
      walletAddress: '', // Your customer's wallet address
      themeColor: '0E828A', // App theme color
      fiatCurrency: '', // INR/GBP
      email: '', // Your customer's email address
      redirectURL: '',
      hostURL: window.location.origin,
      widgetHeight: '600px',
      widgetWidth: '450px'
    });

    transak.init();
    transak.on(transak.EVENTS?.TRANSAK_WIDGET_CLOSE, () => setWidgetOpen(false));
  }

  return (
    <>
      {navigation.external && navigation.href && (
        <ListItem className={classes.listItem} disableGutters button key={listIndex}>
          <Button
            className={cls({
              [classes.highlightTitle]: navigation.highlight,
              [classes.secondaryFont]: secondary
            }, classes.buttonLeaf)}
            href={navigation.href}
            target="_blank"
          >
            {navigation.title}
          </Button>
        </ListItem>
      )}
      {navigation.expand && (
        <>
          <ListItem
            className={cls({
              [classes.highlightTitle]: navigation.highlight,
              [classes.secondaryFont]: secondary
            }, classes.buttonLeaf, classes.listItem)}
            button
            onClick={() => setExpand(navigation.title === expand ? null : navigation.title)}
          >
            <ListItemText primary={navigation.title} primaryTypographyProps={{ className: classes.mainFont }} />
            {expand === navigation.title ? <ArrowDropUp /> : <ArrowDropDown />}
          </ListItem>
          <Collapse in={expand === navigation.title}>
            <List className={classes.listItem}>
              {navigation.items && navigation.items.map((item: NavigationPageOptions, index: number) => (
                <NavigationContent navigation={item} listIndex={index} secondary={true} />
              ))}
            </List>
          </Collapse>
        </>
      )}
      {navigation.purchase && (
        <ListItem className={classes.listItem} disableGutters button>
          <Button
            className={cls({
              [classes.highlightTitle]: navigation.highlight,
              [classes.secondaryFont]: secondary
            }, classes.buttonLeaf)}
            onClick={(ev) => !widgetOpen && initWidget(ev)}
          >
            {navigation.title}
          </Button>
        </ListItem>
      )}
      {!navigation.external && !navigation.expand && !navigation.purchase && (
        <ListItem className={classes.listItem} disableGutters button>
          <Button
            className={cls({
              [classes.highlightTitle]: navigation.highlight,
              [classes.secondaryFont]: secondary
            }, classes.buttonLeaf)}
            activeClassName={classes.buttonLeafActive}
            component={CustomRouterLink}
            to={navigation.href}
            exact={false}
          >
            {navigation.title}
          </Button>
        </ListItem>
      )}
    </>
  );
};

export default NavigationContent;
