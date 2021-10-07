import { Box, Button, Checkbox, FormControlLabel, makeStyles, Popover } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import { hexToRGBA } from 'app/utils';
import React, { useState, useEffect } from 'react';
import cls from "classnames";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { useDispatch, useSelector } from 'react-redux';
import { MarketPlaceState, RootState, SaleType } from 'app/store/types';
import { updateFilter } from 'app/store/marketplace/actions';

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
    borderColor: theme.palette.primary.dark,
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
    paddingTop: 6,
    paddingBottom: 10,
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
    "& .MuiFormControlLabel-label": {
      fontSize: 16,
      fontWeight: 'bolder',
      fontFamily: 'Avenir Next',
    }
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

const SaleTypeFilter = () => {
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const dispatch = useDispatch();

  const [saleType, setSaleType] = useState<SaleType>(marketPlaceState.filter.sale_type)

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.value === "fixed_price") {
      setSaleType({
        ...saleType,
        fixed_price: !saleType.fixed_price
      })
    } else {
      setSaleType({
        ...saleType,
        timed_auction: !saleType.timed_auction
      })
    }
  }

  useEffect(() => {
    console.log("sale type changed")
    dispatch(updateFilter({
      ...marketPlaceState.filter,
      sale_type: saleType
    }))
    // eslint-disable-next-line
  }, [saleType])

  return (
    <>
      <Button onClick={handleClick} className={anchorEl === null ? cls(classes.button, classes.inactive) : cls(classes.button, classes.active)}>
        <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start">
          <div className={classes.filterLabel}>Sale Type</div>
          <div className={classes.filterValue}>
            {Object.values(saleType).filter(value => value === false).length === 0 ? (
              <>ALL</>
            ) : (
              <>
                {saleType.fixed_price &&
                  <>FIXED PRICE</>
                }

                {saleType.timed_auction &&
                  <>TIMED AUCTION</>
                }
              </>
            )}
          </div>
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
          <Box className={classes.filterOption}>
            <FormControlLabel className={classes.filterValue} value="fixed_price" control={<Checkbox
                className={classes.radioButton}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checked={saleType.fixed_price}
                onChange={handleChange}
                disableRipple
              />} label="FIXED PRICE" />
          </Box>
          <Box className={classes.filterOption}>
            <FormControlLabel className={classes.filterValue} value="timed_auction" control={<Checkbox
              className={classes.radioButton}
              checkedIcon={<CheckedIcon />}
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checked={saleType.timed_auction}
              onChange={handleChange}
              disableRipple
            />} label="TIMED AUCTION" />
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default SaleTypeFilter