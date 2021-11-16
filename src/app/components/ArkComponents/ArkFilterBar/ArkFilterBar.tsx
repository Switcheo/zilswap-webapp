import React, { useState, useEffect } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { toBech32Address } from '@zilliqa-js/crypto';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import queryString from "query-string";
import { AppTheme } from 'app/theme/types';
import { MarketPlaceState, RootState } from 'app/store/types';
import { SortBy, updateFilter } from 'app/store/marketplace/actions';
import SearchFilter from '../ArkSearchFilter';
import SaleTypeFilter from './components/SaleTypeFilter';
import AttributesFilter from './components/AttributesFilter';
import SortFilter from './components/SortFilter';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    width: "100%",
    marginTop: 32
  },
  grid: {
    flexGrow: 1,
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 10,
    [theme.breakpoints.down("sm")]: {
      gridTemplate: "auto / repeat(2, minmax(0,1fr))"
    },
    [theme.breakpoints.down("xs")]: {
      '& > *': {
        gridColumn: "span 2 / span 2",
      },
    },
  },
}))

interface Props {
  collectionAddress: string;
}

const ArkFilterBar = (props: Props) => {
  const { collectionAddress } = props;
  const classes = useStyles();

  const { search } = useLocation();
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const dispatch = useDispatch()
  const [initialized, setInitialized] = useState<boolean>(false)

  const parseQuery = () => {
    return queryString.parse(search, { arrayFormat: "index" })
  };

  useEffect(() => {
    if (Object.keys(marketPlaceState.filter.traits).length === 0 || initialized) return

    const query = parseQuery();
    const filter = marketPlaceState.filter

    if (query["search"]) {
      filter.search = query["search"].toString().trim();
    }

    if (query["saleType"]) {
      const types = query["saleType"] as string[]
      filter.saleType = {
        fixed_price: types.includes('fixed_price'),
        timed_auction: types.includes('timed_auction')
      }
    }

    const traits = filter.traits
    for (const x in traits) {
      const trait = traits[x]

      if (query[`attributes[${trait.trait}]`] !== undefined) {
        const values = query[`attributes[${trait.trait}]`] as string[]
        values.forEach(value => {
          const selectedValues = Object.keys(filter.traits[trait.trait].values).filter(v => v === value)
          selectedValues.forEach(v => {
            filter.traits[trait.trait].values[v].selected = true
          })
        })
      }
    }
    filter.traits = { ...filter.traits };

    if (query["sortBy"] !== undefined && query["sortDir"] !== undefined) {
      const sort = query["sortBy"] as string
      const sortDirection = query["sortDir"] as string

      var sortBy = SortBy.PriceAscending

      if (sort === "price" && sortDirection === "asc") {
        sortBy = SortBy.PriceAscending
      } else if (sort === "price" && sortDirection === "desc") {
        sortBy = SortBy.PriceAscending
      } else if (sort === "rarity" && sortDirection === "asc") {
        sortBy = SortBy.RarityAscending
      } else if (sort === "rarity" && sortDirection === "desc") {
        sortBy = SortBy.RarityDescending
      } else if (sort === "recent") {
        sortBy = SortBy.MostRecent
      } else if (sort === "loved") {
        sortBy = SortBy.MostLoved
      } else if (sort === "viewed") {
        sortBy = SortBy.MostViewed
      }

      filter.sortBy = sortBy
    }

    dispatch(updateFilter(filter))

    setInitialized(true)

    // eslint-disable-next-line
  }, [marketPlaceState.filter])

  useEffect(() => {
    if (!initialized) return
    var path = toBech32Address(collectionAddress)

    path += `?search=${marketPlaceState.filter.search}`

    Object.entries(marketPlaceState.filter.saleType).forEach(([type, enabled], index) => {
      if (enabled) {
        path += `&saleType[${index}]=${type}`
      }
    })

    const traits = marketPlaceState.filter.traits
    for (const x in traits) {
      const trait = traits[x]

      // eslint-disable-next-line
      Object.keys(trait.values).filter(v => trait.values[v].selected).forEach((v, index) => {
        path += `&attributes[${trait.trait}][${index}]=${v}`
      })
    }

    const sortBy = marketPlaceState.filter.sortBy
    if (sortBy === SortBy.PriceAscending) {
      path += `&sortBy=price&sortDir=asc`
    } else if (sortBy === SortBy.PriceDescending) {
      path += `&sortBy=price&sortDir=desc`
    } else if (sortBy === SortBy.RarityAscending) {
      path += `&sortBy=rarity&sortDir=asc`
    } else if (sortBy === SortBy.RarityDescending) {
      path += `&sortBy=rarity&sortDir=desc`
    } else if (sortBy === SortBy.MostRecent) {
      path += `&sortBy=recent&sortDir=desc`
    } else if (sortBy === SortBy.MostLoved) {
      path += `&sortBy=loved&sortDir=desc`
    } else if (sortBy === SortBy.MostViewed) {
      path += `&sortBy=viewed&sortDir=desc`
    }

    window.history.replaceState(null, document.title, path)
    // eslint-disable-next-line
  }, [marketPlaceState.filter])

  return (
    <Box className={classes.root} marginTop={2}>
      <Box className={classes.grid}>
        <SearchFilter />

        <SaleTypeFilter />

        <AttributesFilter collectionAddress={collectionAddress} />
      </Box>
      <SortFilter />
    </Box>
  )
}

export default ArkFilterBar
