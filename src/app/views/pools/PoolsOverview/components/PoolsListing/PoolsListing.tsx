import React, { useEffect, useState } from "react";
import { Box, BoxProps, Button, Grid, Hidden, Tabs, Tab } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { Text } from "app/components";
import { RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
import { hexToRGBA, SimpleMap } from 'app/utils';
import PoolInfoCard from "../PoolInfoCard";
import PoolsSearchInput from "../PoolsSearchInput";
import PoolMobileInfoCard from "../PoolMobileInfoCard";

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
    ownedLiquidity, rewardsState.rewardsByPool,
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

  const allTokens = [...registeredTokens, ...otherTokens];

  return (
    <Box {...rest} className={cls(classes.root, className)} mt={6} mb={2}>

      <Box display="flex" flexDirection="column" justifyContent="space-between" mb={3} className={classes.header}>
        <Text variant="h2">Pools </Text>
        <Box display="flex" mt={1} className={classes.tabSearchBox}>
          <Box display="flex" overflow="auto">
            <Tabs className={classes.tabs} value={tabValue} onChange={handleTabChange}>
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Mega Drop {!!megaDrop.length && (<Text className={classes.tabLabel}>{megaDrop.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Single Drop {!!singleDrop.length && (<Text className={classes.tabLabel}>{singleDrop.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>Main Pools {!!registeredTokens.length && (<Text className={classes.tabLabel}>{registeredTokens.length}</Text>)}</Text>} />
              <Tab className={classes.tab} label={<Text className={classes.tabText}>All Pools {!!allTokens.length && (<Text className={classes.tabLabel}>{allTokens.length}</Text>)}</Text>} />
            </Tabs>
          </Box>
          <Box flexGrow={1} />
          <PoolsSearchInput onSearch={onSearch} />
        </Box>
      </Box>

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
    </Box>
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
    },
    '& .MuiTabs-fixed': {
      overflow: "scroll!important",
    },
    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(1),
    }
  },
  tab: {
    display: "flex",
    textTransform: 'none',
    minWidth: 0,
    [theme.breakpoints.up('sm')]: {
      minWidth: 0,
    },
    fontWeight: 600,
    marginRight: theme.spacing(3),
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
    '&.MuiTab-root': {
      padding: "6px 0px",
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
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  }
}));

export default PoolsListing;
