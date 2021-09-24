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
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    position: "relative"
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
      width: '100%',
      maxWidth: 300,
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
    paddingTop: 2,
    paddingBottom: 6,
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
  },
  filterOption: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    paddingTop: 2,
    paddingBottom: 2,
    color: theme.palette.type === "dark" ? "white" : "",
    display: "flex",
    alignItems: "center"
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  }
}))

interface Props {
  label: string
  currentValue: string
  options: any[]
}

const TextFilter = (props: Props) => {
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
          <div className={classes.filterLabel}>{props.label}</div>
          <div className={classes.filterValue}>{props.currentValue}</div>
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
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className={classes.popover}
      >
        <Box paddingX="24px" className={classes.popoverContainer}>
          {props.options.map(option => (
            <Box className={classes.filterOption}>
              <Radio
                className={classes.radioButton}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                disableRipple
              />
              <Text className={classes.filterValue}>{option.value} {option.detail && <span className={classes.filterOptionDetail}>{option.detail}</span>}</Text>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  )
}

export default TextFilter