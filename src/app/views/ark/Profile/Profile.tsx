import React, { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { ArkClient } from "core/utilities";
import { ArkBanner, ArkTab } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { MarketPlaceState, Profile, RootState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useNetwork } from "app/utils";
import { truncateAddress } from "app/utils";
import {
  BidsMade,
  BidsReceived,
  Nfts,
  EditProfile
} from "./components";
import { ReactComponent as EditIcon } from "./edit-icon.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  badge: {
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
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
    border: "1px solid #29475A",
    boxSizing: "border-box",
    borderRadius: "12px",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
    textAlign: "center",
    color: theme.palette.text?.primary,
    opacity: 0.8,
    margin: 'auto',
    marginTop: theme.spacing(3),
  },
  addBio: {
    fontSize: 14,
  },
  editIcon: {
    display: 'inline-block',
    lineHeight: 0,
    marginLeft: 8,
    marginRight: -31,
    padding: 7,
    borderRadius: 3,
    '& > svg': {
      width: 13,
      height: 13,
      fill: theme.palette.type === "dark" ? undefined : "#0D1B24",
    },
    '&:hover': {
      extend: 'badge',
      cursor: 'pointer',
      '& > svg > path': {
        stroke: "#00FFB0",
      },
    }
  },
  editable: {
    cursor: "pointer",
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
  const { profile: connectedProfile } = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const [showEdit, setShowEdit] = useState(false);
  const [currentTab, setCurrentTab] = useState("Collected");
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [tooltipText, setTooltipText] = useState<string>('Copy address');
  const network = useNetwork();
  const [runQueryProfile] = useAsyncTask("queryProfile");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const paramAddress = normalizeAddress(urlSearchParams.get('address'))
  const connectedAddress = normalizeAddress(wallet?.addressInfo.bech32)

  const hasParam = paramAddress && paramAddress.length > 0
  const address = hasParam ? paramAddress : connectedAddress
  const isConnectedUser = hasParam ? connectedAddress === address : true

  useEffect(() => {
    if (isConnectedUser) {
      setViewProfile(connectedProfile!)
    } else if (address) {
      runQueryProfile(async () => {
        const arkClient = new ArkClient(network);
        try {
          const hexAddr = fromBech32Address(address!)
          const { result: { model } } = await arkClient.getProfile(hexAddr);
          setViewProfile(model);
        } catch (err) {
          console.error(err)
        }
      })
    }
    // eslint-disable-next-line
  }, [address, connectedProfile, network])

  useEffect(() => {
    if (connectedProfile && isConnectedUser) {
      setViewProfile(connectedProfile);
    }
    // eslint-disable-next-line
  }, [connectedProfile])

  const copyAddr = (text: string) => {
    navigator.clipboard.writeText(text);
    setTooltipText("Copied!");
    setTimeout(() => {
      setTooltipText("Copy address");
    }, 2000);
  };

  let tabHeaders = ["Collected", "For Sale", "Liked", "Bids Made"];
  if (isConnectedUser) tabHeaders = tabHeaders.concat(["Bids Received"])

  if (!viewProfile && !isConnectedUser) return <ArkPage {...rest} /> // loading profile data

  const currentTabBody = () => {
    if (!address) return null
    const hexAddress = fromBech32Address(address)

    switch (currentTab) {
      case 'Collected': return <Nfts address={hexAddress} filter='collected' />
      case 'For Sale': return <Nfts address={hexAddress} filter='onSale' />
      case 'Liked': return <Nfts address={hexAddress} filter='liked' />
      case 'Bids Made': return <BidsMade address={hexAddress} />
      case 'Bids Received': return isConnectedUser && <BidsReceived />
      default: return null
    }
  }

  return (
    <ArkPage {...rest}>
      {!showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <ArkBanner avatarImage={viewProfile?.profileImage?.url} />

          <Box className={classes.addressBox}>
            {address && [
              <Typography variant="h2">
                {viewProfile?.username || truncateAddress(address || '')}
                {isConnectedUser && (
                  <Box className={classes.editIcon}>
                    <EditIcon
                      onClick={() => setShowEdit(true)}
                      className={cls(classes.editable)}
                    />
                  </Box>
                )}
              </Typography>,
              <Tooltip title={tooltipText} placement="right" arrow>
                <Box
                  onClick={() => address && copyAddr(address)}
                  className={classes.addressBadge}
                >
                  <Typography variant="body1">{truncateAddress(address || '', isXs)}</Typography>
                </Box>
              </Tooltip>
            ]}
          </Box>

          {
            isConnectedUser && !viewProfile?.bio &&
            <Box className={classes.bioBox} padding={3}>
              <Typography
                onClick={() => setShowEdit(true)}
                className={cls(classes.addBio, classes.editable)}
              >
                <u>Add Bio</u>
              </Typography>
            </Box>
          }
          {
            viewProfile?.bio &&
            <Box className={classes.bioBox} padding={3}>
              <Typography>{viewProfile?.bio}</Typography>
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
      )}
      {showEdit && (
        <EditProfile wallet={wallet} profile={viewProfile} onBack={() => setShowEdit(false)} />
      )}
    </ArkPage>
  );
};

export default ProfilePage;
