import React from "react";
import clsx from "clsx";
import { Box, BoxProps, CircularProgress, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { ArkNFTCard, ArkPaginator } from "app/components";
import { getMarketplace } from "app/saga/selectors";
import { AppTheme } from "app/theme/types";
import { Nft } from "app/store/types";
import { actions } from "app/store";
import { useTaskSubscriber } from "app/utils";

interface Props extends BoxProps {
  filterComponent: React.ReactNode;
}

const ArkNFTListing: React.FC<Props> = (props: Props) => {
  const { filterComponent, className } = props;
  const classes = useStyles();
  const { filter, tokens } = useSelector(getMarketplace);
  const [loading] = useTaskSubscriber("reloadNftList")
  const dispatch = useDispatch()

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (filter.pagination?.limit || 0)
    dispatch(actions.MarketPlace.updateFilter({ ...filter, pagination: { ...filter.pagination, offset } }));
  }

  return (
    <Box className={clsx(classes.root, className)}>
      {filterComponent}
      <Grid container spacing={2} className={classes.listingContainer}>
        {tokens.map((token: Nft) => (
          <Grid item key={token.tokenId} xs={12} lg={3} md={4} sm={6} className={classes.gridItem}>
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
      <ArkPaginator itemPerPage={filter?.pagination?.limit || 0} totalItem={filter?.pagination?.count || 0} onPageChange={handlePageChange} />
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
}));

export default ArkNFTListing;
