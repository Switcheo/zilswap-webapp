import { Box, Button, Chip, Drawer, DrawerProps, List, ListItem, Collapse, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { useClaimEnabled } from "app/utils";
import cls from "classnames";
import React, { forwardRef, useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";
import { ReactComponent as CloseSVG } from "./close.svg";
import { ReactComponent as LogoSVG } from "./logo.svg";
import navigationConfig from "./navigationConfig";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref} style={{ flexGrow: 1 }} >
    <RouterLink {...props} />
  </div>
));

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
  badge: {
    height: "auto",
    padding: theme.spacing(.5, 1.5),
    borderRadius: theme.spacing(.5),
    "& .MuiChip-label": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  mainFont: {
    fontSize: "16px!important",
  },
  itemFont: {
    fontSize: "12px!important",
  },
  secondaryPadding: {
    paddingLeft: theme.spacing(1.5),
  }
}));
const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, onClose, ...rest } = props;
  const claimEnabled = useClaimEnabled();
  const classes = useStyles();
  const [expand, setExpand] = useState();

  const FilterPage = (props: any) => {
    const { page, index, secondary } = props
    if (page.external) {
      return  (
        <ListItem className={cls(classes.listItem, secondary && classes.secondaryPadding)} disableGutters button key={index}>
          <Button
          className={cls(classes.buttonLeaf, secondary && classes.itemFont)}
            href={page.href}
            target="_blank">
            {page.title}
          </Button>
        </ListItem>
      )
    }
    if(page.expand) {
      return (
        <>
          <ListItem className={cls(classes.listItem, classes.buttonLeaf)} disableGutters button key={index} onClick={() => setExpand(page.title === expand ? null : page.title)}>
          <ListItemText primary={page.title} primaryTypographyProps={{ className: classes.mainFont }} />
            { expand === page.title ? <ArrowDropUp /> : <ArrowDropDown /> }
          </ListItem>
          <Collapse in={expand === page.title}>
            <List>
            {page.items.map((item: any, index: number) => (
               <FilterPage page={item} index={index} secondary={true} />
            ))}
            </List>
          </Collapse>      
        </>
      )
    }
    return (
      <ListItem className={cls(classes.listItem, secondary && classes.secondaryPadding)} disableGutters button key={index}>
        <Button
          className={cls(classes.buttonLeaf, secondary && classes.itemFont)}
          activeClassName={classes.buttonLeafActive}
          component={CustomRouterLink}
          to={page.href}
          exact={false}
        >
          {page.title}
          {!!page.badge && (
            <Box display="flex" alignItems="center" marginLeft={2}>
              <Chip
                className={classes.badge}
                color="primary"
                label={page.badge} />
            </Box>
          )}
        </Button>
      </ListItem>
    )
  }

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
              <FilterPage page={page} index={index}/>
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
