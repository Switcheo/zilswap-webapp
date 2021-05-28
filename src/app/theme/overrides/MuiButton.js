import { hexToRGBA } from "app/utils";

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
  containedPrimary: {
    color: "#003340",
    backgroundColor: "#6BE1FF",
    '&:hover': {
      backgroundColor: `rgba${hexToRGBA("#6BE1FF", 0.8)}`,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.palette.primary.main,
      },
    },
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
