import React from "react";
import { Box, BoxProps, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import ARKFilterBar from "app/components/ARKFilterBar";
import { ArkNFTCard } from "app/components";
import { getMarketplace } from "app/saga/selectors";
import { AppTheme } from "app/theme/types";
import { Nft } from "app/store/types";

interface Props extends BoxProps {
  collectionAddress?: string,
}

const ArkNFTListing: React.FC<Props> = (props: Props) => {
  const { collectionAddress, children, className, ...rest } = props;
  const classes = useStyles();
  const { tokens } = useSelector(getMarketplace);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <ARKFilterBar collectionAddress={collectionAddress} />
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
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
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
