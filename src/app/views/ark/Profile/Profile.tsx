import { Container, Typography, Box, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React from "react";
import { ArkTab, ArkBanner } from "app/components";
import { useSelector } from "react-redux";
import { RootState, WalletState } from "app/store/types";
import { truncate } from "app/utils";


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
}));

const Profile: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector<RootState, WalletState>(state => state.wallet);
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <ArkBanner >
          {/* get user name from marketplace store */}
          <Typography variant="h2">Unnamed</Typography>

          {wallet?.addressInfo && (
            <Box className={classes.addrBox}>
              <Typography variant="body1">{truncate(wallet!.addressInfo.bech32, 5, isXs ? 2 : 5)}</Typography>
            </Box>
          )}
        </ArkBanner>
        <ArkTab tabHeaders={["Offers", "Onsale", "Collected", "Liked"]} />
      </Container>
    </ARKPage>
  );
};

export default Profile;
