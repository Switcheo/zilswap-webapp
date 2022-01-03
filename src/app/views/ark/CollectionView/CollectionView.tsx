import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Grid, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import cls from "classnames";
import { ArkBanner, ArkBreadcrumb, ArkNFTListing, ArkFilterBar, Text, ArkSocialLinkGroup } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getMarketplace } from "app/saga/selectors";
import { actions } from "app/store";
import { CollectionWithStats } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, toHumanNumber, truncateAddress } from "app/utils";
import { ZIL_DECIMALS } from "app/utils/constants";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { updateFilter } from "app/store/marketplace/actions";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";
import { ReactComponent as EditIcon } from "./edit-icon.svg";

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
    padding: theme.spacing(1.5, 5, 1),
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#6BE1FF40",
  },
  clickable: {
    cursor: 'pointer',
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
    marginTop: theme.spacing(-2.5),
    transform: "translateY(-40px)",
    [theme.breakpoints.down("xs")]: {
      transform: "none",
      marginTop: theme.spacing(1),
      alignSelf: "center",
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
  collectionContract: {
    borderRadius: "12px",
    padding: "8px 24px",
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#6BE1FF40",
    alignSelf: "center",
    width: "fit-content",
    cursor: "pointer",
    margin: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const CollectionView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const { profile } = useSelector(getMarketplace);
  const history = useHistory();
  const dispatch = useDispatch();

  // fetch nfts in collection (to use store instead)
  const [collection, setCollection] = useState<CollectionWithStats>();
  const [tooltipText, setTooltipText] = useState<string>('Copy address');

  useEffect(() => {
    if (match.params?.collection) {
      dispatch(actions.MarketPlace.updateFilter({
        collectionAddress: match.params.collection,
        likedBy: null,
        owner: null,
      }));
    }

    // eslint-disable-next-line
  }, [match.params?.collection])

  const { bech32Address, hexAddress } = useMemo(() => {
    if (!match.params?.collection) {
      history.push("/arky/discover");
      return {};
    }

    let collectionAddress = match.params.collection;
    if (collectionAddress?.startsWith("zil1")) {
      return {
        bech32Address: collectionAddress,
        hexAddress: fromBech32Address(collectionAddress)?.toLowerCase(),
      };
    } else {
      history.push(`/arky/collections/${toBech32Address(collectionAddress)}`);
      return {};
    }
    // eslint-disable-next-line
  }, [match.params?.collection]);

  const { floorPrice, volume, holderCount, tokenCount } = useMemo(() => {
    if (!collection) return {};

    const floorPrice = bnOrZero(collection.priceStat?.floorPrice).shiftedBy(-ZIL_DECIMALS)
    const volume = bnOrZero(collection.priceStat?.volume).shiftedBy(-ZIL_DECIMALS);
    const holderCount = bnOrZero(collection.tokenStat.holderCount);
    const tokenCount = bnOrZero(collection.tokenStat.tokenCount);

    return {
      floorPrice: floorPrice.gt(0) ? floorPrice.toFormat(0) : undefined,
      volume: volume.gt(0) ? toHumanNumber(volume, 0) : undefined,
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
        (collection: CollectionWithStats) => collection.address === hexAddress
      );
      if (collection) {
        setCollection(collection);
      } else {
        history.push("/arky/discover");
      }
    };

    getCollection();
    // eslint-disable-next-line
  }, [hexAddress]);

  const handleFilterBuyNow = () => {
    dispatch(updateFilter({ saleType: { fixed_price: true, timed_auction: false } }))
  }

  const copyAddr = (text: string) => {
    navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
    setTimeout(() => {
      setTooltipText("Copy address");
    }, 2000);
  };

  if (!collection) return null;

  const breadcrumbs = [
    { path: "/arky/discover", value: "Discover" },
    {
      path: `/arky/collections/${bech32Address}`,
      value: collection?.name,
    },
  ];

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBreadcrumb linkPath={breadcrumbs} />

        <ArkBanner
          badgeContent={collection.verifiedAt ? <VerifiedBadge className={classes.verifiedBadge} /> : undefined}
          avatarImage={collection.profileImageUrl}
          bannerImage={collection.bannerImageUrl}
        />
        <Box display="flex" flexDirection="column" alignItems="center">
          <ArkSocialLinkGroup collection={collection} className={classes.socialLinkGroup} />

          {/* Collection name and creator  */}
          <Box display="flex" flexDirection="column" maxWidth={500}>
            <Text variant="h1" className={classes.collectionName}>
              {collection.name}
              {!!profile?.admin &&
                <Link to={`/arky/mod/${toBech32Address(collection.address)}/modify`} style={{ padding: 8 }}>
                  <EditIcon />
                </Link>
              }
            </Text>

            {/* missing info */}
            <Text className={classes.collectionCreator}>by {collection.ownerName}</Text>
            <Tooltip title={tooltipText} placement="right" arrow>
              <Box
                onClick={() => bech32Address && copyAddr(bech32Address)}
                className={classes.collectionContract}
              >
                <Typography variant="body1">
                  {truncateAddress(bech32Address || '')}
                </Typography>
              </Box>
            </Tooltip>
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
              <Box className={cls(classes.statsItem, classes.clickable)} onClick={handleFilterBuyNow}>
                <Text className={classes.statsHeader}>Floor Price</Text>
                <Text className={classes.statsContent}>{floorPrice ? `${floorPrice} ZIL` : "-"}</Text>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Text className={classes.statsHeader}>7-Day Volume</Text>
                <Text className={classes.statsContent}>{volume ? `${volume} ZIL` : "-"}</Text>
              </Box>
            </Grid>
          </Grid>

          {/* Description */}
          <Text className={classes.description}>{collection.description}</Text>
        </Box>

        <ArkNFTListing
          collectionName={collection.name}
          filterComponent={<ArkFilterBar collectionAddress={collection.address} />}
        />
      </Container>
    </ArkPage>
  );
};

export default CollectionView;
