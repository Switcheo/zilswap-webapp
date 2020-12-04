import { Box, BoxProps, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Text } from "app/components";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";
import PoolInfoCard from "../PoolInfoCard";

interface Props extends BoxProps {
  query?: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

const PoolsListing: React.FC<Props> = (props: Props) => {
  const { children, className, query, ...rest } = props;
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const classes = useStyles();

  const {
    registeredTokens,
    otherTokens,
  } = React.useMemo(() => {
    const queryRegexp = !!query ? new RegExp(query) : undefined;
    const result = Object.values(tokenState.tokens)
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
  }, [tokenState.tokens, query])

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Text variant="h2" margin={2}>Registered Pools</Text>
      <Grid container spacing={2}>
        {registeredTokens?.map((token) => (
          <Grid key={token.address} item xs={12} md={6}>
            <PoolInfoCard token={token} />
          </Grid>
        ))}
      </Grid>
      <Text variant="h2" margin={2}>Other Pools</Text>
      <Grid container spacing={2}>
        {otherTokens?.map((token) => (
          <Grid key={token.address} item xs={12} md={6}>
            <PoolInfoCard token={token} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PoolsListing;
