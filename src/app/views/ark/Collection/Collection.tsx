import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ArkBanner, ArkBreadcrumb, SocialLinkGroup, Text } from "app/components";
import ARKFilterBar from "app/components/ARKFilterBar";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain } from "app/saga/selectors";
import { actions } from "app/store";
import { CollectionFilter, Nft } from "app/store/marketplace/types";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { NftCard } from "./components";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  verifiedBadge: {
    height: 32,
    width: 32,
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "35px",
    color: theme.palette.type === "dark" ? "#FFFFFF" : "#003340",
    textAlign: "center",
    [theme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
  },
  collectionCreator: {
    color: theme.palette.primary.light,
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "center",
    marginTop: theme.spacing(1),
  },
  statsContainer: {
    width: "fit-content",
    minWidth: "750px",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      minWidth: "0",
    },
  },
  statsItem: {
    display: "flex",
    padding: theme.spacing(1, 5),
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#6BE1FF40",
  },
  statsHeader: {
    fontSize: "12px",
    lineHeight: "14px",
    color: theme.palette.primary.light,
    whiteSpace: "nowrap",
  },
  statsContent: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: "36px",
    color: theme.palette.text?.primary,
    whiteSpace: "nowrap",
  },
  description: {
    fontSize: "16px",
    lineHeight: "24px",
    color: theme.palette.primary.light,
    maxWidth: "750px",
    marginTop: theme.spacing(3.5),
    textAlign: "center",
  },
  socialLinkGroup: {
    alignSelf: "flex-end",
    marginTop: "-22px",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  socialLinkGroupMobile: {
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  nftContainer: {
    marginTop: theme.spacing(3),
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const TEMP_BANNER_URL =
  "https://pbs.twimg.com/profile_banners/1429715941399486466/1630400388/1500x500";
const TEMP_BEAR_AVATAR_URL =
  "https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg";

const Collection: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const history = useHistory();
  const dispatch = useDispatch();
  const filter = useSelector<RootState, CollectionFilter>(
    (state) => state.marketplace.filter
  );
  const tokens = useSelector<RootState, Nft[]>(
    (state) => state.marketplace.tokens
  );

  // fetch nfts in collection (to use store instead)
  const [collection, setCollection] = useState<any>();

  const { bech32Address, hexAddress } = useMemo(() => {
    if (!match.params?.collection) {
      history.push("/ark/collections");
      return {};
    }

    let collectionAddress = match.params.collection;
    if (collectionAddress?.startsWith("zil1")) {
      if (filter.collectionAddress !== collectionAddress)
        dispatch(actions.MarketPlace.updateFilter({ collectionAddress }));

      return {
        bech32Address: collectionAddress,
        hexAddress: fromBech32Address(collectionAddress)?.toLowerCase(),
      };
    } else {
      history.push(`/ark/collections/${toBech32Address(collectionAddress)}`);
      return {};
    }
    // eslint-disable-next-line
  }, [match.params?.collection]);

  // get collection data
  useEffect(() => {
    if (!hexAddress) return;

    const getCollection = async () => {
      const arkClient = new ArkClient(network);
      const data = await arkClient.listCollection();
      const collection = data.result.entries.find(
        (collection: any) => collection.address === hexAddress
      );
      if (collection) setCollection(collection);
      else history.push("/ark/collections");
    };

    getCollection();
    // eslint-disable-next-line
  }, [hexAddress]);

  if (!collection) return null;

  const breadcrumbs = [
    { path: "/ark/collections", value: "Collections" },
    {
      path: `/ark/collections/${bech32Address}`,
      value: collection?.name,
    },
  ];


  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBreadcrumb linkPath={breadcrumbs} />

        <ArkBanner
          badgeContent={<VerifiedBadge className={classes.verifiedBadge} />}
          avatarImage={TEMP_BEAR_AVATAR_URL}
          bannerImage={TEMP_BANNER_URL}
        >
          <SocialLinkGroup className={classes.socialLinkGroup} />

          {/* TODO: hacky way for mobile view, to clean up */}
          <SocialLinkGroup className={classes.socialLinkGroupMobile} />

          {/* Collection name and creator  */}
          <Box display="flex" flexDirection="column" maxWidth={500}>
            <Text variant="h1" className={classes.collectionName}>
              {collection.name}
            </Text>

            {/* missing info */}
            <Text className={classes.collectionCreator}>by Switcheo Labs</Text>
          </Box>

          {/* Stats */}
          <Grid container spacing={2} className={classes.statsContainer}>
            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Collection Size</Text>
                <Text className={classes.statsContent}>10,000</Text>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Number of Owners</Text>
                <Text className={classes.statsContent}>8</Text>
              </Box>
            </Grid>

            {/* Need to convert to human number else might overflow */}
            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Floor Price</Text>
                <Text className={classes.statsContent}>2,000 ZIL</Text>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Volume Traded</Text>
                <Text className={classes.statsContent}>1,000 ZIL</Text>
              </Box>
            </Grid>
          </Grid>

          {/* Description */}
          <Text className={classes.description}>{collection.description}</Text>

          {/* Filters */}
          <ARKFilterBar collectionAddress={collection.address} />

          {/* NFTs in collection */}
          <Grid container spacing={2} className={classes.nftContainer}>
            {collection && tokens.map((token) => (
              <Grid item key={token.tokenId} xs={12} lg={3} md={4} sm={6} className={classes.gridItem}>
                <NftCard
                  token={token}
                  collectionAddress={collection.address}
                />
              </Grid>
            ))}
          </Grid>
        </ArkBanner>
      </Container>
    </ArkPage>
  );
};

export default Collection;
