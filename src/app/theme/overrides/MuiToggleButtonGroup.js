const MuiToggleButtonGroup = theme => ({
    groupedHorizontal: {
        '&:not(:first-child)': {
            borderTopLeftRadius: "5px",
            borderBottomLeftRadius: "5px",
        },
        '&:not(:last-child)': {
            borderTopRightRadius: "5px",
            borderBottomRightRadius: "5px",
        },
    }
});
  
export default MuiToggleButtonGroup;