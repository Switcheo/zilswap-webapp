import React, { useState } from "react";
import { Box, Checkbox, Container, Divider, FormControlLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { AppTheme } from "app/theme/types";
import { SimpleMap } from "app/utils";
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

export type AttributeData = {
  name: string;
  values: string[];
}

export type NftData = {
  id: string;
  image: string | ArrayBuffer | null;
  attributes: SimpleMap<string>;
  imageFile: File;
}

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector(getWallet);
  const [mintOption, setMintOption] = useState<string>("create");
  const [uploadedFiles, setUploadedFiles] = useState<SimpleMap<File>>({});
  const [inputValues, setInputValues] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    royalties: "2.5",
    websiteUrl: "",
    discordLink: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramLink: "",
  });
  const [errors, setErrors] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    royalties: "",
    websiteUrl: "",
    discordLink: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramLink: "",
  });

  const [attributes, setAttributes] = useState<AttributeData[]>([{
    name: "",
    values: [],
  }]);
  const [nfts, setNfts] = useState<NftData[]>([]);

  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  return (
    <ArkPage {...rest}>
      <Container className={cls(classes.root, className)} maxWidth="md" disableGutters>
        {wallet && (
          <Box display="flex">
            <Divider orientation="vertical" className={classes.nav} flexItem/>

            <Box>
              {/* Set Up Collection */}
              <CollectionDetail 
                uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                mintOption={mintOption} setMintOption={setMintOption} 
                inputValues={inputValues} setInputValues={setInputValues} 
                errors={errors} setErrors={setErrors}
              />

              {/* Upload NFTs */}
              <NftUpload nfts={nfts} setNfts={setNfts} attributes={attributes} setAttributes={setAttributes} />

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

                <FancyButton variant="contained" color="primary" className={classes.mintButton} disabled={!acceptTerms}>
                  Mint NFTs
                </FancyButton>
              </Box>
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
    maxWidth: 500,
  },
  confirmMintText: {
    fontSize: "13px",
    lineHeight: "16px",
  },
  nav: {
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
}));

export default Mint;
