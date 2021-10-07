import { Container, Typography, Box, useMediaQuery, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { ArkTab, ArkBanner } from "app/components";
import { useSelector, useDispatch } from "react-redux";
import { RootState, WalletState } from "app/store/types";
import { truncate } from "app/utils";
import { ReactComponent as EditIcon } from "./edit-icon.svg";
import { EditProfile, OfferTable, OfferReceivedTable, Collected } from "./components";
import cls from "classnames";
import ARKPage from "app/layouts/ARKPage";
import React, { useState, useEffect } from "react";
import { FancyButton } from "app/components";
import { actions } from "app/store";

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
    opacity: '0.5'
  },
  editIcon: {
    paddingTop: "4px"
  },
  editable: {
    cursor: "pointer"
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
  const { wallet } = useSelector<RootState, WalletState>(state => state.wallet);
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const [description] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [currentTab, setCurrentTab] = useState("Collected");
  const [addrText, setAddrText] = useState(truncate(wallet?.addressInfo.bech32, 5, isXs ? 2 : 5))
  const dispatch = useDispatch();

  useEffect(() => {
    if (wallet?.addressInfo)
      setAddrText(truncate(wallet?.addressInfo.bech32, 5, isXs ? 2 : 5));
  }, [wallet?.addressInfo, isXs])

  const onConnectWallet = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  const copyAddr = (text: string) => {
    navigator.clipboard.writeText(text);
    setAddrText("Copied");
    setTimeout(() => {
      setAddrText(truncate(wallet?.addressInfo.bech32, 5, isXs ? 2 : 5));
    }, 3000)
  }

  return (
    <ARKPage {...rest}>
      {!showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <ArkBanner >
            <Typography variant="h2">Unnamed <EditIcon onClick={() => setShowEdit(true)} className={cls(classes.editIcon, classes.editable)} /></Typography>
            {wallet?.addressInfo && (
              <Tooltip title="Copy address" placement="top" arrow>
                <Box onClick={() => copyAddr(wallet!.addressInfo.bech32)} className={classes.addrBox}>
                  <Typography variant="body1">{addrText}</Typography>
                </Box>
              </Tooltip>
            )}

            <Box className={classes.descriptionBox} padding={3}>
              {!description && (
                <Typography onClick={() => setShowEdit(true)} className={cls(classes.editable)}><u>Add a bio</u></Typography>
              )}
            </Box>

          </ArkBanner>
          <ArkTab setCurrentTab={(value) => setCurrentTab(value)} currentTab={currentTab} tabHeaders={["Collected", "Onsale", "Liked", "Bids Made", "Bids Received"]} />
          {wallet && (
            <>
              {currentTab === "Collected" && (
                <Collected address={wallet.addressInfo.byte20} />
              )}
              {(currentTab === "Bids Made") && (
                <OfferTable />
              )}
              {(currentTab === "Bids Received") && (
                <OfferReceivedTable />
              )}
            </>
          )}
          {!wallet && (
            <Box mt={12} display="flex" justifyContent="center">
              <Box display="flex" flexDirection="column" textAlign="center"  >
                <Typography className={classes.connectionText} variant="h1">Your wallet is not connected.</Typography>
                <Typography className={classes.connectionText} variant="body1">Please connect your wallet to view this page.</Typography>

                <FancyButton fullWidth onClick={() => onConnectWallet()} className={classes.button} variant="contained" color="primary" >Connect Wallet</FancyButton>
              </Box>
            </Box>
          )}
        </Container>
      )}
      {showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <EditProfile onBack={() => setShowEdit(false)} />
        </Container>
      )}
    </ARKPage >
  );
};

export default Profile;
