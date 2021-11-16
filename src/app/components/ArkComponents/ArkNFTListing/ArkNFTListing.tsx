import React, { useRef } from "react";
import clsx from "clsx";
import { Box, BoxProps, Grid, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { ArkNFTCard, Text } from "app/components";
import { getMarketplace } from "app/saga/selectors";
import { AppTheme } from "app/theme/types";
import { Nft } from "app/store/types";
import { actions } from "app/store";
import { useIntersectionObserver, useTaskSubscriber } from "app/utils";

interface Props extends BoxProps {
  collectionName?: string;
  filterComponent: React.ReactNode;
}

const ArkNFTListing: React.FC<Props> = (props: Props) => {
  const { filterComponent, className, collectionName } = props;
  const classes = useStyles();
  const { filter, tokens } = useSelector(getMarketplace);
  const [loading] = useTaskSubscriber("reloadNftList");
  const [loadingScroll] = useTaskSubscriber("loadTokens");
  const dispatch = useDispatch();
  const loader = useRef<any>();

  useIntersectionObserver(loader, () => {
    handleInfiniteScroll();
  });

  const handleInfiniteScroll = () => {
    if (tokens.length === 0) return;
    if (filter.pagination?.count && tokens.length === filter.pagination.count) return;
    if (filter.pagination?.offset && tokens.length === filter.pagination.offset) return;

    const offset = tokens.length;
    dispatch(actions.MarketPlace.updateFilter({ ...filter, pagination: { ...filter.pagination, offset }, infinite: true }));
  }

  return (
    <Box className={clsx(classes.root, className)}>
      {filterComponent}
      <Text className={classes.resultsText}>
        {collectionName &&
          <span className={classes.collectionName}>
            {collectionName}
          </span>
        }
        {!!filter?.pagination?.count &&
          <span>
            |
            <span className={classes.results}>
              {filter.pagination.count}
              {" "}
              {filter.pagination.count === 1 ? "Result" : "Results"}
            </span>
          </span>
        }
      </Text>
      <Grid container spacing={2} className={classes.listingContainer}>
        {tokens.map((token: Nft, index) => (
          <Grid item key={index} xs={12} lg={3} md={4} sm={6} className={classes.gridItem}>
            <ArkNFTCard
              token={token}
              collectionAddress={token.collection!.address}
            />
          </Grid>
        ))}
        <Box className={clsx(classes.backdrop, { [classes.backdropActive]: loading })}>
          <Box marginTop={10} />
          <CircularProgress color="inherit" />
        </Box>
      </Grid>
      {loadingScroll &&
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress className={classes.loadingScroll} />
        </Box>
      }
      <div ref={loader} />
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  listingContainer: {
    marginTop: theme.spacing(3),
    position: "relative",
    minHeight: 400,
  },
  backdrop: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: theme.shape?.borderRadius ?? 12,
    background: "rgba(0,0,0,.5)",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: (theme.zIndex?.drawer ?? 1) + 1,
    color: theme.palette.primary.dark,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity .3s ease-in-out",
  },
  backdropActive: {
    opacity: 1,
    pointerEvents: "all",
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  resultsText: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: "21px",
    marginTop: theme.spacing(3),
  },
  collectionName: {
    marginRight: theme.spacing(1),
  },
  results: {
    marginLeft: theme.spacing(1),
  },
  loadingScroll: {
    color: theme.palette.primary.dark,
  }
}));

export default ArkNFTListing;
