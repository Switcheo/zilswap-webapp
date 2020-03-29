export default theme => ({
  root: {
    borderRadius: "4242px",
    textTransform: "none",
    color: theme.palette.primary.main,
  },
  contained: {
    borderRadius: "4px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
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
