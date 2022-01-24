import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { toBech32Address } from "@zilliqa-js/crypto";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, SimpleMap, useAsyncTask, useNetwork } from "app/utils";
import ArkPage from "app/layouts/ArkPage";
import { getWallet } from "app/saga/selectors";
import { ArkClient } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { CollectionDetail, ConfirmMint, LoadingMint, NftUpload } from "./components";
import { Network } from "zilswap-sdk/lib/constants";

export type CollectionInputs = {
  collectionName: string;
  description: string;
  artistName: string;
  royalties: string;
  websiteUrl: string;
  discordUrl: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramUrl: string;
};

export type MintOptionType = "create" | "select";

export type AttributeData = {
  name: string;
  values: string[];
};

export type NftData = {
  name: string;
  image: string | ArrayBuffer | null;
  attributes: SimpleMap<string>;
};

export type MintProgressType = {
  hasDeployed: boolean;
  hasMinted: boolean;
  hasAcceptOwnership: boolean;
}

const collections = ["The Bear Market"];

// const NAV_ITEMS = ["SET UP COLLECTION", "UPLOAD NFTs", "CONFIRM & MINT"];

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector(getWallet);
  const address = wallet?.addressInfo.byte20;
  const network = useNetwork();
  const [mintOption, setMintOption] = useState<MintOptionType>("create");
  const [uploadedFiles, setUploadedFiles] = useState<SimpleMap<File>>({});
  const [inputValues, setInputValues] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    artistName: "",
    royalties: "2.5",
    websiteUrl: "",
    discordUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramUrl: "",
  });
  const [errors, setErrors] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    artistName: "",
    royalties: "",
    websiteUrl: "",
    discordUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramUrl: "",
  });

  const [attributes, setAttributes] = useState<AttributeData[]>([]);
  const [nfts, setNfts] = useState<NftData[]>([]);

  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const [mintProgress, setMintProgress] = useState<MintProgressType>({
    hasDeployed: false,
    hasMinted: false,
    hasAcceptOwnership: false,
  })

  const [showLoadingMint, setShowLoadingMint] = useState<boolean>(false);

  const [runQueryProfile] = useAsyncTask("queryProfile");
  const [runDeployCollection] = useAsyncTask("deployCollection");

  useEffect(() => {
    if (address) {
      runQueryProfile(async () => {
        const arkClient = new ArkClient(network);
  
        const { result: { model } } = await arkClient.getProfile(address.toLowerCase());
        setInputValues({ 
          ...inputValues, 
          "artistName": model?.username ?? toBech32Address(address)
        })
      })
    }

    // eslint-disable-next-line
  }, [address, network])

  const onDeployCollection = () => {
    setShowLoadingMint(true);
    
    runDeployCollection(async () => {
      const arkClient = new ArkClient(network);
      const zilswap = ZilswapConnector.getSDK();

      const collection = {
        name: inputValues.collectionName,
        description: inputValues.description,
        address: "",
        verifiedAt: null,
        websiteUrl: inputValues.websiteUrl,
        discordUrl: inputValues.discordUrl,
        telegramUrl: inputValues.websiteUrl,
        twitterUrl: inputValues.twitterHandle,
        instagramUrl: inputValues.instagramHandle,

        bannerImageUrl: "https://arkstatic.s3.ap-southeast-1.amazonaws.com/prod/tbm-banner.png",
        profileImageUrl: "https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg",

        ownerName: inputValues.artistName,
        royaltyBps: parseFloat(inputValues.royalties) * 100,
        royaltyType: "default",
      }

      const params = {
        collection,
        nfts,
      }

      console.log("deploying collection...");

      const deployResult = await arkClient.deployCollection(address!, params);

      const contract = deployResult.result.contract;

      console.log("contract: ", contract);

      console.log("calling accept ownership...");
      await arkClient.acceptContractOwnership(toBech32Address(contract.address), zilswap);
    })
  }

  const isMintEnabled = useMemo(() => {
    // t&c unchecked
    if (!acceptTerms)
      return false;
    
    // compulsory fields
    if (!inputValues.collectionName || !inputValues.royalties)
      return false;

    // no nft uploaded
    if (nfts.length === 0)
      return false;
    
    // unfilled attribute data
    for (const attribute of attributes) {
      if (!attribute.name || !attribute.values.length)
        return false;
    }

    // unfilled nft attributes
    for (const nft of nfts) {
      if (!nft.name)
        return false;
    
      if (Object.keys(nft.attributes).length !== attributes.length)
        return false;
    }

    return true;
  }, [acceptTerms, inputValues.collectionName, inputValues.royalties, nfts, attributes])

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

            {!showLoadingMint && 
              <Fragment>
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
                  onDeployCollection={onDeployCollection}
                  isMintEnabled={isMintEnabled}
                />
              </Fragment>
            }

            {showLoadingMint && (
              <LoadingMint setShowLoadingMint={setShowLoadingMint} />
            )}
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
