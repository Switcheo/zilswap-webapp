const MuiDialogTitle = theme => ({
  root: {
    padding: theme.spacing(4.5, 8),
    paddingBottom: 0,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
});

export default MuiDialogTitle;
