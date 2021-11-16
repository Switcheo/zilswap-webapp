import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, OutlinedInput, Popover, makeStyles, Typography } from '@material-ui/core';
import cls from "classnames";
import { useDispatch, useSelector } from 'react-redux';
import pickBy from "lodash/pickBy";
import { toBech32Address } from '@zilliqa-js/crypto';
import { ArkClient } from 'core/utilities';
import { AppTheme } from 'app/theme/types';
import { bnOrZero, hexToRGBA, SimpleMap, useAsyncTask } from 'app/utils';
import { Text } from "app/components";
import { TraitType, TraitTypeWithSelection, TraitValueWithSelection } from 'app/store/types';
import { updateFilter } from 'app/store/marketplace/actions';
import { getBlockchain, getMarketplace } from 'app/saga/selectors';
import { actions } from 'app/store';
import { ReactComponent as IndeterminateIcon } from "./indeterminate.svg";
import { ReactComponent as UncheckedIcon } from "./unchecked.svg";
import { ReactComponent as CheckedIcon } from "./checked.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  button: {
    border: theme.palette.border,
    color: theme.palette.text!.primary,
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
    border: theme.palette.border,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: 605,
      borderRadius: "12px",
      border: theme.palette.border,
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
    borderRight: theme.palette.border,
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
    '& svg > path': {
      fill: theme.palette.text!.primary,
    },
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
    marginBottom: 14
  },
  filterCategoryLabel: {
    fontSize: 18,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.text!.primary,
    textTransform: "uppercase",
    textAlign: "left"
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: '22px',
    marginTop: -6,
  },
  filterValue: {
    height: 18,
    fontSize: 16,
    overflow: "hidden",
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.text!.primary,
  },
  filterValueSubText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 3,
    textAlign: "left",
    "&.hasSelected": {
      color: theme.palette.primary!.dark,
      opacity: 1,
    },
  },
  filterSelectedValue: {
    textAlign: "left",
    alignItems: "start",
    justifyContent: "start"
  },
  filterSelectedValueCategory: {
    display: "inline-block",
    opacity: 0.8,
    marginRight: 4,
  },
  filterSelectedValueValue: {
    display: "inline-block",
    marginRight: 2,
    opacity: 1,
    "&:not(:last-child)": {
      "&:after": {
        content: '", "'
      }
    }
  },
  filterSelectedValueContainer: {
    textAlign: "left",
    "&:not(:first-child)": {
      marginLeft: 6,
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
    },
    "& $filterValue": {
      width: "100%",
    }
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  },
  filterResetButton: {
    background: "none",
    outline: "none",
    border: "none",
    color: theme.palette.primary!.dark!,
    opacity: 0.8,
    fontSize: 11,
    fontWeight: "bold",
    cursor: "pointer",
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
    textAlign: "right",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 11,
    paddingLeft: 10,
    minWidth: 90,
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
    border: theme.palette.border,
  },
  inputText: {
    fontSize: "14px!important",
    padding: "14px 14px!important",
  },
}))

interface Props {
  collectionAddress: any,
}

const abbreviateTraitValue = (traitValue: string) => {
  if (traitValue.length < 8) return traitValue
  const parts = traitValue.split(' ')
  if (parts.length > 3) return parts[0].slice(0, 4) + ' ' + parts.slice(1).map(p => p.slice(0, 1)).join("").slice(0, 9)
  else return parts.map(p => p.slice(0, 4)).join(" ")
}

const mapToSelectableTraits = (traits: SimpleMap<TraitType>): SimpleMap<TraitTypeWithSelection> => {
  const traitWithSelection: SimpleMap<TraitTypeWithSelection> = {}
  for (const x in traits) {
    traitWithSelection[x] = { trait: traits[x].trait, values: {} }
    for (const y in traits[x].values) {
      traitWithSelection[x].values[y] = { ...traits[x].values[y], selected: false }
    }
  }
  return traitWithSelection;
}

