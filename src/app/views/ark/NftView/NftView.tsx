import React, { Fragment, useEffect, useState, useMemo } from "react";
import { Avatar, Badge, Box, Container, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Transaction } from "@zilliqa-js/account";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArkBidsTable, ArkBreadcrumb, ArkTab, ArkOwnerLabel, ArkBox } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getMarketplace, getWallet } from "app/saga/selectors";
import { Nft, Profile } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, useAsyncTask } from "app/utils";
import { ArkClient, waitForTx } from "core/utilities";
import { fromBech32Address } from "core/zilswap";
import { actions } from "app/store";
import { ReactComponent as VerifiedBadge } from "../CollectionView/verified-badge.svg";
import { BidDialog, BuyDialog, CancelDialog, NftImage, SalesDetail, TraitTable } from "./components";

const NftView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { bidsTable, pendingTxs } = useSelector(getMarketplace);
  const { wallet } = useSelector(getWallet);
  const [token, setToken] = useState<Nft>();
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [runGetBids] = useAsyncTask("getBids");
  const [owner, setOwner] = useState<Profile>();
  const [runGetOwner] = useAsyncTask("getOwner");
  const [currentTab, setCurrentTab] = useState("Bids");

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  const royaltiesPercent = useMemo(() => {
    const royaltyBps = token?.collection?.royaltyBps;
    if (!royaltyBps) return null;

    const percent = bnOrZero(royaltyBps).shiftedBy(-2).decimalPlaces(2);
    return percent.toFormat();
  }, [token?.collection]);

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [collectionId, tokenId, network]);

  useEffect(() => {
    if (wallet) {
      getNFTDetails();
    }
    // eslint-disable-next-line
  }, [wallet])

  const onCancelListing = async (txs: Transaction[]) => {
    await Promise.all(txs.map(tx => waitForTx(tx.id!, 300, 1000)));

    // wait 3s for backend to sync
    await new Promise(resolve => setTimeout(resolve, 3000));

    getData();
  };

  const getData = () => {
    getNFTDetails();
    getBids();
  }

  const getBids = () => {
    runGetBids(async () => {
      dispatch(actions.MarketPlace.updateBidsTable(undefined));

      const arkClient = new ArkClient(network);
      const collectionAddress = fromBech32Address(collectionId).toLowerCase();
      const result = await arkClient.listNftCheques({ collectionAddress, tokenId, side: "buy" });

      dispatch(actions.MarketPlace.updateBidsTable({
        bids: result.result.entries,
        collectionAddress,
        tokenId,
        side: "buy",
      }));
    })
  }

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

  const isCancelling = token?.bestAsk && !!Object.values(pendingTxs).find(tx => tx.chequeHash === token?.bestAsk?.chequeHash);

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
          <NftImage className={classes.nftImage} token={token} rounded={true} />
          {token && <SalesDetail className={classes.mainInfoBox} tokenId={tokenId} token={token} isCancelling={isCancelling} tokenUpdatedCallback={() => getNFTDetails()} />}
        </Container>

        {/* About info and trait table */}
        <Box mt={4} display="flex" className={classes.smColumn}>
          <ArkBox variant="base" display="flex" flexDirection="column" className={classes.aboutContainer}>
            <Typography className={classes.aboutHeader} variant="h1">About</Typography>
            <Typography className={classes.aboutText}>
              {token?.collection?.description}
            </Typography>
            <Box className={classes.xsColumn} mt={4} display="flex" justifyContent="center">
              <Box flexGrow={1} marginRight={1}>
                <MenuItem component={Link} to={`/ark/profile?address=${owner?.address}`} className={classes.aboutMenuItem} button={false}>
                  <ListItemIcon><Avatar className={classes.avatar} alt="owner" src={owner?.profileImage?.url || ""} /></ListItemIcon>
                  <Box className={classes.aboutItemText}>
                    <Typography>Owner</Typography>
                    <ArkOwnerLabel user={owner} />
                  </Box>
                </MenuItem>
              </Box>
              {token?.collection?.ownerName &&
                <Box flexGrow={1}>
                  <MenuItem className={classes.aboutMenuItem} button={false}>
                    <ListItemIcon style={{ paddingBottom: 5 }}>
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
                    <Box className={classes.aboutItemText}>
                      <Typography>Creator</Typography>
                      <Typography variant="h3" className={classes.aboutNameText}>{token?.collection?.ownerName}</Typography>
                      {royaltiesPercent && (
                        <Typography>{royaltiesPercent}% Royalties</Typography>
                      )}
                    </Box>
                  </MenuItem>
                </Box>
              }
            </Box>
          </ArkBox>
          <ArkBox variant="base" className={classes.traitContainer}>
            {token && <TraitTable token={token} />}
          </ArkBox>
        </Box>


        {/*Ark tabs */}
        <ArkTab mt={3} setCurrentTab={(tab: string) => { setCurrentTab(tab) }} currentTab={currentTab} tabHeaders={["Bids", "Price History", "Event History"]} />

        {currentTab === "Bids" && (
          <ArkBidsTable bids={bidsTable?.bids ?? []} showItem={false} />
        )}
        {currentTab === "Price History" && (
          <ArkBox variant="base" className={classes.comingSoon}>Coming Soon.</ArkBox>
        )}
        {currentTab === "Event History" && (
          <ArkBox variant="base" className={classes.comingSoon}>Coming Soon.</ArkBox>
        )}
        {/* Price History */}
        {/* Event History */}
      </Container >
      {token && (
        <Fragment>
          <BuyDialog token={token} collectionAddress={collectionId} onComplete={getData} />
          <BidDialog token={token} collectionAddress={collectionId} onComplete={getData} />
          <CancelDialog token={token} onComplete={onCancelListing} />
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
    alignItems: "center",
    marginTop: theme.spacing(3),
    display: "flex",
    [theme.breakpoints.down(850)]: {
      flexDirection: "column",
    },
  },
  nftImage: {
    maxWidth: 450,
    marginTop: 35,
    position: "relative",
    width: "50vw",
    [theme.breakpoints.down(850)]: {
      padding: theme.spacing(0, 4),
      width: "100%",
      marginBottom: theme.spacing(2),
    },
  },
  mainInfoBox: {
    flex: 1,
    marginLeft: theme.spacing(-10),
    paddingLeft: theme.spacing(10),
    [theme.breakpoints.down(850)]: {
      marginLeft: theme.spacing(0),
      paddingLeft: theme.spacing(0),
      width: "100%",
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
  aboutContainer: {
    color: theme.palette.text!.primary,
    maxWidth: 450,
    padding: theme.spacing(7, 6),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 3),
      maxWidth: "none",
    },
  },
  aboutHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 1.4,
    opacity: 0.8,
  },
  traitContainer: {
    minWidth: 400,
    flex: 1,
    padding: theme.spacing(4, 5),
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: "0",
    maxWidth: 200,
    margin: 0,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1),
    },
  },
  aboutItemText: {
    display: 'flex',
    margin: theme.spacing(0.5, 0, 0.5, 1),
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    color: theme.palette.text!.primary,
    opacity: 0.8,
  },
  avatar: {
    width: 52,
    height: 52,
  },
  aboutNameText: {
    fontSize: 14,
    fontWeight: 700,
    maxWidth: 100,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
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
  },
  comingSoon: {
    margin: theme.spacing(3, 0),
    padding: theme.spacing(3),
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  }
}));

export default NftView;
