import React, { useState } from "react";
import { Box, Button, Popover, makeStyles } from "@material-ui/core";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { Text } from "app/components";
import { hexToRGBA } from "app/utils";
import { MarketPlaceState, RootState } from "app/store/types";
import { SortBy, updateFilter } from "app/store/marketplace/actions";
import { ReactComponent as Checkmark } from "./checkmark.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  button: {
    border: theme.palette.border,
    color: theme.palette.text?.primary,
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
    border: theme.palette.border,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: '100%',
      maxWidth: 260,
      borderRadius: "12px",
      border: theme.palette.border,
      overflow: "hidden",
      marginTop: 8
    },
  },
  popoverContainer: {
    maxHeight: 340,
    padding: "14px 0",
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
  bold: {
    fontWeight: "bold",
  },
  selectModifier: {
    fontSize: 12,
    paddingLeft: 20
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.6
  },
  filterValue: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.text!.primary,
    textTransform: "uppercase",
    flexGrow: 1
  },
  selectedFilterValue: {
    color: theme.palette.primary.dark,
  },
  filterOption: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    padding: "5px 14px",
    color: theme.palette.text!.primary,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255,255,255,0.1)"
    }
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  },
  sortIcon: {
    fill: theme.palette.text!.primary!,
    fillOpacity: 0.5
  },
  sortIconMenu: {
    fill: theme.palette.text!.primary!,
    fillOpacity: 1
  },
  sortIconSelected: {
    fill: theme.palette.primary.dark,
    fillOpacity: 1
  }
}))

