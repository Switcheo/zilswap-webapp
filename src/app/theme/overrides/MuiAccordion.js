const MuiAccordion = theme => ({
  root: {
    backgroundColor: "rgba(222, 255, 255, 0.1)",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
    position: "",
    margin: 0,
    '&  $lastChild': {
      borderBottomRightRadius: "12px",
      borderBottomLeftRadius: "12px",
    }
  },
  rounded: {
    borderRadius: "12px!important",
  }
});

export default MuiAccordion;