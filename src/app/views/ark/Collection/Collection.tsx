import {
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Card,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SvgIcon from "@material-ui/core/SvgIcon";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React from "react";
import { Link } from "react-router-dom";
import { NftCard, SocialLinkGroup } from "./components";
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  breadcrumbs: {
    marginTop: theme.spacing(3),
  },
  breadcrumb: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#6BE1FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  card: {
    marginTop: theme.spacing(3),
    borderRadius: 0,
    boxShadow: "none",
    backgroundColor: "transparent",
    overflow: "inherit",
  },
  bannerImage: {
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "100%",
    backgroundPositionX: "center",
    borderRadius: 5,
  },
  avatar: {
    height: 130,
    width: 130,
    border: "5px solid #0D1B24",
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
  infoBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBox: {
    marginTop: "-65px",
    display: "flex",
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

const Collection: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();

  // fetch nfts in collection

  const breadcrumbs = [
    <Link key="1" to="/ark/collections" className={classes.breadcrumb}>
      Collections
    </Link>,
    <Link
      key="2"
      to={`/ark/collections/${match.params.collection}`}
      className={classes.breadcrumb}
    >
      The Bear Market
    </Link>,
  ];

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        {/* TODO: refactor Breadcrumbs */}
        <Breadcrumbs
          className={classes.breadcrumbs}
          separator={
            <SvgIcon fontSize="small">
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                color="#6BE1FF"
                strokeWidth={1.5}
                stroke="rgba(107, 225, 255, 0.2)"
              />
            </SvgIcon>
          }
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>

        {/* TODO: refactor Info card */}
        <Card className={classes.card}>
          <CardMedia
            component="img"
            alt="Banner Image"
            height="250"
            image="https://pbs.twimg.com/profile_banners/1429715941399486466/1630400388/1500x500"
            className={classes.bannerImage}
          />

          {/* Collection info */}
          <Box className={classes.infoBox}>
            {/* TODO: add tooltip to badge */}
            {/* Avatar */}
            <Box className={classes.avatarBox}>
              <Badge
                overlap="circle"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <VerifiedBadge className={classes.verifiedBadge} />
                }
              >
                <Avatar
                  className={classes.avatar}
                  alt="Avatar Image"
                  src="https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg"
                />
              </Badge>
            </Box>

            <SocialLinkGroup className={classes.socialLinkGroup} />

            {/* Collection name and creator  */}
            <Box display="flex" flexDirection="column" maxWidth={750}>
              <Typography variant="h1" className={classes.collectionName}>
                The Bear Market
              </Typography>

              <Typography className={classes.collectionCreator}>
                by Switcheo Labs
              </Typography>
            </Box>

            {/* TODO: hacky way for mobile view, to clean up */}
            <SocialLinkGroup className={classes.socialLinkGroupMobile} />

            {/* Stats */}
            <Grid container spacing={2} className={classes.statsContainer}>
              <Grid item xs={6} sm={3}>
                <Box className={classes.statsItem}>
                  <Typography className={classes.statsHeader}>
                    Collection Size
                  </Typography>
                  <Typography className={classes.statsContent}>
                    10,000
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box className={classes.statsItem}>
                  <Typography className={classes.statsHeader}>
                    Number of Owners
                  </Typography>
                  <Typography className={classes.statsContent}>
                    8,193
                  </Typography>
                </Box>
              </Grid>

              {/* Need to convert to human number else might overflow */}
              <Grid item xs={6} sm={3}>
                <Box className={classes.statsItem}>
                  <Typography className={classes.statsHeader}>
                    Floor Price
                  </Typography>
                  <Typography className={classes.statsContent}>
                    2,000 ZIL
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box className={classes.statsItem}>
                  <Typography className={classes.statsHeader}>
                    Volume Traded
                  </Typography>
                  <Typography className={classes.statsContent}>
                    1,000 ZIL
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Description */}
            <Typography className={classes.description}>
              Well we aren't just a bear market. We are The Bear Market. We know
              a couple of fudders who have been releasing bears into the
              unknown, and because of you guys we now have a shelter full of
              lost and lonely bears. As much as we would love to care for all
              these unbearably cuddly bears, we simply can't keep up! Thus we've
              launched The Bear Market, in hope that every one of you will adopt
              one because these koala-ity bears deserve a loving home!
            </Typography>
          </Box>
        </Card>

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
      </Container>
    </ARKPage>
  );
};

export default Collection;
