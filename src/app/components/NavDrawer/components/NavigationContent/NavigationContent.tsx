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
import * as IconModule from '../icons';
import InboxIcon from '@material-ui/icons/MoveToInbox';

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
    color: theme.palette.text?.primary,
    alignItems: "flex-end"
  },
  buttonLeafActive: {
    boxShadow: theme.palette.type === "dark" ? "inset 5px 0 0 #00FFB0" : "inset 5px 0 0 #003340"
  },
  highlightTitle: {
    color: theme.palette.type === "dark" ? "#00FFB0" : ""
  },
  mainFont: {
    fontSize: "16px!important",
  },
  secondaryFont: {
    fontSize: "14px!important",
  },
  icon: {
    marginRight: "12px",
    "& path": {
      fill: theme.palette.type === "dark" ? "#00FFB0" : "#003340"
    }
  },
  expandedList: {
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#F6FFFC"
  },
  textColoured: {
    color: theme.palette.type === "dark" ? "#00FFB0" : "#003340"
  }
}))

type NavigationContentProps = {
  navigation: NavigationPageOptions,
  secondary?: boolean,
  onClose?: any,
}

const Icons = (IconModule as unknown) as { [key: string]: React.FC };

const NavigationContent: React.FC<NavigationContentProps> = (props: NavigationContentProps) => {
  const { navigation, secondary, onClose } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState<any>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const Icon = navigation.icon ? Icons[navigation.icon] : InboxIcon;

  const initWidget = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setWidgetOpen(true);
    onClose?.(ev);

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
        <ListItem className={classes.listItem} disableGutters button>
          <Button
            className={cls({
              [classes.highlightTitle]: navigation.highlight,
              [classes.secondaryFont]: secondary
            }, classes.buttonLeaf)}
            href={navigation.href}
            target="_blank"
          >
            <Icon width="20px" className={classes.icon} />
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
            <Icon width="20px" className={classes.icon} />
            <ListItemText primary={navigation.title} primaryTypographyProps={{ className: classes.mainFont }} />
            {expand === navigation.title ? <ArrowDropUp /> : <ArrowDropDown />}
          </ListItem>
          <Collapse in={expand === navigation.title}>
            <List className={cls(classes.listItem, classes.expandedList)}>
              {navigation.items && navigation.items.map((item: NavigationPageOptions, index: number) => (
                <NavigationContent key={index} navigation={item} secondary={true} />
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
            <Icon width="20px" className={classes.icon} />
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
            <Icon width="20px" className={classes.icon} />
            { navigation.title === "Swap + Pool"
              ? <span>Swap <span className={classes.textColoured}>+</span> Pool</span>
              : navigation.title
            }
          </Button>
        </ListItem>
      )}
    </>
  );
};

export default NavigationContent;
