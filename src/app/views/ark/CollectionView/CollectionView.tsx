import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ArkBanner, ArkBreadcrumb, ArkSocialLinkGroup, Text, ArkNFTListing } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain } from "app/saga/selectors";
import { actions } from "app/store";
import ARKFilterBar from "app/components/ArkComponents/ArkFilterBar";
import { Collection } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { bnOrZero, toHumanNumber } from "app/utils";
import { ZIL_DECIMALS } from "app/utils/constants";
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
    color: theme.palette.text?.primary,
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
    color: theme.palette.text?.primary,
    maxWidth: "750px",
    marginTop: theme.spacing(3.5),
    textAlign: "center",
  },
  socialLinkGroup: {
    alignSelf: "flex-end",
    marginTop: "-22px",
    transform: "translateY(-40px)",
    [theme.breakpoints.down("xs")]: {
      display: "none!important",
    },
  },
  socialLinkGroupMobile: {
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      display: "none!important",
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

const COLLECTION_SHARE_MESSAGE = "Check out this awesome NFT collection on #ARK! &link #nftmarketplace #nft #nonfungible #zilswap @zilswap"

const CollectionView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const history = useHistory();
  const dispatch = useDispatch();

  // fetch nfts in collection (to use store instead)
  const [collection, setCollection] = useState<Collection>();

  const { bech32Address, hexAddress } = useMemo(() => {
    if (!match.params?.collection) {
      history.push("/ark/collections");
      return {};
    }

    let collectionAddress = match.params.collection;
    if (collectionAddress?.startsWith("zil1")) {
      dispatch(actions.MarketPlace.updateFilter({ collectionAddress, likedBy: null, owner: null }));

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

  const { floorPrice, volume, holderCount, tokenCount } = useMemo(() => {
    if (!collection) return {};

    const floorPrice = bnOrZero(collection.priceStat?.floorPrice).shiftedBy(-ZIL_DECIMALS)
    const volume = bnOrZero(collection.priceStat?.volume).shiftedBy(-ZIL_DECIMALS);
    const holderCount = bnOrZero(collection.tokenStat?.holderCount);
    const tokenCount = bnOrZero(collection.tokenStat?.tokenCount);

    return {
      floorPrice: floorPrice.gt(0) ? toHumanNumber(floorPrice) : undefined,
      volume: volume.gt(0) ? toHumanNumber(volume) : undefined,
      holderCount: holderCount.gt(0) ? holderCount.toString(10) : undefined,
      tokenCount: tokenCount.gt(0) ? tokenCount.toString(10) : undefined,
    }
  }, [collection]);

  // get collection stat data
  useEffect(() => {
    if (!hexAddress) return;

    const getCollection = async () => {
      const arkClient = new ArkClient(network);
      const data = await arkClient.listCollection();
      const collection = data.result.entries.find(
        (collection: Collection) => collection.address === hexAddress
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
        />
        <Box display="flex" flexDirection="column" alignItems="center">
          <ArkSocialLinkGroup message={COLLECTION_SHARE_MESSAGE} collection={collection} className={classes.socialLinkGroup} />

          {/* TODO: hacky way for mobile view, to clean up */}
          <ArkSocialLinkGroup message={COLLECTION_SHARE_MESSAGE} collection={collection} className={classes.socialLinkGroupMobile} />

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
                <Text className={classes.statsContent}>{tokenCount ?? "-"}</Text>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Number of Owners</Text>
                <Text className={classes.statsContent}>{holderCount ?? "-"}</Text>
              </Box>
            </Grid>

            {/* Need to convert to human number else might overflow */}
            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Floor Price</Text>
                <Text className={classes.statsContent}>{floorPrice ? `${floorPrice} ZIL` : "-"}</Text>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>Volume Traded</Text>
                <Text className={classes.statsContent}>{volume ? `${volume} ZIL` : "-"}</Text>
              </Box>
            </Grid>
          </Grid>

          {/* Description */}
          <Text className={classes.description}>{collection.description}</Text>
        </Box>

        <ArkNFTListing
          filterComponent={<ARKFilterBar collectionAddress={collection.address} />}
        />
      </Container>
    </ArkPage>
  );
};

export default CollectionView;
