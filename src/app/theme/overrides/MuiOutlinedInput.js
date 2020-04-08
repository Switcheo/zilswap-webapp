import { hexToRGBA } from "app/utils";

export default theme => ({
  root: {
    border: `1px solid rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  notchedOutline: {
    border: "none"
  }
});
