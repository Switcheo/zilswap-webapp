import { Container, Typography, Box, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { ArkTab, ArkBanner } from "app/components";
import { useSelector } from "react-redux";
import { RootState, WalletState } from "app/store/types";
import { truncate } from "app/utils";
import { ReactComponent as EditIcon } from "./edit-icon.svg";
import { EditProfile, OfferTable, OfferReceivedTable } from "./components";
import cls from "classnames";
import ARKPage from "app/layouts/ARKPage";
import React, { useState } from "react";


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
  }
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

  return (
    <ARKPage {...rest}>
      {!showEdit && (
        <Container className={classes.root} maxWidth="lg">
          <ArkBanner >
            <Typography variant="h2">Unnamed <EditIcon onClick={() => setShowEdit(true)} className={cls(classes.editIcon, classes.editable)} /></Typography>


            {wallet?.addressInfo && (
              <Box className={classes.addrBox}>
                <Typography variant="body1">{truncate(wallet!.addressInfo.bech32, 5, isXs ? 2 : 5)}</Typography>
              </Box>
            )}

            <Box className={classes.descriptionBox} padding={3}>
              {!description && (
                <Typography onClick={() => setShowEdit(true)} className={cls(classes.editable)}><u>Add a bio</u></Typography>
              )}
            </Box>

          </ArkBanner>
          <ArkTab setCurrentTab={(value) => setCurrentTab(value)} currentTab={currentTab} tabHeaders={["Collected", "Onsale", "Liked", "Offers Made", "Offers Received"]} />
          {(currentTab === "Offers Made") && (
            <OfferTable />
          )}
          {(currentTab === "Offers Received") && (
            <OfferReceivedTable />
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
