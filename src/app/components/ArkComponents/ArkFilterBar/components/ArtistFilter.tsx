import React, { Fragment, useState } from 'react';
import BigNumber from 'bignumber.js';
import cls from "classnames";
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, ClickAwayListener, Container, makeStyles, Popover, Typography } from '@material-ui/core';
import { ArkImageView } from "app/components";
import { getMarketplace } from 'app/saga/selectors';
import { updateFilter } from 'app/store/marketplace/actions';
import { AppTheme } from 'app/theme/types';
import { hexToRGBA } from "app/utils";

const useStyles = makeStyles((theme: AppTheme) => ({
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    border: theme.palette.border,
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
    transform: "translateY(8px)",
  },
  popoverContainer: {
    paddingLeft: "5px",
    paddingBottom: "5px",
    backgroundColor: theme.palette.type === "dark" ? "#223139" : "#D4FFF2",
    width: 500,
    borderRadius: 12,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    padding: 0,
    maxHeight: 600,
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      width: "0.4rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
      borderRadius: 12
    },
    // [theme.breakpoints.down("md")]: {
    //   width: 'calc(100vw - 128px)',
    //   maxHeight: 400,
    // },
    // [theme.breakpoints.down("xs")]: {
    //   width: '100%',
    //   maxHeight: 300,
    // }
  },
  searchResultHeader: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    opacity: 0.5,
    textTransform: 'uppercase',
    padding: '20px 24px 6px 24px',
    fontWeight: 900,
    fontFamily: "'Raleway', sans-serif",
    [theme.breakpoints.down('sm')]: {
      padding: '14px 18px 4px 18px',
    },
  },
  searchResultAvatar: {
    height: 30,
    marginRight: 8,
    width: 30,
    [theme.breakpoints.down('md')]: {
      height: 20,
      width: 20,
    }
  },
  artistName: {
    display: "flex",
  },
  halfOpacity: {
    opacity: 0.5
  },
  emptyRow: {
    padding: '12px 24px',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    borderRadius: 12,
    fontWeight: 700,
    [theme.breakpoints.down('sm')]: {
      width: '92vw',
      padding: '10px 18px',
    },
    opacity: 0.5,
  },
  popoverRow: {
    padding: '12px 24px',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    borderRadius: 12,
    fontWeight: 700,
    [theme.breakpoints.down('sm')]: {
      width: '92vw',
      padding: '10px 18px',
    },
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#4E5A60" : "#A9CCC1",
    },
  },
  resultCollectionName: {
    fontFamily: 'Avenir Next',
    fontSize: 18,
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
    },
    fontWeight: 700,
  },
  itemBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      alignItems: "flex-start",
      flexDirection: "column",
    }
  },
  button: {
    border: theme.palette.border,
    color: theme.palette.text?.primary,
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
    border: theme.palette.border,
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: '22px',
    marginTop: -6,
  },
  label: {
    fontSize: 16,
    marginTop: 2,
    marginLeft: 6,
    fontWeight: 700,
    paddingLeft: "8px",
    "&.MuiFormLabel-root.Mui-focused": {
      color: theme.palette.text?.secondary
    }
  },
  filterValue: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.text!.primary,
    "& .MuiFormControlLabel-label": {
      fontSize: 16,
      fontWeight: 'bolder',
      fontFamily: 'Avenir Next',
    }
  },
  endAdor: {
    cursor: "pointer",
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      borderRadius: "12px",
      border: theme.palette.border,
      overflow: "hidden",
      marginTop: 8
    },
  },
}))


