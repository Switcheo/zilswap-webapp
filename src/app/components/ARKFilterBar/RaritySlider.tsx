import React from "react";
import { Box, makeStyles } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import { Text } from "app/components";

const useStyles = makeStyles((theme: AppTheme) =>({
  root: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: "#29475A",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "10px 24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    opacity: 0.5
  }
}))

const RaritySlider = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Text className={classes.label}>Rarity</Text>
    </Box>
  )
}

export default RaritySlider