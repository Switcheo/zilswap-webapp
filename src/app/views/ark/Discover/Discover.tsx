import React, { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js"
import { Box, Checkbox, Container, FormControl, FormControlLabel, FormLabel, InputAdornment, OutlinedInput, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme, Popover } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { ArkImageView, CurrencyLogo } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain } from "app/saga/selectors";
import { CollectionWithStats } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ArkClient } from "core/utilities";
import { bnOrZero } from "app/utils";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg";
import { ReactComponent as UncheckedIcon } from "./unchecked-icon.svg";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";

interface SearchFilters {
  [prop: string]: boolean;
}

const SEARCH_FILTERS = ["profile", "artist", "collection"]

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}
const HEADERS: HeadersProp[] = [
  { align: "left", value: "Collection" },
  { align: "center", value: "Volume" },
  { align: "center", value: "Floor" },
  // { align: "center", value: "% Change (24hr / 7day)" },
  { align: "center", value: "Owners" },
  { align: "center", value: "Collection Size" },
]

const Discover: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  // const { exchangeInfo } = useSelector(getMarketplace);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'));
  const [search, setSearch] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<SearchFilters>({
    profile: true,
    artist: true,
    collection: true,
  });

  // fetch collections (to use store instead)
  const [collections, setCollections] = useState<CollectionWithStats[]>([]);

  useEffect(() => {
    const getCollections = async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.listCollection();
      setCollections(result.result.entries);
    };

    getCollections();
  }, [network]);

  const handleSearchFilter = (value: string) => {
    setSearchFilter(prevState => ({
      ...prevState,
      [value]: !prevState[value]
    }))
  }

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  const filteredCollections = useMemo(() => {
    const sorted = collections.sort((a, b) => bnOrZero(b.priceStat ? b.priceStat.volume : 0).comparedTo(a.priceStat ? a.priceStat.volume : 0))

    if (!search.trim().length) return sorted

    return sorted.filter(c => (
      c.ownerName?.includes(search)
      || c.name?.includes(search))
    )
  }, [collections, search]);

  const isMd = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("md"));
  const isSm = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("sm"));

  const fullCollections = useMemo(() => {
    const sorted = collections.sort((a, b) => bnOrZero(b.priceStat ? b.priceStat.volume : 0).comparedTo(a.priceStat ? a.priceStat.volume : 0))
    return sorted

  }, [collections]);

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography className={classes.topBarTitle} variant="h1">Featured</Typography>
          <Typography className={classes.titleDescription} variant="h4">Top NFTs at a glance. Ranked by volume, price, number of owners, and assets.</Typography>
        </Box>

        <OutlinedInput
          placeholder="Search for an artist or a collection"
          value={search}
          fullWidth
          classes={{ input: classes.inputText }}
          className={classes.input}
          onClick={handleClick}
          onChange={(e) => setSearch(e.target.value)}
          endAdornment={
            !isMobileView && (
              <InputAdornment position="end">
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel focused className={classes.formLabel}>By</FormLabel>
                  {SEARCH_FILTERS.map((filter) => (
                    <FormControlLabel
                      key={filter}
                      className={classes.formControlLabel}
                      value={filter}
                      control={
                        <Checkbox
                          className={classes.radioButton}
                          onChange={(e) => handleSearchFilter(filter)}
                          checkedIcon={<CheckedIcon />}
                          icon={<UncheckedIcon />}
                          disableRipple
                          checked={searchFilter[filter]}
                        />
                      }
                      label={filter.toUpperCase()}
                    />
                  ))}
                </FormControl>
              </InputAdornment>
            )
          }
        />
        <Popover
          id={id} open={open && filteredCollections.length > 0 && search.length > 1} anchorEl={anchorEl}
          disableAutoFocus={true}
          disableEnforceFocus={true}
          onClose={handleClose}
          className={classes.popover}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isMd ? 'right' : 'left',
          }}
        >
          <Container maxWidth="lg"
            className={cls(classes.popoverContainer, {
              [classes.popoverSmall]: isMd,
              [classes.popoverMobile]: isSm,
            })}
          >
            <Box className={classes.searchResultHeader}>Collections</Box>
            {filteredCollections.map((collection) => (
              <RouterLink to={`/ark/collections/${toBech32Address(collection.address)}`}>
                <Box className={classes.popoverRow} display="flex" justifyContent="space-between" alignItems="center">
                  <Box className={classes.resultCollectionName} display="flex" alignItems="center">
                    <ArkImageView
                      imageType="avatar"
                      className={classes.searchResultAvatar}
                      imageUrl={collection.profileImageUrl}
                    />
                    {collection.name}
                  </Box>
                  <Typography>{new BigNumber(collection.tokenStat.tokenCount).toFormat(0)} ITEMS</Typography>
                </Box>
              </RouterLink>
            ))}
          </Container>
        </Popover>

        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                {HEADERS.map((header, index) => (
                  <TableCell
                    key={`offers-${index}`}
                    className={classes.headerCell}
                    align={header.align}
                  >
                    {header.value}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>

              {fullCollections.map((collection, i) => {
                const collectionStats = ArkClient.parseCollectionStats(collection)
                return (
                  <TableRow
                    key={collection.address}
                    className={classes.tableRow}
                    component={RouterLink}
                    to={`/ark/collections/${toBech32Address(collection.address)}`}
                  >
                    <TableCell className={cls(classes.bodyCell, classes.firstCell)}>
                      <Box className={classes.collectionNameCell}>
                        <Box className={classes.index}>{i+1}</Box>
                        <ArkImageView
                          imageType="avatar"
                          className={classes.avatar}
                          imageUrl={collection.profileImageUrl}
                        />
                        <Box className={classes.collectionNameContainer}>
                          <Box display="flex">
                            <Box className={classes.collectionName}>{collection.name}</Box>
                          </Box>
                          <Typography className={classes.ownerName}>By {collection.ownerName}</Typography>
                        </Box>
                        <VerifiedBadge className={classes.verifiedBadge} />
                      </Box>
                    </TableCell>
                    <TableCell align="center" className={classes.bodyCell}>

                      <Box display="flex" alignItems="center" justifyContent="center">
                        <strong className={classes.amount}>
                          {collectionStats.volume ?? "-"}
                        </strong>
                        <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                      </Box>

                    </TableCell>
                    <TableCell align="center" className={classes.bodyCell}>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <strong className={classes.amount}>
                          {collectionStats.floorPrice ?? "-"}
                        </strong>
                        <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                      </Box>
                    </TableCell>
                    {/* <TableCell align="center" className={cls(classes.percentCell, { [classes.isNegative]: mockedDaily.isNegative() })}> */}
                      {/* {mockedDaily.isPositive() ? '+' : ''}{mockedDaily.toFormat(2)}% */}
                      {/* {mockedWeekly.isPositive() ? '+' : ''}{mockedWeekly.toFormat(2)}% */}
                    {/* </TableCell> */}
                    <TableCell align="center" className={classes.numberCell}>
                      {collectionStats.holderCount ?? "-"}
                    </TableCell>
                    <TableCell align="center" className={cls(classes.numberCell, classes.lastCell)}>
                      {collectionStats.tokenCount ?? "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ArkPage>
  );
};

export default Discover;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    "& .MuiRadio-colorSecondary.Mui-checked": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    marginTop: theme.spacing(2),
    borderColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "rgba(0, 51, 64, 0.2)",
    marginBottom: theme.spacing(5),
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
  formControl: {
    flexDirection: "row",
  },
  formLabel: {
    alignSelf: "center",
    fontWeight: 700,
    marginRight: theme.spacing(2),
    color: `${theme.palette.primary.light}!important`,
  },
  formControlLabel: {
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontWeight: 900,
    },
  },
  radioButton: {
    padding: "6px",
    '& svg > path': {
      fill: theme.palette.text!.primary,
    },
    "&:hover": {
      background: "transparent!important",
    },
  },
  titleDescription: {
    color: theme.palette.type === "dark" ? "#26D4FF" : "#003340",
    marginBottom: "20px",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  image: {
    borderRadius: "0px 0px 10px 10px!important",
  },
  headerCell: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    padding: "8px 0 0 0",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
    opacity: 0.5,
    borderBottom: 'none',
  },
  tableRow: {
    padding: 12,
    height: 72,
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "rgba(222, 255, 255, 0.5)",
  },
  bodyCell: {
    padding: "8px 16px",
    margin: 0,
    borderTop: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  percentCell: {
    extend: 'bodyCell',
    fontSize: 18,
    color: '#00FFB0',
  },
  numberCell: {
    extend: 'bodyCell',
    fontSize: 18,
  },
  firstCell: {
    borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastCell: {
    borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    minWidth: 100,
  },
  amount: {
    fontWeight: 800,
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0px 12px',
  },
  currencyLogo: {
    margin: theme.spacing(0, 1),
    "& svg": {
      display: "block",
    }
  },
  avatar: {
    height: 40,
    width: 40,
    [theme.breakpoints.down('md')]: {
      height: 24,
      width: 24,
    }
  },
  rowText: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  verifiedBadge: {
    marginLeft: "4px",
    marginTop: 2,
    width: "20px",
    height: "20px",
    verticalAlign: "text-top",
    alignSelf: 'flex-start',
    [theme.breakpoints.down('md')]: {
      height: 14,
      width: 14,
    }
  },
  index: {
    margin: "0px 14px",
  },
  collectionNameCell: {
    display:"flex" ,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 240,
  },
  collectionNameContainer: {
    marginLeft: "14px",
    display:"flex" ,
    flexDirection: "column",
  },
  collectionName: {
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    }
  },
  ownerName: {
    marginTop: 2,
  },
  isNegative: {
    color: theme.palette.error.main,
  },
  topBarTitle: {
    fontSize: "48px",
    margin: "0 0 48px 0px",
  },
  popover: {
    marginTop: 8,
  },
  popoverContainer: {
    backgroundColor: theme.palette.type === "dark" ? "#223139" : "#D4FFF2",
    width: 1230,
    borderRadius: 12,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
    padding: 0,
  },
  popoverSmall: {
    width: 'calc(100vw - 98px)',
  },
  popoverMobile: {
    width: 'calc(100vw)',
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
}));
