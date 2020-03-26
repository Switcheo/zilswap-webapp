import { Box, Drawer, DrawerProps, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const NavDrawer: React.FC<DrawerProps> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Drawer {...rest} className={cls(classes.root, className)}>
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default NavDrawer;