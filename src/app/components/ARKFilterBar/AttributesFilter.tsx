import { Box, Button, makeStyles, Popover, Radio } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import { hexToRGBA } from 'app/utils';
import React, { useState } from 'react';
import cls from "classnames";
import { Text } from "app/components";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";

const useStyles = makeStyles((theme: AppTheme) =>({
  button: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: "#29475A",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "10px 24px",
    borderRadius: "12px 12px",
    display: "flex",
    alignItems: "center",
  },
  inactive: {
    borderRadius: "12px"
  },
  active: {
    borderColor: "#26D4FF",
    borderStyle: "solid",
    borderWidth: 1,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: 500,
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
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 8,
    marginRight: 8,
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
    padding: 0,
    marginTop: -3,
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
    color: theme.palette.type === "dark" ? "white" : "",
  },
  filterValueSubText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2
  },
  filterOption: {
    paddingTop: 5,
    paddingBottom: 5,
    display: "flex",
    alignItems: "flex-start"
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  },
  filterSelectButton: {
    background: "none",
    outline: "none",
    border: "none",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 12,
    opacity: 0.5,
    fontWeight: "bold"
  }
}))

const AttributesFilter = () => {
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
        <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start">
          <div className={classes.filterLabel}>Attributes</div>
          <div className={classes.filterValue}>ALL</div>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2016 13.1737L14.2879 16.0874C13.8491 16.5262 13.1404 16.5262 12.7016 16.0874L9.78787 13.1737C9.07912 12.4649 9.58537 11.2499 10.5866 11.2499L16.4141 11.2499C17.4154 11.2499 17.9104 12.4649 17.2016 13.1737Z" fill="#DEFFFF"/></svg>
        </Box>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.popover}
      >
        <Box paddingX="24px" className={classes.popoverContainer}>
          <Box display="flex">
            <Box marginRight={4}>
              <Text className={classes.filterValue}>CATEGORIES</Text>
              <Box display="flex" paddingY={1}>
                <Box flexGrow="1">
                  <button className={classes.filterSelectButton}>Select All</button>
                </Box>
                <button className={classes.filterSelectButton}>Reset Filter</button>
              </Box>

              <Box className={classes.filterOption}>
                <Radio
                  className={classes.radioButton}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  disableRipple
                />
                <Box>
                  <Text className={classes.filterValue}>BACKGROUND</Text>
                  <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                </Box>
              </Box>
              <Box className={classes.filterOption}>
                <Radio
                  className={classes.radioButton}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  disableRipple
                />
                <Box>
                  <Text className={classes.filterValue}>BASE</Text>
                  <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                </Box>
              </Box>
              <Box className={classes.filterOption}>
                <Radio
                  className={classes.radioButton}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  disableRipple
                />
                <Box>
                  <Text className={classes.filterValue}>BODY</Text>
                  <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                </Box>
              </Box>
              <Box className={classes.filterOption}>
                <Radio
                  className={classes.radioButton}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  disableRipple
                />
                <Box>
                  <Text className={classes.filterValue}>EYES</Text>
                  <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                </Box>
              </Box>
              <Box className={classes.filterOption}>
                <Radio
                  className={classes.radioButton}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  disableRipple
                />
                <Box>
                  <Text className={classes.filterValue}>HEAD</Text>
                  <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                </Box>
              </Box>
            </Box>
            <Box flexGrow="1">
              <Box display="flex" marginBottom={1}>
                <Text flexGrow="1">Basic</Text>
                <Text>(24)</Text>
              </Box>
              <Box display="flex" marginBottom={1}>
                <Text flexGrow="1">Panda</Text>
                <Text>(24)</Text>
              </Box>
              <Box display="flex" marginBottom={1}>
                <Text flexGrow="1">Polar</Text>
                <Text>(24)</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default AttributesFilter