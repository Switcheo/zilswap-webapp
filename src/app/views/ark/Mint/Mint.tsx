import React, { useState } from "react";
import { Box, Checkbox, Container, FormControlLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { AppTheme } from "app/theme/types";
import ArkPage from "app/layouts/ArkPage";
import { getWallet } from "app/saga/selectors";
import { FancyButton } from "app/components";
import { CollectionDetail, NftUpload } from "./components";

export type CollectionInputs = {
  collectionName: string;
  description: string;
  royalties: string;
  websiteUrl: string;
  discordLink: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramLink: string;
}

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector(getWallet);
  const [inputValues, setInputValues] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    royalties: "2.5",
    websiteUrl: "",
    discordLink: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramLink: "",
  })
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  return (
    <ArkPage {...rest}>
      <Container className={cls(classes.root, className)} maxWidth="sm">
        {wallet && (
          <Box>
            {/* Set Up Collection */}
            <CollectionDetail setInputValues={setInputValues} inputValues={inputValues} />

            {/* Upload NFTs */}
            <NftUpload />

            {/* Confirm Mint */}
            <Box mt={5}>
              <Box mb={4}>
                <Typography className={classes.pageHeader}>3. Confirm Mint</Typography>
              </Box>

              <Typography className={classes.confirmMintText}>
                Please ensure that all information is correct before minting your collection.
                {" "}
                <span className={classes.warningText}>Your NFTs cannot be edited once they have been minted.</span>
              </Typography>

              {/* Terms */}
              <Box className={classes.termsBox}>
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radioButton}
                      checkedIcon={<CheckedIcon />}
                      icon={<UncheckedIcon fontSize="small" />}
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(!acceptTerms)}
                      disableRipple
                    />
                  }
                  label={
                    <Typography className={classes.confirmMintText}>
                      By checking this box, I accept ARKY's terms and conditions.
                    </Typography>
                  }
                />
              </Box>

              <FancyButton variant="contained" color="primary" className={classes.mintButton}>
                Mint NFTs
              </FancyButton>
            </Box>
          </Box>
        )}
        {!wallet && (
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
    </ArkPage>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Raleway', sans-serif",
    [theme.breakpoints.down("sm")]: {
      alignItems: "normal",
    }
  },
  connectionText: {
    margin: theme.spacing(1),
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
  },
  warningText: {
    color: "#FF5252",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  termsBox: {
    display: "flex",
    justifyContent: "flex-start",
    marginLeft: 2,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    "& .MuiFormControlLabel-root": {
      marginLeft: "-8px",
      marginRight: 0,
    },
  },
  mintButton: {
    height: 46,
  },
  confirmMintText: {
    fontSize: "13px",
    lineHeight: "16px",
  },
}));

export default Mint;