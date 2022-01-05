import React, { useState } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, SimpleMap } from "app/utils";
import ArkPage from "app/layouts/ArkPage";
import { getWallet } from "app/saga/selectors";
import { CollectionDetail, ConfirmMint, NftUpload } from "./components";

export type CollectionInputs = {
  collectionName: string;
  description: string;
  royalties: string;
  websiteUrl: string;
  discordLink: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramLink: string;
};

export type MintOptionType = "create" | "select";

export type AttributeData = {
  name: string;
  values: string[];
};

export type NftData = {
  id: string;
  image: string | ArrayBuffer | null;
  attributes: SimpleMap<string>;
  imageFile: File;
};

const collections = ["The Bear Market"];

// const NAV_ITEMS = ["SET UP COLLECTION", "UPLOAD NFTs", "CONFIRM & MINT"];

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector(getWallet);
  const [mintOption, setMintOption] = useState<MintOptionType>("create");
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

  const [attributes, setAttributes] = useState<AttributeData[]>([
    {
      name: "",
      values: [],
    },
  ]);
  const [nfts, setNfts] = useState<NftData[]>([]);

  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  return (
    <ArkPage {...rest}>
      <Container
        className={cls(classes.root, className)}
        maxWidth="md"
        disableGutters
      >
        {wallet && (
          <Box>
            {/* <List className={classes.nav}>
              <Box className={classes.navBox}>
                {NAV_ITEMS.map((item, index) => (
                  <li key={`section-${index + 1}`}>
                    <ul>
                      <ListSubheader className={classes.navItem}>
                        {item}
                      </ListSubheader>
                    </ul>
                  </li>
                ))}
              </Box>
            </List> */}

            <Box>
              {/* Set Up Collection */}
              <CollectionDetail
                id="section-1"
                existingCollections={collections}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                mintOption={mintOption}
                setMintOption={setMintOption}
                inputValues={inputValues}
                setInputValues={setInputValues}
                errors={errors}
                setErrors={setErrors}
              />

              {/* Upload NFTs */}
              <NftUpload
                id="section-2"
                nfts={nfts}
                setNfts={setNfts}
                attributes={attributes}
                setAttributes={setAttributes}
              />

              {/* Confirm Mint */}
              <ConfirmMint
                id="section-3"
                acceptTerms={acceptTerms}
                setAcceptTerms={setAcceptTerms}
              />
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
    },
  },
  connectionText: {
    margin: theme.spacing(1),
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
  },
  nav: {
    marginTop: theme.spacing(6),
    paddingTop: 0,
    borderRight: `1px solid rgba${
      theme.palette.type === "dark"
        ? hexToRGBA("#29475A", 1)
        : hexToRGBA("#003340", 0.5)
    }`,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  navBox: {
    position: "sticky",
    top: 0,
  },
  navItem: {
    paddingLeft: 0,
    paddingRight: theme.spacing(2),
    whiteSpace: "nowrap",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
  },
  navCurrent: {
    color: theme.palette.text?.primary,
  },
}));

export default Mint;