interface Props {
  collectionAddress: string;
}
const ArtistFilter = (props: Props) => {
  const { collectionAddress } = props;

  const dispatch = useDispatch();
  const classes = useStyles();
  const { collections, filter } = useSelector(getMarketplace);
  const [search, setSearch] = useState<string>(filter.search)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const collection = collections[collectionAddress];
  const artists = collection?.artists || {};
  const [showPopper, setShowPopper] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!anchorEl) setAnchorEl(event.currentTarget);
    setShowPopper(!showPopper);
  };


  // const onSearchChange = (search: string) => {
  //   setSearch(search);
  //   if (!!search)
  //     setShowPopper(true)
  //   if (!search) {
  //     delete filter?.artist
  //     dispatch(updateFilter(filter));
  //   }
  // }

  const handleSelect = (text: string) => {
    setSearch(text);
    setShowPopper(false);

    dispatch(updateFilter({ artist: text }));
  }

  const sortByName = (cur: string, next: string) => {
    let a = cur.trim().replaceAll(/^"|"$/g, "");
    let b = next.trim().replaceAll(/^"|"$/g, "");
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  const sortedArtist = Object.entries(artists).sort(([key, value], [key2, value2]) => sortByName(key, key2))

  return (
    <ClickAwayListener onClickAway={() => { setShowPopper(false) }}>
      <>
        <Button fullWidth onClick={handleClick} className={cls(classes.button, anchorEl == null ? classes.inactive : classes.active)}>
          <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start">
            <div className={classes.filterLabel}>Artist</div>
            <div className={classes.filterValue}>
              {!!search ? search : "Select Artist"}
            </div>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2016 13.1737L14.2879 16.0874C13.8491 16.5262 13.1404 16.5262 12.7016 16.0874L9.78787 13.1737C9.07912 12.4649 9.58537 11.2499 10.5866 11.2499L16.4141 11.2499C17.4154 11.2499 17.9104 12.4649 17.2016 13.1737Z" fill="#DEFFFF" /></svg>
          </Box>
        </Button>
        {/* <FormControl>
          <InputLabel className={classes.label} variant="filled" shrink={true}>Artist</InputLabel>
          <OutlinedInput
            placeholder="Search by Artist"
            value={search}
            label="Artist"
            fullWidth
            classes={{ input: classes.inputText }}
            className={classes.input}
            onChange={(e) => onSearchChange(e.target.value)}
            endAdornment={
              <Box onClick={handleClick} className={classes.endAdor} display="flex" alignItems="center" justifyContent="center">
                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2016 13.1737L14.2879 16.0874C13.8491 16.5262 13.1404 16.5262 12.7016 16.0874L9.78787 13.1737C9.07912 12.4649 9.58537 11.2499 10.5866 11.2499L16.4141 11.2499C17.4154 11.2499 17.9104 12.4649 17.2016 13.1737Z" fill="#DEFFFF" /></svg>
              </Box>
            }
          />
        </FormControl> */}
        <Popover
          open={showPopper}
          anchorEl={anchorEl}
          onClose={() => setShowPopper(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          className={classes.popover}
        >
          <Container maxWidth="xs" className={classes.popoverContainer}>
            {(!artists || !Object.keys(artists).length) && (
              <Box>
                <Typography>No Artist available</Typography>
              </Box>
            )}
            {artists && <Fragment>
              <Typography className={classes.searchResultHeader}>Artists</Typography>
              {sortedArtist.map(([key, value]) => (
                <Box onClick={() => handleSelect(key)} className={classes.popoverRow} display="flex" justifyContent="space-between" alignItems="center" key={key}>
                  <Box className={classes.resultCollectionName} display="flex" alignItems="center">
                    <ArkImageView
                      imageType="avatar"
                      className={classes.searchResultAvatar}
                      imageUrl={collection.profileImageUrl}
                    />
                    <Box className={classes.itemBox}>
                      <Box display="flex" alignItems="center" marginRight={1}>
                        {key}
                      </Box>
                    </Box>
                  </Box>
                  <Typography>{new BigNumber(value).toFormat(0)} Art</Typography>
                </Box>
              ))}
            </Fragment>}
          </Container>
        </Popover>
      </>
    </ClickAwayListener>
  )
}

export default ArtistFilter