const SortFilter = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const [sortBy, setSortBy] = useState<SortBy>(marketPlaceState.filter.sortBy)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChange = (sortBy: SortBy) => {
    setSortBy(sortBy)
    dispatch(updateFilter({ sortBy }))
    handleClose()
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const iconForType = (sortBy: SortBy): React.ReactNode => {
    if (sortBy === SortBy.PriceDescending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.93,13.12H15a1,1,0,0,0,0,2h1V20a1,1,0,0,0,2,0V14.11A1,1,0,0,0,16.93,13.12Z" />
          <path d="M11.18,17.23H9.39V3.66A.44.44,0,0,0,9,3.22H7.83a.44.44,0,0,0-.44.44V17.23H5.6a.49.49,0,0,0-.35.85L8,20.86a.51.51,0,0,0,.71,0l2.78-2.78A.49.49,0,0,0,11.18,17.23Z" />
          <path d="M17.92,3.22H14a1,1,0,0,0-1,1v3a1,1,0,0,0,1,1h2.95v1H14a1,1,0,1,0,0,2h3.94a1,1,0,0,0,1-1V4.2A1,1,0,0,0,17.92,3.22Zm-1,2.95H15v-1h2Z" />
        </svg>
      )
    } else if (sortBy === SortBy.PriceAscending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.22,5.19h1v4.92a1,1,0,0,0,2,0V4.2a1,1,0,0,0-1-1h-2a1,1,0,0,0,0,2Z" />
          <path d="M7.8,20.86a.51.51,0,0,0,.71,0l2.78-2.78a.49.49,0,0,0-.35-.85H9.15V3.66a.45.45,0,0,0-.45-.44H7.59a.44.44,0,0,0-.44.44V17.23H5.36a.49.49,0,0,0-.35.85Z" />
          <path d="M18.16,13.12H14.22a1,1,0,0,0-1,1v2.95a1,1,0,0,0,1,1h3v1h-3a1,1,0,0,0,0,2h3.94a1,1,0,0,0,1-1V14.11A1,1,0,0,0,18.16,13.12Zm-1,3h-2v-1h2Z" />
        </svg>
      )
    } else if (sortBy === SortBy.RarityDescending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.93,18.08l2.79,2.78a.51.51,0,0,0,.71,0l2.78-2.78a.49.49,0,0,0-.35-.85H7.07V3.66a.45.45,0,0,0-.45-.44H5.51a.44.44,0,0,0-.44.44V17.23H3.28A.49.49,0,0,0,2.93,18.08Z" />
          <path d="M20.82,8.23,15.76,5.15a1,1,0,0,0-1,0L9.64,8.23a.79.79,0,0,0-.41.69v6.37a.8.8,0,0,0,.41.7l5.18,3.09a1,1,0,0,0,1,0l5-3.08a.82.82,0,0,0,.41-.69V8.92A.82.82,0,0,0,20.82,8.23Zm-1.37,6.13a.57.57,0,0,1-.29.48L15.65,17a.69.69,0,0,1-.71,0l-3.65-2.17a.58.58,0,0,1-.29-.49V9.86a.56.56,0,0,1,.29-.48l3.59-2.17a.71.71,0,0,1,.72,0l3.56,2.17a.56.56,0,0,1,.29.48Z" />
          <path d="M15.48,8.77a.48.48,0,0,0-.49,0l-2.45,1.48a.37.37,0,0,0-.19.33v3.06a.38.38,0,0,0,.2.33L15,15.45a.48.48,0,0,0,.49,0L17.91,14a.39.39,0,0,0,.19-.33V10.58a.37.37,0,0,0-.19-.33Z" />
        </svg>
      )
    } else if (sortBy === SortBy.RarityAscending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.21,6.14,6.42,3.36a.51.51,0,0,0-.71,0L2.93,6.14A.49.49,0,0,0,3.28,7H5.07V20.56a.44.44,0,0,0,.44.44H6.62a.45.45,0,0,0,.45-.44V7H8.86A.49.49,0,0,0,9.21,6.14Z" />
          <path d="M20.82,8.23,15.76,5.15a1,1,0,0,0-1,0L9.64,8.23a.79.79,0,0,0-.41.69v6.37a.8.8,0,0,0,.41.7l5.18,3.09a1,1,0,0,0,1,0l5-3.08a.82.82,0,0,0,.41-.69V8.92A.82.82,0,0,0,20.82,8.23Zm-1.37,6.13a.57.57,0,0,1-.29.48L15.65,17a.69.69,0,0,1-.71,0l-3.65-2.17a.58.58,0,0,1-.29-.49V9.86a.56.56,0,0,1,.29-.48l3.59-2.17a.71.71,0,0,1,.72,0l3.56,2.17a.56.56,0,0,1,.29.48Z" />
          <path d="M15.48,8.77a.48.48,0,0,0-.49,0l-2.45,1.48a.37.37,0,0,0-.19.33v3.06a.38.38,0,0,0,.2.33L15,15.45a.48.48,0,0,0,.49,0L17.91,14a.39.39,0,0,0,.19-.33V10.58a.37.37,0,0,0-.19-.33Z" />
        </svg>
      )
    } else if (sortBy === SortBy.MostLoved) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3V12C7 12.55 7.45 13 8 13H10V20.15C10 20.66 10.67 20.84 10.93 20.4L16.12 11.5C16.51 10.83 16.03 10 15.26 10H13L15.49 3.35C15.74 2.7 15.26 2 14.56 2H8C7.45 2 7 2.45 7 3Z" />
        </svg>
      )
    } else if (sortBy === SortBy.MostRecent) {
      return (
        <svg width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7069 2.87493C7.82902 2.74076 3.83277 6.66034 3.83277 11.4999H2.11736C1.68611 11.4999 1.47527 12.0174 1.78194 12.3145L4.45569 14.9978C4.64736 15.1895 4.94444 15.1895 5.13611 14.9978L7.80986 12.3145C8.10694 12.0174 7.89611 11.4999 7.46486 11.4999H5.74944C5.74944 7.76243 8.79694 4.74368 12.5536 4.79159C16.1186 4.83951 19.1182 7.83909 19.1661 11.4041C19.214 15.1512 16.1953 18.2083 12.4578 18.2083C10.9149 18.2083 9.48694 17.6812 8.35611 16.7899C7.97277 16.4928 7.43611 16.5216 7.09111 16.8666C6.68861 17.2691 6.71736 17.9495 7.16777 18.2945C8.62444 19.4445 10.4549 20.1249 12.4578 20.1249C17.2974 20.1249 21.2169 16.1287 21.0828 11.2508C20.9582 6.75618 17.2015 2.99951 12.7069 2.87493ZM12.2182 7.66659C11.8253 7.66659 11.4994 7.99243 11.4994 8.38534V11.912C11.4994 12.2474 11.6815 12.5637 11.969 12.7362L14.959 14.5091C15.304 14.7103 15.7449 14.5953 15.9461 14.2599C16.1474 13.9149 16.0324 13.4741 15.6969 13.2728L12.9369 11.6341V8.37576C12.9369 7.99243 12.6111 7.66659 12.2182 7.66659Z" />
        </svg>
      )
    } else if (sortBy === SortBy.MostViewed) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 7C8.09091 7 5.17955 9.07333 4 12C5.17955 14.9267 8.09091 17 11.5 17C14.9091 17 17.8205 14.9267 19 12C17.8205 9.07333 14.9091 7 11.5 7ZM11.5 15.3333C9.61818 15.3333 8.09091 13.84 8.09091 12C8.09091 10.16 9.61818 8.66667 11.5 8.66667C13.3818 8.66667 14.9091 10.16 14.9091 12C14.9091 13.84 13.3818 15.3333 11.5 15.3333ZM11.5 10C10.3682 10 9.45455 10.8933 9.45455 12C9.45455 13.1067 10.3682 14 11.5 14C12.6318 14 13.5455 13.1067 13.5455 12C13.5455 10.8933 12.6318 10 11.5 10Z" />
        </svg>
      )
    }

    return (<></>)
  }

  return (
    <>
      <Button onClick={handleClick} className={cls(classes.button, anchorEl == null ? classes.inactive : classes.active)}>
        <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%" className={cls(classes.sortIconMenu, {
          [classes.sortIconSelected]: anchorEl !== null
        })}>
          {iconForType(sortBy)}
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
          <Box className={classes.filterOption} onClick={() => handleChange(SortBy.PriceDescending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, { [classes.sortIconSelected]: sortBy === SortBy.PriceDescending })}>{iconForType(SortBy.PriceDescending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.PriceDescending
              })}>Price High - Low</Text>
            </Box>
            {sortBy === SortBy.PriceDescending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => handleChange(SortBy.PriceAscending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, { [classes.sortIconSelected]: sortBy === SortBy.PriceAscending })}>{iconForType(SortBy.PriceAscending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.PriceAscending
              })}>Price Low - High</Text>
            </Box>
            {sortBy === SortBy.PriceAscending &&
              <Checkmark />
            }
          </Box>
          {/* <Box className={classes.filterOption} onClick={() => handleChange(SortBy.RarityDescending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.RarityDescending})}>{iconForType(SortBy.RarityDescending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.RarityDescending
              })}>Rarity High - Low</Text>
            </Box>
            {sortBy === SortBy.RarityDescending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => handleChange(SortBy.RarityAscending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.RarityAscending})}>{iconForType(SortBy.RarityAscending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.RarityAscending
              })}>Rarity Low - High</Text>
            </Box>
            {sortBy === SortBy.RarityAscending &&
              <Checkmark />
            }
          </Box> */}
          <Box className={classes.filterOption} onClick={() => handleChange(SortBy.MostRecent)}>
            <Box marginRight={1} className={cls(classes.sortIcon, { [classes.sortIconSelected]: sortBy === SortBy.MostRecent })}>{iconForType(SortBy.MostRecent)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostRecent
              })}>Most Recent</Text>
            </Box>
            {sortBy === SortBy.MostRecent &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => handleChange(SortBy.MostLoved)}>
            <Box marginRight={1} className={cls(classes.sortIcon, { [classes.sortIconSelected]: sortBy === SortBy.MostLoved })}>{iconForType(SortBy.MostLoved)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostLoved
              })}>Most Loved</Text>
            </Box>
            {sortBy === SortBy.MostLoved &&
              <Checkmark />
            }
          </Box>
          {/* <Box className={classes.filterOption} onClick={() => handleChange(SortBy.MostViewed)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.MostViewed})}>{iconForType(SortBy.MostViewed)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostViewed
              })}>Most Viewed</Text>
            </Box>
            {sortBy === SortBy.MostViewed &&
              <Checkmark />
            }
          </Box> */}
        </Box>
      </Popover>
    </>
  )
}

export default SortFilter
