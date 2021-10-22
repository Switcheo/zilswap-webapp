const MuiDrawer = theme => ({
  paper: {
    backgroundColor: theme.palette.navbar,
  },
  paperAnchorDockedLeft: {
    borderRight: theme.palette.type === 'dark' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '3px 0 3px -2px rgba(0, 0, 0, 0.2)',
  }
});

export default MuiDrawer;
