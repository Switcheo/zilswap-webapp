import { Drawer, DrawerProps, List, ListItem, ListItemIcon, ListItemText, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MailIcon from "@material-ui/icons/Mail";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import cls from "classnames";
import React from "react";
import { AppTheme } from "app/theme/types";
import SocialLinkGroup from "../SocialLinkGroup";
import ThemeSwitch from "../ThemeSwitch";

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
  footer: {
    height: theme.spacing(4.5),
    display: "flex",
    flexDirection: "row",
  },
}));
const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Drawer PaperProps={{ className: classes.paper }} {...rest} className={cls(classes.root, className)}>
      <Box className={classes.content}>
        <List>
          {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
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