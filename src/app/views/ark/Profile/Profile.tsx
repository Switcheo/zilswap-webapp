import React, { Fragment, useEffect, useState } from "react";
import {
  Box,
  Container,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArkClient } from "core/utilities";
import { ArkBanner, ArkTab } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { actions } from "app/store";
import { MarketPlaceState, Profile, RootState, WalletState, OAuth } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useNetwork, useTaskSubscriber, useToaster } from "app/utils";
import { truncateAddress } from "app/utils";
import {
  BidsMade,
  BidsReceived,
  Nfts,
} from "./components";
import { ReactComponent as EditIcon } from "./edit-icon.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  badge: {
    backgroundColor: theme.palette.background.contrast,
  },
  addressBox: {
    textAlign: 'center',
    width: '100%',
    marginTop: theme.spacing(0.5),
  },
  addressBadge: {
    extend: 'badge',
    borderRadius: "12px",
    padding: "8px 24px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    alignSelf: "center",
    width: "fit-content",
    cursor: "pointer",
    margin: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  bioBox: {
    width: 480,
    maxWidth: '90%',
    boxSizing: "border-box",
    borderRadius: "12px",
    textAlign: "center",
    color: theme.palette.text?.primary,
    opacity: 0.8,
    margin: 'auto',
    marginTop: theme.spacing(3),
    '&.border': {
      border: theme.palette.border,
      filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
    }
  },
  textLink: {
    fontSize: 12,
    color: theme.palette.text?.primary,
  },
  editIcon: {
    display: 'inline-block',
    lineHeight: 0,
    marginLeft: 8,
    marginRight: -31,
    padding: 7,
    borderRadius: 3,
    '& svg': {
      width: 13,
      height: 13,
      fill: theme.palette.type === "dark" ? undefined : "#0D1B24",
    },
    '&:hover': {
      extend: 'badge',
      cursor: 'pointer',
      '& svg > path': {
        stroke: "#00FFB0",
      },
    }
  },
  button: {
    padding: "16px",
    margin: theme.spacing(2, 0, 0),
    minHeight: "50px",
  },
  connectionText: {
    margin: theme.spacing(1),
  },
  tabs: {
    marginTop: theme.spacing(5),
  }
}));

const normalizeAddress = (addr?: string | null) => {
  try {
    if (!addr) {
      return null
    }
    if (addr.startsWith('0x')) {
      return toBech32Address(addr)
    }
    if (addr.startsWith('zil1') && !!fromBech32Address(addr)) {
      return addr
    }
    return null
  } catch (error) {
    return null
  }
}

