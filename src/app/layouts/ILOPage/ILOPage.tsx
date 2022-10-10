import React, { forwardRef } from 'react';
import { Box, makeStyles, Button } from '@material-ui/core';
import { PaperProps } from 'material-ui';
import cls from 'classnames';
import { Link as RouterLink } from 'react-router-dom';
import { AppTheme } from 'app/theme/types';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(8, 0, 2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 0, 2),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(6, 2, 2),
    },
  },
  tabs: {
    display: 'flex',
    width: '488px',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 450,
    },
  },
  tab: {
    position: 'relative',
    width: '100%',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    '&:hover': {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    },
  },
  tabCornerLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    border: theme.palette.border,
  },
  tabCornerRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: theme.palette.border,
    borderWidth: '1px 1px 1px 0',
  },
  tabActive: {
    backgroundColor: theme.palette.tab.active,
    color: theme.palette.tab.selected,
    '&:hover': {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    },
  },
  tabNoticeOpposite: {
    '&:after': {
      borderBottom: `8px solid ${theme.palette.background.paperOpposite!}`,
    },
  },
}));

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref} style={{ flexGrow: 1 }}>
    <RouterLink {...props} />
  </div>
));

const ILOPage: React.FC<PaperProps> = (props: PaperProps) => {
  const { children } = props;
  const classes = useStyles();
  let currentClasses = cls(classes.tab, classes.tabCornerLeft);
  if (window.location.pathname === '/zilo/current') {
    currentClasses = cls(classes.tab, classes.tabCornerLeft, classes.tabActive);
  }
  let pastClasses = cls(classes.tab, classes.tabCornerRight);
  if (window.location.pathname === '/zilo/past') {
    pastClasses = cls(classes.tab, classes.tabCornerRight, classes.tabActive);
  }

  return (
    <Box className={classes.root}>
      <Box display="flex" justifyContent="center">
        <Box className={classes.tabs}>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={currentClasses}
            component={CustomRouterLink}
            to="/zilo/current"
          >
            Current
          </Button>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={pastClasses}
            component={CustomRouterLink}
            to="/zilo/past"
          >
            Past
          </Button>
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export default ILOPage;