const AttributesFilter = (props: Props) => {
  const { collectionAddress } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runGetCollectionTraits] = useAsyncTask("getCollectionTraits");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [traits, setTraits] = useState<SimpleMap<TraitTypeWithSelection>>({}) // for selecting
  const [filteredTraits, setFilteredTraits] = useState<SimpleMap<TraitTypeWithSelection>>({}) // for searching
  const [search, setSearch] = useState<string>("");
  const { network } = useSelector(getBlockchain);
  const { collections, collectionTraits, filteredTokensTraits, filter } = useSelector(getMarketplace);

  const collection = collections[collectionAddress]
  const currentCollectionTraits = collectionTraits[collectionAddress];

  const total = bnOrZero(collection?.tokenStat.tokenCount);

  useEffect(() => {
    runGetCollectionTraits(async () => {
      if (!collection || !currentCollectionTraits) {
        const arkClient = new ArkClient(network);
        const res = await arkClient.getCollectionTraits(collectionAddress);
        dispatch(actions.MarketPlace.updateCollectionTraits(res));

        const initial = mapToSelectableTraits(res.traits);
        setTraits(initial)
      } else if (collectionAddress && filter.collectionAddress === toBech32Address(collectionAddress).toLowerCase()) {
        setTraits(filter.traits)
      } else {
        const initial = mapToSelectableTraits(currentCollectionTraits);
        setTraits(initial);
      }
    })
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (!Object.values(traits).length) return;

    dispatch(updateFilter({ traits }))
    // eslint-disable-next-line
  }, [traits])

  useEffect(() => {
    // Check for empty search case
    if (search === "") {
      setFilteredTraits(traits)
      return
    }

    var updatedTraits: { [id: string]: TraitTypeWithSelection } = { ...traits }
    Object.keys(updatedTraits).forEach(trait => {
      updatedTraits[trait] = JSON.parse(JSON.stringify(traits[trait]))

      const result = pickBy(updatedTraits[trait].values, function (value, key) {
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
          {Object.values(traits).map(type => {
            const selected = Object.values(type.values).filter(value => value.selected) as ReadonlyArray<TraitValueWithSelection>
            if (!selected.length) return null;

            totalSelectCount += selected.length
            return  (
              <span key={type.trait} className={classes.filterSelectedValueContainer}>
                <span className={classes.filterSelectedValueCategory}>{type.trait.toUpperCase()}:</span>
                {
                  selected.length > 2 || totalSelectCount > 3 ?
                    <span className={classes.filterSelectedValueValue}>{selected.length}</span>
                    :
                    selected.map(selected => (<span className={classes.filterSelectedValueValue}>
                      {abbreviateTraitValue(selected.value)}
                    </span>))
                }
              </span>
            )
          })}
          {totalSelectCount === 0 && <span>ALL</span>}
        </div>
      </>
    )
    // eslint-disable-next-line
  }, [traits, filter.traits])

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
    })
  }

  const getPercent = (c?: number) => {
    const count = bnOrZero(c)
    if (count.lte(0)) return "0%"
    const percent = count.div(total);
    return `${percent.shiftedBy(2).toFormat(percent.lt(1) ? 2 : 0)}%`
  }

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
              <Box display="flex" paddingY={0.6} mb={2} mt={0}>
                <button className={classes.filterResetButton} onClick={reset}>Reset Filters</button>
              </Box>

              {Object.values(filteredTraits).map(trait => {
                const values = Object.values(trait.values)
                const selectedCount = values.filter(value => value.selected).length
                return (
                  <a key={trait.trait} href={`#${trait.trait}`} className={classes.filterCategoryButton}>
                    <Text className={classes.filterCategoryLabel}>{trait.trait}</Text>
                    <Text className={cls(classes.filterValueSubText, { hasSelected: selectedCount > 0 })}>{selectedCount} of {values.length} selected</Text>
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
                        <Text className={classes.attributeMeta}>Count</Text>
                        <Text className={classes.attributeMeta}>Filtered</Text>
                      </span>

                      {Object.values(trait.values).sort((a, b) => b.count - a.count).map(value => {
                        const filteredCount = filteredTokensTraits[trait.trait]?.values[value.value]?.count || 0
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
                                  <Text className={classes.attributeMeta}>
                                    {value.count}
                                    {" "}
                                    <Typography component="span" className={classes.attributeMetaDetail}>
                                      ({getPercent(value.count)})
                                    </Typography>
                                  </Text>
                                  <Text className={classes.attributeMeta}>
                                    {filteredCount}
                                    {" "}
                                    <Typography component="span" className={classes.attributeMetaDetail}>
                                      ({getPercent(filteredCount)})
                                    </Typography>
                                  </Text>
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
