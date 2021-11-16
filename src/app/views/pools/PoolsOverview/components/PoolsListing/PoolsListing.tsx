import React, { useEffect, useState } from "react";
import { Box, BoxProps, Button, Grid, Hidden, Tabs, Tab, Popover } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import groupBy from "lodash/groupBy";
import dayjs from "dayjs";
import { toBech32Address } from "@zilliqa-js/crypto";
import { useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { Text } from "app/components";
import { RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
import { EMPTY_USD_VALUE } from "app/store/token/reducer";
import { hexToRGBA, SimpleMap } from 'app/utils';
import PoolInfoCard from "../PoolInfoCard";
import PoolsSearchInput from "../PoolsSearchInput";
import PoolMobileInfoCard from "../PoolMobileInfoCard";
import { ReactComponent as Unsorted } from "./sort.svg";
import { ReactComponent as Desc } from "./desc.svg";
import { ReactComponent as Asc } from "./asc.svg";
import { ReactComponent as SingleDesc } from "./single-desc.svg";
import { ReactComponent as SingleAsc } from "./single-asc.svg";
import { ReactComponent as Checkmark } from "./checkmark.svg";

interface Props extends BoxProps {
  query?: string;
  ownedLiquidity?: boolean;
}

const initialLimits = {
  mega: 20,
  single: 20,
  registered: 40,
  all: 40,
};

const limitArr = ["mega", "single", "registered", "all"];

// const initialLimits = [1, 10, 40, 40];

const PoolsListing: React.FC<Props> = (props: Props) => {
  const { children, className, ownedLiquidity, ...rest } = props;
  const [limits, setLimits] = useState<SimpleMap<number>>(initialLimits);
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const [tabValue, setTabValue] = useState(ownedLiquidity ? 3 : 0);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const classes = useStyles();
  const currentLimit = limitArr[tabValue];
  const [sortBy, setSortBy] = useState("apr:desc");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    setLimits(initialLimits);
  }, [searchQuery]);

  const onSearch = (query?: string) => {
    setSearchQuery(query);
  };

  const {
    registeredTokens,
    otherTokens,
    megaDrop,
    singleDrop,
  } = React.useMemo(() => {
    const queryRegexp = !!searchQuery ? new RegExp(searchQuery, "i") : undefined;
    const preStartDistributors = rewardsState.distributors.filter((distributor) => !dayjs().isAfter(distributor.emission_info.distribution_start_time * 1000));
    const result = Object.values(tokenState.tokens)
      .sort((lhs, rhs) => {
        const lhsValues = tokenState.values[lhs.address];
        const rhsValues = tokenState.values[rhs.address];

        const lhsTVL = lhsValues?.poolLiquidity ?? BIG_ZERO;
        const rhsTVL = rhsValues?.poolLiquidity ?? BIG_ZERO;

        const core = ['ZWAP', 'gZIL', 'XSGD']
        if (core.includes(lhs.symbol) || core.includes(rhs.symbol))
          return rhsTVL.comparedTo(lhsTVL);

        const lhsRewardValue = lhsValues ? lhsValues.rewardsPerSecond.dividedBy(lhsValues.poolLiquidity) : BIG_ZERO;
        const rhsRewardValue = rhsValues ? rhsValues.rewardsPerSecond.dividedBy(rhsValues.poolLiquidity) : BIG_ZERO;

        if (!lhsRewardValue.eq(rhsRewardValue))
          return rhsRewardValue.comparedTo(lhsRewardValue);

        return rhsTVL.comparedTo(lhsTVL);
      })
      .sort((lhs, rhs) => {
        const [sortType, sortOrder] = sortBy.split(":");
        if (sortType === "dist") {
          const lhsRewards = rewardsState.rewardsByPool[lhs.address] || [];
          const rhsRewards = rewardsState.rewardsByPool[rhs.address] || [];

          const lhsAmount = Object.entries(groupBy(lhsRewards, (reward) => reward.rewardToken.address))
            .filter(([address, rewards]) => {
              return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
            })
            .reduce((total, [address, rewards]) =>
              total.plus(rewards.reduce((acc, reward) =>
                acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).times(tokenState.prices[address])), BIG_ZERO)

          const rhsAmount = Object.entries(groupBy(rhsRewards, (reward) => reward.rewardToken.address))
            .filter(([address, rewards]) => {
              return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
            })
            .reduce((total, [address, rewards]) =>
              total.plus(rewards.reduce((acc, reward) =>
                acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).times(tokenState.prices[address])), BIG_ZERO)


          if (sortOrder === "asc") {
            return lhsAmount.comparedTo(rhsAmount);
          }
          return rhsAmount.comparedTo(lhsAmount);
        }

        const lhsUsdValues = tokenState.values[lhs.address] ?? EMPTY_USD_VALUE;
        const rhsUsdValues = tokenState.values[rhs.address] ?? EMPTY_USD_VALUE;

        const secondsPerDay = 24 * 3600

        const lhsRoiPerSec = lhsUsdValues.rewardsPerSecond.dividedBy(lhsUsdValues.poolLiquidity);
        const rhsRoiPerSec = rhsUsdValues.rewardsPerSecond.dividedBy(rhsUsdValues.poolLiquidity);

        const lhsApr = lhsRoiPerSec.times(secondsPerDay * 365).shiftedBy(2).decimalPlaces(1);
        const rhsApr = rhsRoiPerSec.times(secondsPerDay * 365).shiftedBy(2).decimalPlaces(1);

        if (sortOrder === "asc") {
          return lhsApr.comparedTo(rhsApr);
        }
        return rhsApr.comparedTo(lhsApr);
      })
      .filter((token) => !ownedLiquidity || (token.pool && !token.pool.contributionPercentage.isZero()))
      .reduce((accum, token) => {
        // TODO: proper token blacklist
        if (token.address === "zil13c62revrh5h3rd6u0mlt9zckyvppsknt55qr3u") return accum;

        if (queryRegexp) {
          const fullText = `${token.symbol}${token.name || ""}${token.address}`.toLowerCase();

          if (!fullText.match(queryRegexp))
            return accum;
        }

        if (token.isZil) {
          return accum;
        }

        if (token.blockchain !== Blockchain.Zilliqa) return accum;

        if (token.registered) {
          accum.registeredTokens.push(token);
        } else {
          accum.otherTokens.push(token);
        }

        let tokenReward = rewardsState.rewardsByPool[token.address]
        if (!tokenReward || tokenReward.length === 0)
          return accum;

        if (tokenReward.length === 1) {
          accum.singleDrop.push(token)
        }
        if (tokenReward.length > 1) {
          accum.megaDrop.push(token);
        }

        return accum;
      }, {
        singleDrop: [] as TokenInfo[],
        megaDrop: [] as TokenInfo[],
        registeredTokens: [] as TokenInfo[],
        otherTokens: [] as TokenInfo[],
      });

    return result;
  }, [
    tokenState.tokens, tokenState.values, searchQuery,
    ownedLiquidity, rewardsState.rewardsByPool, sortBy,
    rewardsState.distributors, tokenState.prices
  ]);

  const onLoadMore = () => {
    return () => {
      setLimits({
        ...limits,
        [currentLimit]: limits[currentLimit] + 10,
      })
    };
  };

  const handleTabChange = (ev: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  }

  const updateSort = (type: string) => {
    const [sortType, sortOrder] = sortBy.split(":");
    let newOrder = sortOrder;
    let newSort = sortType;
    if (newSort === type) {
      if (newOrder === "desc") newOrder = "asc";
      else newOrder = "desc";
    } else {
      newSort = type;
      newOrder = "desc";
    }
    setSortBy(newSort + ":" + newOrder);
  }

  const getLogo = (type: string) => {
    const [sortType, sortOrder] = sortBy.split(":");
    if (type !== sortType) return <Unsorted />;
    if (sortOrder === "asc") return <Asc />;
    return <Desc />;
  }
  const getSortDetail = () => {
    const [sortType, sortOrder] = sortBy.split(":");
    const sortString = sortType === "apr" ? "APR" : "Rewards";
    return <>{sortString} {sortOrder === "asc" ? <SingleAsc /> : <SingleDesc />}</>
  }

  const openSortMenu = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(ev.currentTarget);
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }
  const allTokens = [...registeredTokens, ...otherTokens];

  return (
    <Box {...rest} className={cls(classes.root, className)} mt={6} mb={2}>

      <Box display="flex" flexDirection="column" justifyContent="space-between" mb={3} className={classes.header}>
        <Box display="flex">
          <Text variant="h2">Pools </Text>
          <Box flexGrow={1} />
          <Hidden mdUp>
            <Button className={cls(classes.menuItem, classes.selectButton)} onClick={(ev) => openSortMenu(ev)}>
              Sort by: {getSortDetail()}
            </Button>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              className={classes.selectMenu}
              onClose={closeMenu}
            >
              <Text
                className={cls(classes.menuItem, { [classes.selectedMenu]: sortBy === "apr:desc" })}
                onClick={() => { closeMenu(); setSortBy("apr:desc"); }}>
                APR&nbsp;<Text className={classes.noBold}>High - Low</Text><Box flexGrow={1} />{sortBy === "apr:desc" && <Checkmark />}
              </Text>
              <Text
                className={cls(classes.menuItem, { [classes.selectedMenu]: sortBy === "apr:asc" })}
                onClick={() => { closeMenu(); setSortBy("apr:asc"); }}>
                APR&nbsp;<Text className={classes.noBold}>Low - High</Text><Box flexGrow={1} />{sortBy === "apr:asc" && <Checkmark />}
              </Text>
              <Text
                className={cls(classes.menuItem, { [classes.selectedMenu]: sortBy === "dist:desc" })}
                onClick={() => { closeMenu(); setSortBy("dist:desc"); }}>
                Rewards&nbsp;<Text className={classes.noBold}>High - Low</Text> <Box flexGrow={1} />{sortBy === "dist:desc" && <Checkmark />}
              </Text>
              <Text
                className={cls(classes.menuItem, { [classes.selectedMenu]: sortBy === "dist:asc" })}
                onClick={() => { closeMenu(); setSortBy("dist:asc"); }}>
                Rewards&nbsp;<Text className={classes.noBold}>Low - High</Text><Box flexGrow={1} />{sortBy === "dist:asc" && <Checkmark />}
              </Text>
            </Popover>
          </Hidden>
        </Box>
        <Box display="flex" mt={1} className={classes.tabSearchBox}>
          <Box display="flex">
            <Tabs className={classes.tabs} value={tabValue} onChange={handleTabChange}>
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Mega Drops {!!megaDrop.length && (<Text className={classes.tabLabel}>{megaDrop.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Single Drops {!!singleDrop.length && (<Text className={classes.tabLabel}>{singleDrop.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Main Pools {!!registeredTokens.length && (<Text className={classes.tabLabel}>{registeredTokens.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>All Pools {!!allTokens.length && (<Text className={classes.tabLabel}>{allTokens.length}</Text>)}</Text>} />
            </Tabs>
          </Box>
          <Box flexGrow={1} />
          <PoolsSearchInput onSearch={onSearch} />
        </Box>
      </Box>

      {Object.keys(tokenState.tokens).length > 0 && (
        <Hidden smDown>
          <Box padding={3} paddingBottom={1} display="flex" alignItems="center">
            <Box flex={.5} mr={2} justifyContent="center" display="flex">
              <Text>Pool</Text>
            </Box>
            <Box flex={2} justifyContent="flex-start" display="flex" flexDirection="column">
              <Text paddingLeft="16px" >Total staked</Text>
            </Box>
            <Box flex={2} justifyContent="flex-start" display="flex">
              <Text onClick={() => updateSort("dist")} className={classes.headerText}>{getLogo("dist")}Reward to be distributed</Text>
            </Box>
            <Box flex={1.5} display="flex" flexDirection="column" >
              <Text onClick={() => updateSort("apr")} className={classes.headerText}>{getLogo("apr")}APR</Text>
            </Box>
            <Box flex={2.5}>
              <Text></Text>
            </Box>
          </Box>
        </Hidden>
      )}

      <Grid container spacing={2}>
        {tabValue === 0 && megaDrop.slice(0, limits[currentLimit]).map((token) => (
          <Grid key={token.address} item xs={12} >
            <Hidden smDown>
              <PoolInfoCard token={token} />
            </Hidden>
            <Hidden mdUp>
              <PoolMobileInfoCard token={token} />
            </Hidden>
          </Grid>
        ))}
        {tabValue === 1 && singleDrop.slice(0, limits[currentLimit]).map((token) => (
          <Grid key={token.address} item xs={12} >
            <Hidden smDown>
              <PoolInfoCard token={token} />
            </Hidden>
            <Hidden mdUp>
              <PoolMobileInfoCard token={token} />
            </Hidden>
          </Grid>
        ))}
        {tabValue === 2 && registeredTokens.slice(0, limits[currentLimit]).map((token) => (
          <Grid key={token.address} item xs={12} >
            <Hidden smDown>
              <PoolInfoCard token={token} />
            </Hidden>
            <Hidden mdUp>
              <PoolMobileInfoCard token={token} />
            </Hidden>
          </Grid>
        ))}
        {tabValue === 3 && allTokens.slice(0, limits[currentLimit]).map((token) => (
          <Grid key={token.address} item xs={12} >
            <Hidden smDown>
              <PoolInfoCard token={token} />
            </Hidden>
            <Hidden mdUp>
              <PoolMobileInfoCard token={token} />
            </Hidden>
          </Grid>
        ))}

        {[megaDrop, singleDrop, registeredTokens, allTokens][tabValue].length > limits[currentLimit] && <Box width="100%" display="flex" justifyContent="center" justifySelf="center" marginY={4} marginX={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={onLoadMore()}>
            Load more
          </Button>
        </Box>}
      </Grid>
    </Box >
  );
};


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
    padding: theme.spacing(4, 6),
    borderRadius: 12,
    boxShadow: theme.palette.cardBoxShadow,
    "& .MuiOutlinedInput-input": {
      padding: theme.spacing(2, 2),
      fontSize: "20px"
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.background.contrast,
      border: "transparent"
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 2),
    },
  },
  header: {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column"
    },
  },
  tabs: {
    '& .MuiTabs-indicator': {
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
      border: `1px solid ${theme.palette.type === "dark" ? "#555555" : "rgba(0, 51, 64, 0.3)"}`,
      borderRadius: "2px",
      height: 4,
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(1),
    },
    '& .MuiTabs-fixed': {
      overflowX: "scroll!important",
    },
    '& ::-webkit-scrollbar': {
      display: "none",
    },
  },
  tab: {
    display: "flex",
    textTransform: 'none',
    minWidth: 0,
    fontWeight: 600,
    marginRight: theme.spacing(4),
    borderRadius: "12px",
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
    '&.MuiTab-root': {
      padding: "6px 12px",
    }
  },
  tabText: {
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    color: theme.palette.text?.primary,
  },
  tabLabel: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(.7, 1),
    borderRadius: 8,
    background: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
  },
  tabSearchBox: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  },
  headerText: {
    display: "flex",
    alignItems: "center",
    transform: "translateX(-10px)",
    cursor: "pointer",
  },
  selectMenu: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.background.default,
      width: "100%",
      maxWidth: 220,
      borderRadius: "12px",
      border: theme.palette.border,
      overflow: "hidden",
      marginTop: 8,
      padding: theme.spacing(1),
    },
  },
  menuItem: {
    fontSize: 16,
    fontWeight: 'bolder',
    padding: "5px 14px",
    color: theme.palette.text!.primary,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255,255,255,0.1)"
    }
  },
  selectButton: {
    paddingRight: theme.spacing(0),
  },
  selectedMenu: {
    color: theme.palette.primary.dark,
  },
  noBold: {
    fontWeight: "bold",
    color: "inherit",
  }
}));

export default PoolsListing;
