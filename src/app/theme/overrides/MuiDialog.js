const MuiDialog = theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
    borderRadius: 4,
  },
  paper: {
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(4, 2),
    },
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(4, 1),
    },
  },
  paperFullWidth: {
    [theme.breakpoints.down("sm")]: {
      width: `calc(100% - ${theme.spacing(4)}px)`,
    },
    [theme.breakpoints.down("xs")]: {
      width: `calc(100% - ${theme.spacing(2)}px)`,
    },
  }
});

export default MuiDialog;
