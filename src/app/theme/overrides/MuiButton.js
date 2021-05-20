const MuiButton = theme => ({
  root: {
    borderRadius: "4242px",
    textTransform: "none",
    color: theme.palette.button.primary,

    [theme.breakpoints.down("xs")]: {
      "& .MuiTypography-root.MuiTypography-button": {
        fontSize: "14px",
        lineHeight: "16px",
      },
    },
  },
  contained: {
    borderRadius: "12px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
    "&$disabled": {
      color: "#FFFFFF",
      opacity: .2,
      backgroundColor: `${theme.palette.primary.light}`
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
  outlinedSizeSmall: {
    padding: "2px 4px",
  }
});

export default MuiButton;
