const MuiDialogContent = theme => ({
  root: {
    padding: theme.spacing(4.5, 8),
    overflowY: "hidden",
    "&+$root": {
      paddingTop: theme.spacing(1),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
});

export default MuiDialogContent;
