import { Box, Button, makeStyles, OutlinedInput, Popover, Radio } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';
import { hexToRGBA } from 'app/utils';
import React, { useState, useEffect } from 'react';
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
    gridColumn: "span 2 / span 2"
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
      width: 605,
      borderRadius: "12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
      overflow: "hidden",
      marginTop: 8
    },
  },
  popoverContainer: {
    maxHeight: 380,
    overflowY: "hidden",
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 8,
    marginRight: 8,
  },
  categories: {
    paddingRight: 16,
    marginRight: 16,
    width: 210,
    maxHeight: 352,
    borderStyle: 'solid',
    borderWidth: '0px 1px 0px 0px',
    borderColor: "rgba(222, 255, 255, 0.1)",
  },
  scrollableTraits: {
    overflowY: "scroll",
    maxHeight: 314,
    paddingRight: 10,
    paddingTop: 10,
    marginTop: 6,
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
  filterCategoryLabel: {
    fontSize: 18,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "white" : "",
    textTransform: "uppercase"
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
    paddingTop: 6,
    paddingBottom: 6,
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
  },
  attributeIcon: {
    display: "inline-block",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "gray",
    marginRight: 10
  },
  attributeLabel: {
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 13,
  },
  attributeMeta: {
    width: 60,
    textAlign: "right",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "right"
  },
  attributeMetaDetail: {
    fontSize: 11,
    opacity: 0.5,
    marginLeft: 2
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    borderColor: "rgba(222, 255, 255, 0.1)",
  },
  inputText: {
    fontSize: "14px!important",
    padding: "14px 14px!important",
  },
}))

interface Props {
  collectionAddress: any
}

const AttributesFilter = (props: Props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [traits, setTraits] = useState<any[]>([])
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if(!props.collectionAddress && traits.length === 0) return
    getTraits()
    // eslint-disable-next-line
  }, [props.collectionAddress])

  const getTraits = async () => {
    const response = await fetch(
      `https://api-ark.zilswap.org/nft/collection/${props.collectionAddress}/traits`
    );
    const data = await response.json();
    setTraits(data.result.models)
  }

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
            <Box className={classes.categories}>
              <Text className={classes.filterValue}>CATEGORIES</Text>
              <Box display="flex" paddingY={1}>
                <Box flexGrow="1">
                  <button className={classes.filterSelectButton}>Select All</button>
                </Box>
                <button className={classes.filterSelectButton}>Reset Filter</button>
              </Box>

              {traits.map(trait => (
                <Box className={classes.filterOption}>
                  <Radio
                    className={classes.radioButton}
                    checkedIcon={<CheckedIcon />}
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    disableRipple
                  />
                  <Box>
                    <Text className={classes.filterCategoryLabel}>{trait.trait}</Text>
                    <Text className={classes.filterValueSubText}>2 of 10 selected</Text>
                  </Box>
                </Box>
              ))}

            </Box>
            <Box flexGrow="1">
              <OutlinedInput
                placeholder="Enter an attribute..."
                value={search}
                fullWidth
                classes={{ input: classes.inputText }}
                className={classes.input}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Box className={classes.scrollableTraits}>
                {traits.map(trait => (
                  <Box marginBottom={3}>
                    <Box display="flex" marginBottom={1}>
                      <Radio
                        className={classes.radioButton}
                        checkedIcon={<CheckedIcon />}
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        disableRipple
                      />
                      <Text flexGrow="1" className={classes.filterCategoryLabel}>{trait.trait}</Text>
                      <Text className={classes.attributeMeta}>Att. Rarity</Text>
                      <Text className={classes.attributeMeta}>Match</Text>
                    </Box>
                    {Object.keys(trait.values).map((value: string) => (
                      <Box display="flex" alignItems="center" marginBottom={1} marginLeft={3}>
                        <Radio
                          className={classes.radioButton}
                          checkedIcon={<CheckedIcon />}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          disableRipple
                        />
                        <Box className={classes.attributeIcon}></Box>
                        <Text className={classes.attributeLabel} flexGrow="1">{value}</Text>
                        <Text className={classes.attributeMeta}>2.5K <Text className={classes.attributeMetaDetail}>10%</Text></Text>
                        <Text className={classes.attributeMeta}>{trait.values[value]} <Text className={classes.attributeMetaDetail}>(5%)</Text></Text>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default AttributesFilter