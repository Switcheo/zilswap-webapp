import { hexToRGBA } from "app/utils";

const MuiOutlinedInput = theme => ({
  root: {
    border: `1px solid rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`,
    borderRadius: "12px",
    "& input": {
      fontFamily: "Roboto",
      fontWeight: 500,
      fontSize: 20,
      padding: "14.5px 14px",
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
