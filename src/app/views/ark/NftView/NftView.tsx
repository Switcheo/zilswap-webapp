import React, { Fragment, useEffect, useState, useMemo } from "react";
import { Avatar, Badge, Box, Container, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArkBidsTable, ArkBreadcrumb, ArkTab, ArkOwnerLabel } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { Cheque, Nft, Profile } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { ReactComponent as VerifiedBadge } from "../CollectionView/verified-badge.svg";
import { BidDialog, BuyDialog, CancelDialog, NftImage, SalesDetail, TraitTable } from "./components";

const NftView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const [token, setToken] = useState<Nft>();
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [bids, setBids] = useState<Cheque[]>([]);
  const [runGetBids] = useAsyncTask("getBids");
  const [owner, setOwner] = useState<Profile>();
  const [runGetOwner] = useAsyncTask("getOwner");
  const [currentTab, setCurrentTab] = useState("Bids");

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  const royaltiesPercent = useMemo(() => {
    const royaltyBps = token?.collection?.royaltyBps;
    if (!royaltyBps) return null;

    const percent = bnOrZero(royaltyBps).shiftedBy(-4).decimalPlaces(2);
    return percent.toFormat();
  }, [token?.collection]);

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    getNFTDetails()
    runGetBids(async () => {
      const arkClient = new ArkClient(network);
      const collectionAddress = fromBech32Address(collectionId).toLowerCase();
      const result = await arkClient.listNftCheques({ collectionAddress, tokenId, side: "buy" });

      setBids(result.result.entries);
    })
    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);

  useEffect(() => {
    if (wallet) {
      getNFTDetails();
    }
    // eslint-disable-next-line
  }, [wallet])

  const getNFTDetails = (bypass?: boolean) => {
    runGetNFTDetails(async () => {
      const arkClient = new ArkClient(network);
      const address = fromBech32Address(collectionId).toLowerCase()
      const viewerAddress = wallet?.addressInfo.byte20.toLowerCase()
      const { result } = await arkClient.getNftToken(address, tokenId, viewerAddress);
      setToken(result.model);

      const { model: { owner } } = result
      if (owner && !bypass) {
        runGetOwner(async () => {
          const ownerResult = await arkClient.getProfile(owner.address.toLowerCase());
          setOwner(ownerResult.result.model)
        })
      }
    })
  }

  const breadcrumbs = [
    { path: "/ark/collections", value: "Collections" },
    {
      path: `/ark/collections/${collectionId}`,
      value: `${token?.collection?.name}`,
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
        <Container disableGutters className={classes.imageInfoContainer}>
          <NftImage onReload={getNFTDetails} className={classes.nftImage} token={token} />
          <SalesDetail className={classes.mainInfoBox} tokenId={tokenId} token={token} />
        </Container>

        {/* About info and trait table */}
        <Box mt={4} display="flex" className={classes.smColumn}>
          <Box display="flex" flexDirection="column" className={classes.aboutContainer}>
            <Typography variant="h1">About</Typography>
            <Typography className={classes.aboutText}>
              {token?.collection?.description}
            </Typography>
            <Box className={classes.xsColumn} mt={4} display="flex" justifyContent="center">
              <Box flexGrow={1} marginRight={1}>
                <MenuItem component={Link} to={`/ark/profile?address=${owner?.address}`} className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon><Avatar className={classes.avatar} alt="owner" src={owner?.profileImage?.url || ""} /></ListItemIcon>
                  <Box marginLeft={1}>
                    <Typography>Owner</Typography>
                    <ArkOwnerLabel user={owner} />
                    <Typography>{""}</Typography>
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
                      <Avatar className={classes.avatar} sizes="medium" alt="Collection owner" src={""} />
                    </Badge>
                  </ListItemIcon>
                  <Box marginLeft={1}>
                    {token?.collection?.ownerName && (
                      <Fragment>
                        <Typography className={classes.halfOpacity}>Creator</Typography>
                        <Typography variant="h3" className={classes.aboutNameText}>{token?.collection?.ownerName}</Typography>
                      </Fragment>
                    )}
                    {royaltiesPercent && (
                      <Typography>{royaltiesPercent}% Royalties</Typography>
                    )}
                  </Box>
                </MenuItem>
              </Box>
            </Box>
          </Box>
          <Box className={classes.traitContainer}>
            <TraitTable token={token} />
          </Box>
        </Box>


        {/*Ark tabs */}
        <ArkTab mt={3} setCurrentTab={(tab: string) => { setCurrentTab(tab) }} currentTab={currentTab} tabHeaders={["Bids",/* "Price History", "Event History" */]} />

        {currentTab === "Bids" && (
          <ArkBidsTable bids={bids} />
        )}
        {/* Price History */}
        {/* Event History */}
      </Container >
      {token && (
        <Fragment>
          <BuyDialog token={token} collectionAddress={collectionId} />
          <BidDialog token={token} collectionAddress={collectionId} />
          <CancelDialog token={token} />
        </Fragment>
      )}
    </ArkPage >
  );
};


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
      paddingBottom: theme.spacing(3),
    },
    paddingBottom: '30vh',
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
  imageInfoContainer: {
    marginTop: theme.spacing(3),
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  nftImage: {
    maxWidth: 450,
    paddingTop: theme.spacing(8),
    position: "relative",
    width: "50vw",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 4),
      maxWidth: "unset",
      width: "100%",
    },
  },
  mainInfoBox: {
    flex: 1,
    marginLeft: theme.spacing(-10),
    paddingLeft: theme.spacing(10),
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(0),
      paddingLeft: theme.spacing(0),
    },
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "22px",
    height: "22px",
    verticalAlign: "text-bottom",
  },
  bidsHeader: {
    fontSize: "26px",
    lineHeight: "40px",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    color: "#DEFFFF",
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
    border: theme.palette.border,
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(7, 6),
    borderRadius: 12,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      maxWidth: "none",
    },
  },
  traitContainer: {
    minWidth: 400,
    flex: 1,
    border: theme.palette.border,
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
