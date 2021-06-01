const MuiAccordionSummary = theme => ({
  root: {
    borderRadius: "12px",
    '&$expanded': {
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
});

export default MuiAccordionSummary;