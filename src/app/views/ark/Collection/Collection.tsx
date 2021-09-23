import { Box, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Text } from "app/components";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React from "react";
import { NftCard } from "./components";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";
import { ArkBanner, SocialLinkGroup, ArkBreadcrumb } from "app/components";

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
    color: "#FFFFFF",
    textAlign: "center",
    [theme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
  },
  collectionCreator: {
    color: "rgba(222, 255, 255, 0.5)",
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
    backgroundColor: "rgba(222, 255, 255, 0.1)",
  },
  statsHeader: {
    fontSize: "12px",
    lineHeight: "14px",
    color: "rgba(222, 255, 255, 0.5)",
    whiteSpace: "nowrap",
  },
  statsContent: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: "36px",
    color: "#DEFFFF",
    whiteSpace: "nowrap",
  },
  description: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "rgba(222, 255, 255, 0.5)",
    maxWidth: "750px",
    marginTop: theme.spacing(2),
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

const TEMP_BANNER_URL = "https://pbs.twimg.com/profile_banners/1429715941399486466/1630400388/1500x500";
const TEMP_BEAR_AVATAR_URL = "https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg";

const Collection: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();

  // fetch nfts in collection

  const breadcrumbs = [
    { path: "/ark/collections", value: "Collections" },
    { path: `/ark/collections/${match.params.collection}`, value: "The Bear Market" },
  ];

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBreadcrumb linkPath={breadcrumbs} />

        <ArkBanner
          badgeContent={<VerifiedBadge className={classes.verifiedBadge} />}
          avatarImage={TEMP_BEAR_AVATAR_URL}
          bannerImage={TEMP_BANNER_URL}
        >
          {/* TODO: hacky way for mobile view, to clean up */}
          <SocialLinkGroup className={classes.socialLinkGroupMobile} />

          {/* Collection name and creator  */}
          <Box display="flex" flexDirection="column" maxWidth={750}>
            <Text variant="h1" className={classes.collectionName}>
              The Bear Market
            </Text>

            <Text marginTop={1} className={classes.collectionCreator}>
              by Switcheo Labs
            </Text>
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


          {/* NFTs in collection */}
          <Grid container spacing={2} className={classes.nftContainer}>
            {[...Array(10)].map((x, i) => {
              return (
                <Grid item key={i} xs={12} md={3} className={classes.gridItem}>
                  <NftCard />
                </Grid>
              );
            })}
          </Grid>

          {/* Description */}
          <Text className={classes.description}>
            Well we aren't just a bear market. We are The Bear Market. We know
            a couple of fudders who have been releasing bears into the
            unknown, and because of you guys we now have a shelter full of
            lost and lonely bears.As much as we would love to care for all
            these unbearably cuddly bears, we simply can't keep up! Thus we've
            launched The Bear Market, in hope that every one of you will adopt
            one because these koala-ity bears deserve a loving home!
          </Text>
        </ArkBanner>
      </Container >
    </ARKPage >
  );
};

export default Collection;
