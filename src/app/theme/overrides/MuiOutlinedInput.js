import { hexToRGBA } from "app/utils";

const MuiOutlinedInput = theme => ({
  root: {
    border: `1px solid rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`,
    borderRadius: "12px",
    "& input": {
      fontFamily: "Avenir Next",
      fontWeight: "bold",
      fontSize: 26,
      padding: "34px 18px 12px",
      [theme.breakpoints.down("md")]: {
        fontSize: 22,
        padding: "32px 18px 10px",
      },
      // remove number spinner
      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
      '&:[type=number]': {
        "-moz-appearance": "textfield",
      },
    },
  },
  adornedEnd: {
    paddingRight: 0
  },
  notchedOutline: {
    border: "none"
  },
});

export default MuiOutlinedInput;
