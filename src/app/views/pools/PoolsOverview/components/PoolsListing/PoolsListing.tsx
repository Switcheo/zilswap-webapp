import { Box, BoxProps, Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Text } from "app/components";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
import cls from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PoolInfoCard from "../PoolInfoCard";
import PoolsSearchInput from "../PoolsSearchInput";

interface Props extends BoxProps {
  query?: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
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
  }
}));

interface ListingLimits {
  registered: number;
  others: number;
};

const initialLimits = {
  registered: 6,
  others: 2,
};

const PoolsListing: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const [limits, setLimits] = useState<ListingLimits>(initialLimits);
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  useEffect(() => {
    setLimits(initialLimits);
  }, [searchQuery]);

  const onSearch = (query?: string) => {
    setSearchQuery(query);
  };

  const {
    registeredTokens,
    otherTokens,
  } = React.useMemo(() => {
    const queryRegexp = !!searchQuery ? new RegExp(searchQuery, "i") : undefined;
    const result = Object.values(tokenState.tokens)
      .sort((lhs, rhs) => {
        const lhsRewardValue = tokenState.values[lhs.address]?.zapRewards ?? BIG_ZERO;
        const rhsRewardValue = tokenState.values[rhs.address]?.zapRewards ?? BIG_ZERO;

        if (!lhsRewardValue.eq(rhsRewardValue))
          return rhsRewardValue.comparedTo(lhsRewardValue);

        const lhsTVL = tokenState.values[lhs.address]?.poolLiquidity ?? BIG_ZERO;
        const rhsTVL = tokenState.values[rhs.address]?.poolLiquidity ?? BIG_ZERO;

        return rhsTVL.comparedTo(lhsTVL);
      })
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

        if (token.registered) {
          accum.registeredTokens.push(token);
        } else {
          accum.otherTokens.push(token);
        }

        return accum;
      }, {
        registeredTokens: [] as TokenInfo[],
        otherTokens: [] as TokenInfo[],
      });

    return result;
  }, [tokenState.tokens, tokenState.values, searchQuery]);

  const onLoadMore = (key: keyof ListingLimits) => {
    return () => {
      setLimits({
        ...limits,
        [key]: limits[key] + 10,
      });
    };
  };

  return (
    <Box {...rest} className={cls(classes.root, className)} mt={6} mb={2}>
      <Box display="flex" justifyContent="space-between" mb={2} className={classes.header}>
        <Text variant="h2" margin={2}>Registered Pools ({registeredTokens.length})</Text>
        <PoolsSearchInput onSearch={onSearch}/>
      </Box>
      <Grid container spacing={2}>
        {registeredTokens.slice(0, limits.registered).map((token) => (
          <Grid key={token.address} item xs={12} md={6}>
            <PoolInfoCard token={token} />
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" marginY={4} marginX={1}>
        <Button
          disabled={registeredTokens.length <= limits.registered}
          variant="contained"
          color="primary"
          onClick={onLoadMore("registered")}>
          Load more
        </Button>
      </Box>
      <Text variant="h2" margin={2}>Unregistered Pools ({otherTokens.length})</Text>
      <Grid container spacing={2}>
        {otherTokens.slice(0, limits.others).map((token) => (
          <Grid key={token.address} item xs={12} md={6}>
            <PoolInfoCard token={token} />
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" marginY={4} marginX={1}>
        <Button
          disabled={otherTokens.length <= limits.others}
          variant="contained"
          color="primary"
          onClick={onLoadMore("others")}>
          Load more
        </Button>
      </Box>
    </Box>
  );
};

export default PoolsListing;
