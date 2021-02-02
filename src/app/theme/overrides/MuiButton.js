export default theme => ({
  root: {
    borderRadius: "4242px",
    textTransform: "none",
    color: theme.palette.primary.main,

    [theme.breakpoints.down("xs")]: {
      "& .MuiTypography-root.MuiTypography-button": {
        fontSize: "14px",
        lineHeight: "16px",
      },
    },
  },
  contained: {
    borderRadius: "4px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
    "&$disabled": {
      color: "#FFFFFF",
      opacity: .2,
      backgroundColor: `${theme.palette.primary.main}`
    },
  },
  text: {
    padding: theme.spacing(.5, 2),
  },
  outlined: {
    border: `1px solid ${theme.palette.primary.main}`,
    '&$disabled': {
      border: `1px solid ${theme.palette.primary.main}`,
      opacity: .2,
    }
  },
});
