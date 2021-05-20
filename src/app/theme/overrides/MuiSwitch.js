import { fade } from "@material-ui/core/styles/colorManipulator";

const MuiSwitch = theme => ({
  root: {
    width: 34 + 12 * 2,
    height: 14 + 12 * 2,
    overflow: "hidden",
    padding: 10,
  },
  switchBase: {
    color: theme.palette.primary.main,
  },
  thumb: {
    boxShadow: "none",
  },
  track: {
    backgroundColor: theme.palette.primary.light,
    opacity: 1,
    borderRadius: 42,
  },
  colorSecondary: {
    "&$checked": {
      color: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: (0, fade)(theme.palette.primary.main, theme.palette.action.hoverOpacity),
        "@media (hover: none)": {
          backgroundColor: "transparent"
        }
      }
    },
    "&$disabled": {
      color: theme.palette.primary.main,
      opacity: 0.2,
    },
    "&$checked + $track": {
      backgroundColor: "#295154",
    },
    "&$disabled + $track": {
      backgroundColor: theme.palette.primary.light,
      opacity: 0.2,
    }
  },
});

export default MuiSwitch;