const ProfilePage: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const { wallet } = useSelector<RootState, WalletState>(state => state.wallet);
  const { profile: connectedProfile, oAuth } = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const [currentTab, setCurrentTab] = useState("Collected");
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [tooltipText, setTooltipText] = useState<string>('Copy address');
  const network = useNetwork();
  const dispatch = useDispatch();
  const toaster = useToaster(false);
  const [runQueryProfile] = useAsyncTask("queryProfile");
  const [runBannerUpload] = useAsyncTask("uploadBanner");
  const [isloading] = useTaskSubscriber("uploadBanner", "queryProfile", "loadProfile")

  const urlSearchParams = new URLSearchParams(window.location.search);
  const paramAddress = normalizeAddress(urlSearchParams.get('address'))
  const connectedAddress = normalizeAddress(wallet?.addressInfo.bech32)

  const hasParam = paramAddress && paramAddress.length > 0
  const address = hasParam ? paramAddress : connectedAddress
  const isConnectedUser = hasParam ? connectedAddress === address : true

  useEffect(() => {
    if (isConnectedUser && connectedProfile) {
      setViewProfile(connectedProfile)
    } else if (address) {
      runQueryProfile(async () => {
        const arkClient = new ArkClient(network);

        const hexAddr = fromBech32Address(address);
        const { result: { model } } = await arkClient.getProfile(hexAddr.toLowerCase());
        setViewProfile(model);
      })
    }
    // eslint-disable-next-line
  }, [address, connectedProfile, network])

  const copyAddr = (text: string) => {
    navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
    setTimeout(() => {
      setTooltipText("Copy address");
    }, 2000);
  };

  let tabHeaders = ["Collected", "For Sale", "Liked", "Bids Made"];
  if (isConnectedUser) tabHeaders = tabHeaders.concat(["Bids Received"])

  const currentTabBody = () => {
    if (!address) return null
    const hexAddress = fromBech32Address(address)

    switch (currentTab) {
      case 'Collected': return <Nfts address={hexAddress} filter='collected' />
      case 'For Sale': return <Nfts address={hexAddress} filter='onSale' />
      case 'Liked': return <Nfts address={hexAddress} filter='liked' />
      case 'Bids Made': return <BidsMade address={hexAddress} />
      case 'Bids Received': return isConnectedUser && <BidsReceived address={hexAddress} />
      default: return null
    }
  }

  const bannerUpload = (uploadFile: File, type = "banner") => {
    runBannerUpload(async () => {
      if (!uploadFile || !wallet) return;

      const arkClient = new ArkClient(network);
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || oAuth.address !== wallet.addressInfo.bech32 || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }
      const requestResult = await arkClient.requestImageUploadUrl(wallet.addressInfo.byte20, checkedOAuth!.access_token, type);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      await arkClient.notifyUpload(wallet.addressInfo.byte20, oAuth!.access_token, type);
      dispatch(actions.MarketPlace.loadProfile())
      toaster("Banner updated");
    })
  }

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBanner uploadBanner={bannerUpload} bannerImage={isloading ? undefined : viewProfile?.bannerImage?.url} avatarImage={isloading ? undefined : viewProfile?.profileImage?.url} />

        <Box className={classes.addressBox}>
          {address &&
            <Fragment>
              <Typography variant="h2">
                {viewProfile?.username || truncateAddress(address || '')}
                {isConnectedUser &&
                  <Box className={classes.editIcon}>
                    <Link to={`/ark/profile/${address}/edit`}>
                      <EditIcon />
                    </Link>
                  </Box>
                }
              </Typography>
              <Tooltip title={tooltipText} placement="right" arrow>
                <Box
                  onClick={() => address && copyAddr(address)}
                  className={classes.addressBadge}
                >
                  <Typography variant="body1">
                    {truncateAddress(address || '', isXs)}
                  </Typography>
                </Box>
              </Tooltip>
            </Fragment>
          }
        </Box>

        {
          isConnectedUser && address && !viewProfile?.bio &&
          <Box className={classes.bioBox} padding={3}>
            <Link className={classes.textLink} to={`/ark/profile/${address}/edit`}>
              <u>Add Bio</u>
            </Link>
          </Box>
        }
        {
          viewProfile?.bio &&
          <Box className={cls(classes.bioBox, { border: isConnectedUser && address })} padding={3}>
            <Typography>
              {viewProfile?.bio}
              {isConnectedUser && address &&
                <Link className={classes.textLink} to={`/ark/profile/${address}/edit`} style={{ marginLeft: 8 }}>
                  <u>Edit</u>
                </Link>
              }
            </Typography>
          </Box>
        }

        <ArkTab
          className={classes.tabs}
          setCurrentTab={(value) => setCurrentTab(value)}
          currentTab={currentTab}
          tabHeaders={tabHeaders}
        />
        {
          (!wallet && !address) ?
            <Box mt={12} display="flex" justifyContent="center">
              <Box display="flex" flexDirection="column" textAlign="center">
                <Typography className={classes.connectionText} variant="h1">
                  Your wallet is not connected.
                </Typography>
                <Typography className={classes.connectionText} variant="body1">
                  Please connect your wallet to view this page.
                </Typography>
              </Box>
            </Box>
            :
            currentTabBody()
        }
      </Container>
    </ArkPage>
  );
};

export default ProfilePage;
