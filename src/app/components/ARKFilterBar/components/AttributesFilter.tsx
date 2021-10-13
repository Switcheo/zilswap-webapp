import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, OutlinedInput, Popover, makeStyles } from '@material-ui/core';
import cls from "classnames";
import { useDispatch, useSelector } from 'react-redux';
import pickBy from "lodash/pickBy";
import { ArkClient } from 'core/utilities';
import { AppTheme } from 'app/theme/types';
import { hexToRGBA } from 'app/utils';
import { Text } from "app/components";
import { MarketPlaceState, RootState, TraitType, TraitValue } from 'app/store/types';
import { updateFilter } from 'app/store/marketplace/actions';
import { getBlockchain } from 'app/saga/selectors';
import { ReactComponent as IndeterminateIcon } from "./indeterminate.svg";
import { ReactComponent as UncheckedIcon } from "./unchecked.svg";
import { ReactComponent as CheckedIcon } from "./checked.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
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
    marginTop: 10,
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
  filterCategory: {
    display: "flex",
    marginBottom: 8,
  },
  filterCategoryButton: {
    display: "block",
    marginBottom: 12
  },
  filterCategoryLabel: {
    fontSize: 18,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "white" : "",
    textTransform: "uppercase",
    textAlign: "left"
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.5
  },
  filterValue: {
    height: 18,
    fontSize: 16,
    overflow: "hidden",
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "white" : "",
  },
  filterValueSubText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
    textAlign: "left"
  },
  filterSelectedValue: {
    display: "flex",
    alignItems: "start",
    justifyContent: "start"
  },
  filterSelectedValueCategory: {
    display: "inline-block",
    marginRight: 4,
  },
  filterSelectedValueValue: {
    display: "inline-block",
    marginRight: 2,
    opacity: 0.5,
    "&:not(:last-child)": {
      "&:after": {
        content: '", "'
      }
    }
  },
  filterSelectedValueContainer: {
    textAlign: "left",
    "&:not(:first-child)": {
      marginLeft: 4
    }
  },
  filterOption: {
    paddingTop: 6,
    paddingBottom: 6,
    display: "flex",
    alignItems: "flex-start",
    background: "none",
    border: "none",
    outline: "none",
    cursor: "pointer",
    width: "100%",
    margin: 0,
    "& .MuiFormControlLabel-label": {
      flexGrow: 1,
    }
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
    fontWeight: "bold",
    cursor: "pointer"
  },
  attributeIcon: {
    display: "inline-block",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "gray",
    marginRight: 10,
    flexGrow: 0,
    flexShrink: 0
  },
  attribute: {
    display: "flex",
    alignContent: "center"
  },
  attributeLabel: {
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 13,
  },
  attributeValue: {
    width: "100%",
    display: "inline-flex",
    margin: 0,
    "& .MuiFormControlLabel-label": {
      flexGrow: 1,
    }
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
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const { network } = useSelector(getBlockchain);
  const dispatch = useDispatch();

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [traits, setTraits] = useState<{[id: string]: TraitType}>({})
  const [filteredTraits, setFilteredTraits] = useState<{[id: string]: TraitType}>({})
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!props.collectionAddress && Object.keys(traits).length === 0) return
    getTraits()
    // eslint-disable-next-line
  }, [props.collectionAddress])

  const getTraits = async () => {
    const arkClient = new ArkClient(network);
    const data = await arkClient.getCollectionTraits(props.collectionAddress);

    var newTraits: { [id: string]: TraitType } = {}
    data.result.entries.forEach((model: any) => {
      var values: { [id: string]: TraitValue } = {}

      Object.keys(model.values).forEach(value => {
        values[value] = {
          value: value,
          count: +model.values[value],
          selected: false
        };
      });

      newTraits[model.trait] = {
        trait: model.trait,
        values: values
      }
    });

    setTraits(newTraits)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (trait: string, value: string) => {
    setTraits(prevTraits => ({
      ...prevTraits,
      [trait]: {
        ...prevTraits[trait],
        values: {
          ...prevTraits[trait].values,
          [value]: {
            ...prevTraits[trait].values[value],
            selected: !prevTraits[trait].values[value].selected
          }
        }
      }
    }))
  }

  const reset = () => {
    setTraits(prevTraits => {
      Object.values(prevTraits).forEach(trait => {
        Object.values(prevTraits[trait.trait].values).forEach(value => {
          prevTraits[trait.trait].values[value.value].selected = false
        })
      })
      return ({
        ...prevTraits,
      })
    }
    )
  }

  useEffect(() => {
    dispatch(updateFilter({
      ...marketPlaceState.filter,
      traits: traits
    }))
    // eslint-disable-next-line
  }, [traits])

  useEffect(() => {
    // Check for empty search case
    if(search === "") {
      setFilteredTraits(traits)
      return
    }

    var updatedTraits: {[id: string]: TraitType} = {...traits}
    Object.keys(updatedTraits).forEach(trait => {
      updatedTraits[trait] = traits[trait]

      const result = pickBy(updatedTraits[trait].values, function(value, key) {
        return value.value.toLowerCase().includes(search.toLowerCase())
      })
      
      updatedTraits[trait].values = result
    })
  
    setFilteredTraits(updatedTraits)
  }, [search, traits])

  const selectedValues = useMemo(() => {
    var totalSelectCount = 0
    return (
      <>
        <div className={classes.filterSelectedValue}>
          {Object.values(traits).map(trait => {
            const result = pickBy(traits[trait.trait].values, function(value, key) {
              return value.selected
            })
            const selectedCount = Object.keys(result).length
            totalSelectCount += selectedCount
            return (
              <span key={trait.trait} className={classes.filterSelectedValueContainer}>
                {selectedCount > 0 &&
                  <>
                    <span className={classes.filterSelectedValueCategory}>{trait.trait}:</span>
                    <span>
                      {Object.values(result).map(value => (
                        <span className={classes.filterSelectedValueValue}>{value.value}</span>
                      ))}
                    </span>
                  </>
                }
              </span>
            )
          })}
        </div>

        {totalSelectCount === 0 &&
          <span>ALL</span>
        }
      </>
    )
    // eslint-disable-next-line
  }, [traits])

  return (
    <>
      <Button onClick={handleClick} className={anchorEl === null ? cls(classes.button, classes.inactive) : cls(classes.button, classes.active)}>
        <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start">
          <div className={classes.filterLabel}>Attributes</div>
          <div className={classes.filterValue}>{selectedValues}</div>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2016 13.1737L14.2879 16.0874C13.8491 16.5262 13.1404 16.5262 12.7016 16.0874L9.78787 13.1737C9.07912 12.4649 9.58537 11.2499 10.5866 11.2499L16.4141 11.2499C17.4154 11.2499 17.9104 12.4649 17.2016 13.1737Z" fill="#DEFFFF" /></svg>
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
        keepMounted={true}
      >
        <Box paddingX="24px" className={classes.popoverContainer}>
          <Box display="flex">
            <Box className={classes.categories}>
              <Text className={classes.filterCategoryLabel}>CATEGORIES</Text>
              <Box display="flex" paddingY={1} marginBottom={1}
              >
                <button className={classes.filterSelectButton} onClick={() => reset()}>Reset Filter</button>
              </Box>

              {Object.values(filteredTraits).map(trait => {
                const values = Object.values(trait.values)
                const selectedCount = values.filter(value => value.selected).length
                return (
                  <a key={trait.trait} href={`#${trait.trait}`} className={classes.filterCategoryButton}>
                    <Text className={classes.filterCategoryLabel}>{trait.trait}</Text>
                    <Text className={classes.filterValueSubText}>{selectedCount} of {values.length} selected</Text>
                  </a>
                )
              })}

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
                {Object.values(filteredTraits).map(trait => {
                  return (
                    <Box id={trait.trait} key={trait.trait} marginBottom={3}>
                      <span className={classes.filterCategory}>
                        <Text flexGrow="1" className={classes.filterCategoryLabel}>{trait.trait}</Text>
                        <Text className={classes.attributeMeta}>Att. Rarity</Text>
                        <Text className={classes.attributeMeta}>Match</Text>
                      </span>
                      
                      {Object.values(trait.values).map(value => {
                        return (
                          <Box key={value.value} marginBottom={1}>
                            <FormControlLabel className={classes.attributeValue} value={value.value} control={<Checkbox
                              className={classes.radioButton}
                              checkedIcon={<CheckedIcon />}
                              icon={<UncheckedIcon />}
                              indeterminateIcon={<IndeterminateIcon />}
                              checked={value.selected}
                              onChange={() => handleChange(trait.trait, value.value)}
                              disableRipple
                            />}
                              label={
                                <span className={classes.attribute}>
                                  <Text className={classes.attributeLabel} flexGrow="1">{value.value}</Text>
                                  <Text className={classes.attributeMeta}>2.5K <Text className={classes.attributeMetaDetail}>(10%)</Text></Text>
                                  <Text className={classes.attributeMeta}>{value.count} <Text className={classes.attributeMetaDetail}>(5%)</Text></Text>
                                </span>
                              }
                            />
                          </Box>
                        )
                      })}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default AttributesFilter
