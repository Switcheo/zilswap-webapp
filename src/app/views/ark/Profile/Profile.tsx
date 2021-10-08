import {
  Box,
  Container,
  Tooltip,
  Typography,
  useMediaQuery
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { ArkBanner, ArkTab } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { MarketPlaceState, Profile as ProfileType, RootState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate, useAsyncTask, useNetwork } from "app/utils";
import cls from "classnames";
import { ArkClient } from "core/utilities";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Collected,
  EditProfile,
  OfferReceivedTable,
  OfferTable
} from "./components";
import { ReactComponent as EditIcon } from "./edit-icon.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  addrBox: {
    padding: "8px 24px",
    borderRadius: "12px",
    backgroundColor: "rgba(222, 255, 255, 0.1)",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    opacity: 0.9,
    alignSelf: "center",
    width: "fit-content",
    cursor: "pointer",
  },
  descriptionBox: {
    border: "1px solid #003340",
    boxSizing: "border-box",
    borderRadius: "12px",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
    minWidth: 320,
    textAlign: "center",
    color: "#DEFFFF",
    opacity: "0.5",
  },
  editIcon: {
    paddingTop: "4px",
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
}));

const Profile: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector<RootState, WalletState>(
    (state) => state.wallet
  );
  const { profile: storeProfile } = useSelector<RootState, MarketPlaceState>(
    (state) => state.marketplace
  );
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const [showEdit, setShowEdit] = useState(false);
  const [currentTab, setCurrentTab] = useState("Collected");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const address = queryParams.get("address");
  const [viewProfile, setViewProfile] = useState<ProfileType | null>(null);
  const [addrText, setAddrText] = useState<string | undefined>(undefined);
  const [profileIsOwner, setProfileIsOwner] = useState(false);
  const network = useNetwork();
  const [runQueryProfile] = useAsyncTask("queryProfile");

  useEffect(() => {
    checkProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (storeProfile?.address || !wallet?.addressInfo.bech32) {
      checkProfile();
    }

    // eslint-disable-next-line
  }, [storeProfile, wallet?.addressInfo.bech32])

  const checkProfile = () => {
    if (((storeProfile?.address && !address) || (storeProfile?.address && storeProfile?.address === address)) && wallet?.addressInfo.bech32) {
      setViewProfile(storeProfile);
      setProfileIsOwner(true);
      setAddrText(truncate(toBech32Address(storeProfile?.address), 5, isXs ? 2 : 5))
    } else {
      if (address) {
        getProfile(address);
      } else {
        setViewProfile(null);
      }
      setProfileIsOwner(false);
    }
  }

  const getProfile = (address: string) => {
    runQueryProfile(async () => {
      const arkClient = new ArkClient(network);
      const { result: { model } } = await arkClient.getProfile(address);
      setViewProfile(model);
      setAddrText(truncate(toBech32Address(model?.address), 5, isXs ? 2 : 5))
    })
  }

  const copyAddr = (text: string) => {
    navigator.clipboard.writeText(text);
    setAddrText("Copied");
    setTimeout(() => {
      setAddrText(truncate(wallet?.addressInfo.bech32, 5, isXs ? 2 : 5));
    }, 3000);
  };

  let tabHeaders = ["Collected", "For Sale", "Liked"];
  if (profileIsOwner) tabHeaders = tabHeaders.concat(["Bids Made", "Bids Received",])

  return (
    <ArkPage {...rest}>
      {!showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <ArkBanner>
            {viewProfile && (
              <Typography variant="h2">
                {viewProfile.username || "Unnamed"}{" "}
                {profileIsOwner && (
                  <EditIcon
                    onClick={() => setShowEdit(true)}
                    className={cls(classes.editIcon, classes.editable)}
                  />
                )}
              </Typography>
            )}
            {viewProfile && (
              <Tooltip title="Copy address" placement="top" arrow>
                <Box
                  onClick={() => copyAddr(toBech32Address(viewProfile.address))}
                  className={classes.addrBox}
                >
                  <Typography variant="body1">{addrText}</Typography>
                </Box>
              </Tooltip>
            )}

            {viewProfile && (
              <Box className={classes.descriptionBox} padding={3}>
                {!viewProfile.bio && (
                  <Typography
                    onClick={() => profileIsOwner && setShowEdit(true)}
                    className={cls(classes.editable)}
                  >
                    <u>Add a bio</u>
                  </Typography>
                )}
                {viewProfile.bio && (
                  <Typography>{viewProfile.bio}</Typography>
                )}
              </Box>
            )}
          </ArkBanner>
          <ArkTab
            setCurrentTab={(value) => setCurrentTab(value)}
            currentTab={currentTab}
            tabHeaders={tabHeaders}
          />
          {viewProfile && (
            <>
              {currentTab === "Collected" && (
                <Collected address={viewProfile?.address} />
              )}
              {(currentTab === "Bids Made") && profileIsOwner && <OfferTable />}
              {(currentTab === "Bids Received") && profileIsOwner && <OfferReceivedTable />}
            </>
          )}
          {(!wallet && !address) && (
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
          )}
        </Container>
      )}
      {showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <EditProfile wallet={wallet} profile={storeProfile} onBack={() => setShowEdit(false)} />
        </Container>
      )}
    </ArkPage>
  );
};

export default Profile;
