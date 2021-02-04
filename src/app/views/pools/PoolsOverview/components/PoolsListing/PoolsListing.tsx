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

interface Props extends BoxProps {
  query?: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

interface ListingLimits {
  registered: number;
  others: number;
};

const initialLimits = {
  registered: 4,
  others: 2,
};

const PoolsListing: React.FC<Props> = (props: Props) => {
  const { children, className, query, ...rest } = props;
  const [limits, setLimits] = useState<ListingLimits>(initialLimits)
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  useEffect(() => {
    setLimits(initialLimits);
  }, [query]);

  const {
    registeredTokens,
    otherTokens,
  } = React.useMemo(() => {
    const queryRegexp = !!query ? new RegExp(query, "i") : undefined;
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
        if (queryRegexp) {
          const fullText = `${token.symbol}${token.name || ""}${token.address}`.toLowerCase();

          if (!fullText.match(queryRegexp))
            return accum;
        }

        if (token.isZil) {
          return accum;
        }

        if (token.whitelisted) {
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
  }, [tokenState.tokens, tokenState.values, query]);

  const onLoadMore = (key: keyof ListingLimits) => {
    return () => {
      setLimits({
        ...limits,
        [key]: limits[key] + 10,
      });
    };
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Text variant="h2" margin={2}>Registered Pools ({registeredTokens.length})</Text>
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
      <Text variant="h2" margin={2}>Other Pools ({otherTokens.length})</Text>
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
