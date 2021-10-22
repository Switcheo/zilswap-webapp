import React from "react";
import { Box, BoxProps, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { ArkNFTCard, ArkPaginator } from "app/components";
import { getMarketplace } from "app/saga/selectors";
import { AppTheme } from "app/theme/types";
import { Nft } from "app/store/types";
import { actions } from "app/store";

interface Props extends BoxProps {
  filterComponent: React.ReactNode;
}

const ArkNFTListing: React.FC<Props> = (props: Props) => {
  const { filterComponent, className } = props;
  const classes = useStyles();
  const { filter, tokens } = useSelector(getMarketplace);
  const dispatch = useDispatch()

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (filter.pagination?.limit || 0)
    dispatch(actions.MarketPlace.updateFilter({ ...filter, pagination: { ...filter.pagination, offset } }));
  }

  return (
    <Box className={className}>
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
      </Grid>
      <ArkPaginator itemPerPage={filter?.pagination?.limit || 0} totalItem={filter?.pagination?.count || 0} onPageChange={handlePageChange} />
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  listingContainer: {
    marginTop: theme.spacing(3),
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export default ArkNFTListing;
