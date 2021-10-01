import React, { useState } from "react";
import { Box, Button, makeStyles, Popover } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import { Text } from "app/components";
import { ReactComponent as SortIcon } from "./sort.svg";
import { hexToRGBA } from "app/utils";
import cls from "classnames";

const useStyles = makeStyles((theme: AppTheme) =>({
  button: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: "#29475A",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyItems: "center",
    position: "relative",
    marginLeft: 10
  },
  inactive: {
    borderRadius: "12px"
  },
  active: {
    borderColor: theme.palette.primary.dark,
    borderStyle: "solid",
    borderWidth: 1,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: '100%',
      maxWidth: 260,
      borderRadius: "12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
      overflow: "hidden",
      marginTop: 8
    },
  },
  popoverContainer: {
    maxHeight: 340,
    overflowY: "scroll",
    padding: "16px 24px",
    "&::-webkit-scrollbar": {
      width: "0.4rem"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
      borderRadius: 12
    },
  },
  itemHeader: {
    color: theme.palette.label
  },
  radioButton: {
    padding: "3px 0px",
    marginTop: -2,
    marginRight: 6,
    "&:hover": {
      background: "transparent!important",
    },
  },
  bold: {
    fontWeight: "bold",
  },
  selectModifier: {
    fontSize: 12,
    paddingLeft: 20
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.5
  },
  filterValue: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "white" : "black",
    textTransform: "uppercase"
  },
  filterOption: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    padding: "8px 0",
    color: theme.palette.type === "dark" ? "white" : "",
    display: "flex",
    alignItems: "center"
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  }
}))

const SortFilter = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button onClick={handleClick} className={anchorEl === null ? cls(classes.button, classes.inactive) : cls(classes.button, classes.active)}>
        <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
          <SortIcon />
        </Box>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className={classes.popover}
      >
        <Box paddingX="24px" className={classes.popoverContainer}>
          <Box className={classes.filterOption}>
            <Text className={classes.filterValue}>Price High - Low</Text>
          </Box>
          <Box className={classes.filterOption}>
            <Text className={classes.filterValue}>Price Low - High</Text>
          </Box>
          <Box className={classes.filterOption}>
            <Text className={classes.filterValue}>Rarity</Text>
          </Box>
          <Box className={classes.filterOption}>
            <Text className={classes.filterValue}>Most Loved</Text>
          </Box>
          <Box className={classes.filterOption}>
            <Text className={classes.filterValue}>Most Viewed</Text>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default SortFilter