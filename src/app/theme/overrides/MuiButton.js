const MuiButton = theme => ({
  root: {
    borderRadius: "4242px",
    textTransform: "none",
    color: theme.palette.button.primary,

    [theme.breakpoints.down("md")]: {
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
      color: theme.palette.action.disabled,
      backgroundColor: theme.palette.action.disabledBackground
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
  },
  containedSecondary: {
    backgroundColor: theme.palette.tab.active,
    color: theme.palette.tab.selected,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    },
  },
  outlinedSecondary: {
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected
    }
  },
});

export default MuiButton;
