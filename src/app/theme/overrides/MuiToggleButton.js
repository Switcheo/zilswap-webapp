const MuiToggleButton = theme => ({
    root: {
        "&$selected": {
            color: theme.palette.type === "dark" ? "#003340" : "#DEFFFF",
            backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
            "&:hover": {
                backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
            }
        },
    },
    sizeSmall: {
        padding: "5px"
    }
});
  
export default MuiToggleButton;
