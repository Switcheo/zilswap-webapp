import { hexToRGBA } from "app/utils";

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
  containedPrimary: {
    color: theme.palette.type === "dark" ? "#003340" : "#DEFFFF",
    backgroundColor: theme.palette.type === "dark" ? "#6BE1FF" : "#003340",
    '&:hover': {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#6BE1FF", 0.8)}` : `rgba${hexToRGBA("#003340", 0.8)}`,
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
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.palette.tab.active,
      },
    },
  },
  outlinedSecondary: {
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    }
  },
});

export default MuiButton;
