import React, { Fragment, useEffect, useState } from "react";
import { Avatar, Badge, Box, Container, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { ArkBidsTable, ArkBreadcrumb, ArkTab } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain } from "app/saga/selectors";
import { Cheque, Nft, Profile, TraitValue } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { ReactComponent as VerifiedBadge } from "../Collection/verified-badge.svg";
import { BidDialog, BuyDialog, NftImage, SalesDetail, SellDialog, TraitTable } from "./components";

const NftView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [token, setToken] = useState<Nft>();
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [bids, setBids] = useState<Cheque[]>([]);
  const [runGetBids] = useAsyncTask("getBids");
  const [owner, setOwner] = useState<Profile>();
  const [runGetOwner] = useAsyncTask("getOwner");
  const [currentTab, setCurrentTab] = useState("Bids");
  const [traits, setTraits] = useState<TraitValue[]>([])

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    const arkClient = new ArkClient(network);
    runGetNFTDetails(async () => {
      const address = fromBech32Address(collectionId).toLowerCase()
      const { result } = await arkClient.getNftToken(address, tokenId);
      setToken(result.model);
      setTraits(result.model.traitValues);

      const { model: { owner } } = result
      if (owner) {
        runGetOwner(async () => {
          const ownerResult = await arkClient.getProfile(owner.address);
          setOwner(ownerResult.result.model)
        })
      }
    })
    runGetBids(async () => {
      const collectionAddress = fromBech32Address(collectionId).toLowerCase()
      const result = await arkClient.getNftCheques({ collectionAddress, tokenId });

      setBids(result.result.entries);
    })
    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);

  const breadcrumbs = [
    { path: "/ark/collections", value: "Collections" },
    {
      path: `/ark/collections/${collectionId}`,
      value: "The Bear Market",
    },
    {
      path: `/ark/collections/${collectionId}/${tokenId}`,
      value: `#${tokenId}`,
    },
  ];

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBreadcrumb linkPath={breadcrumbs} />

        {/* Nft image and main info */}
        <Box display="flex" mt={3} justifyContent="center" className={classes.imageInfoContainer}>
          <NftImage className={classes.bearImage} token={token} />
          <SalesDetail className={classes.mainInfoBox} tokenId={tokenId} token={token} />
        </Box>

        {/* About info and trait table */}
        <Box mt={4} display="flex" className={classes.smColumn}>
          <Box display="flex" flexDirection="column" className={classes.aboutContainer}>
            <Typography variant="h1">About</Typography>
            <Typography className={classes.aboutText}>Well we aren't just a bear market. We are The Bear Market. We know a couple of fudders who have been releasing bears into the unknown, and because of you guys we now have a shelter full of lost and lonely bears.</Typography>
            <Typography className={classes.aboutText}> As much as we would love to care for all these unbearably cuddly bears, we simply can't keep up! Thus we've launched The Bear Market.</Typography>
            <Typography className={classes.aboutText}> Learn more at thebear.market.</Typography>
            <Box className={classes.xsColumn} mt={4} display="flex" justifyContent="center">
              <Box flexGrow={1}>
                <MenuItem className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon><Avatar className={classes.avatar} alt="owner" src={owner?.profileImage?.url || ""} /></ListItemIcon>
                  <Box marginLeft={1}>
                    <Typography>Owner</Typography>
                    <Typography variant="h3" className={classes.aboutNameText}>{owner?.username || "Unnamed"}</Typography>
                    <Typography>Lvl 1</Typography>
                  </Box>
                </MenuItem>
              </Box>
              <Box flexGrow={1}>
                <MenuItem className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon>
                    <Badge
                      overlap="circle"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <VerifiedBadge />
                      }
                    >
                      <Avatar className={classes.avatar} sizes="medium" alt="Remy Sharp" src={""} />
                    </Badge>
                  </ListItemIcon>
                  <Box marginLeft={1}>
                    <Typography className={classes.halfOpacity}>Creator</Typography>
                    <Typography variant="h3" className={classes.aboutNameText}>Switcheo Labs</Typography>
                    <Typography>10% Royalties</Typography>
                  </Box>
                </MenuItem>
              </Box>
            </Box>
          </Box>
          <Box flexGrow={1} flexDirection="column" className={classes.traitContainer}>
            <TraitTable traits={traits} />
          </Box>
        </Box>


        {/*Ark tabs */}
        <ArkTab setCurrentTab={(tab: string) => { setCurrentTab(tab) }} currentTab={currentTab} tabHeaders={["Bids", "Price History", "Event History"]} />

        <Box className={classes.bidsBox}>
          {currentTab === "Bids" && (
            <ArkBidsTable bids={bids} />
          )}
        </Box>

        {/* Other info and price history */}
        <Box display="flex" mt={3}>
          {/* Other Info */}
          {/* Price History */}
        </Box>
      </Container >
      {token && (
        <Fragment>
          <BuyDialog token={token} collectionAddress={collectionId} />
          <BidDialog token={token} collectionAddress={collectionId} />
          <SellDialog />
        </Fragment>
      )}
    </ArkPage >
  );
};


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
  mainInfoBox: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    padding: theme.spacing(8),
    borderRadius: 12,
    border: "1px solid #29475A",
    marginRight: theme.spacing(20),
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      width: "100%",
      marginRight: theme.spacing(16),
    },
    [theme.breakpoints.down("xs")]: {
      marginRight: 0,
    },
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "22px",
    height: "22px",
    verticalAlign: "text-bottom",
  },
  bidsBox: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(3, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  bidsHeader: {
    fontSize: "26px",
    lineHeight: "40px",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    color: "#DEFFFF",
  },
  bearImage: {
    paddingTop: theme.spacing(8),
    right: -theme.spacing(16),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      right: -theme.spacing(12),
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      right: "0",
      marginBottom: theme.spacing(1)
    }
  },
  imageInfoContainer: {
    [theme.breakpoints.down("sm")]: {
      left: theme.spacing(4),
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  },
  halfOpacity: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText
  },
  aboutText: {
    opacity: 0.5,
    color: theme.palette.primary.contrastText,
    marginTop: theme.spacing(1),
    fontSize: 14,
    lineHeight: 1.4,
  },
  aboutContainer: {
    maxWidth: 450,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(7, 6),
    borderRadius: 12,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      maxWidth: "none",
    },
  },
  traitContainer: {
    display: "flex",
    minWidth: 400,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(4, 5),
    borderRadius: 12,
    marginLeft: theme.spacing(2),
    overflowX: 'auto',
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      minWidth: 0,
      marginTop: theme.spacing(2),
    },
  },
  aboutMenuItem: {
    extend: 'text',
    padding: "0",
    maxWidth: 200,
    margin: 0,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1),
    },
  },
  avatar: {
    width: 65,
    height: 65,
  },
  aboutNameText: {
    color: "#6BE1FF",
    fontWeight: "bold",
  },
  xsColumn: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    }
  },
  smColumn: {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  }
}));

export default NftView;