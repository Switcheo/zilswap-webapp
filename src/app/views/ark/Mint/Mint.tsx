import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { toBech32Address } from "@zilliqa-js/crypto";
// import { create } from "ipfs-http-client";
import * as IPFS from "ipfs";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, SimpleMap, useAsyncTask, useNetwork, useToaster } from "app/utils";
import ArkPage from "app/layouts/ArkPage";
import { getMarketplace, getMint, getWallet } from "app/saga/selectors";
import { OAuth } from "app/store/types";
import { actions } from "app/store";
import { ArkClient } from "core/utilities";
import { CollectionDetail, ConfirmMint, MintProgress, NftUpload } from "./components";

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

export type MintImageFiles = {
  profile?: File;
  banner?: File;
}

const collections = ["The Bear Market"];

// const NAV_ITEMS = ["SET UP COLLECTION", "UPLOAD NFTs", "CONFIRM & MINT"];

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const toaster = useToaster();
  const dispatch = useDispatch();
  const { oAuth } = useSelector(getMarketplace);
  const { wallet } = useSelector(getWallet);
  const mintState = useSelector(getMint);
  const address = wallet?.addressInfo.byte20;
  const network = useNetwork();
  const [mintOption, setMintOption] = useState<MintOptionType>("create");
  const [uploadedFiles, setUploadedFiles] = useState<MintImageFiles>({});
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

  const [runQueryProfile] = useAsyncTask("queryProfile");
  const [runQueryMint, loadingQueryMint] = useAsyncTask("queryMint");
  const [runDeployCollection, loadingDeployCollection] = useAsyncTask("deployCollection", (error) => toaster(error.message, { overridePersist: false }));
  const [runUploadImage] = useAsyncTask("uploadImage");

  const pendingMintContract = mintState.activeMintContract;

  useEffect(() => {
    if (address) {
      runQueryMint(async () => {
        const arkClient = new ArkClient(network);

        let newOAuth = oAuth;
        if (!newOAuth?.access_token || (newOAuth?.expires_at && dayjs(newOAuth.expires_at * 1000).isBefore(dayjs()))) {
          const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
          dispatch(actions.MarketPlace.updateAccessToken(result));
          newOAuth = result;
        }
        const response = await arkClient.getOngoingMint(newOAuth!.access_token);

        if (response?.result?.mint)
          dispatch(actions.Mint.addMintContract(response.result.mint));
      })
    }

    // eslint-disable-next-line
  }, [address, network])

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
  }, [])

  const onDeployCollection = () => {
    runDeployCollection(async () => {
      let newOAuth: OAuth | undefined = oAuth;
      const arkClient = new ArkClient(network);

      if (!newOAuth?.access_token || (newOAuth?.expires_at && dayjs(newOAuth.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        newOAuth = result;
      }

      // const ipfsClient = create();

      const node = await IPFS.create({ repo: 'ok' + Math.random() });

      // upload image to ipfs
      const tokens = await Promise.all(nfts.map(async nft => {
        try {
          const attributes = [];
          const image = nft.image as string;
          const data = image.split(",")[1];
          const buffer = Buffer.from(data, "base64");

          const fileAdded = await node.add(buffer);

          // to clean up
          for (const [traitType, value] of Object.entries(nft.attributes)) {
            attributes.push({
              trait_type: traitType,
              value: value,
            })
          }

          return {
            resourceIpfsHash: fileAdded.path,
            metadata: {
              attributes,
              name: nft.name,
            }
          }
        } catch (err) {
          throw err;
        }
      }));

      console.log("tokens: ", tokens);

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

        bannerImageUrl: "",
        profileImageUrl: "",

        ownerName: inputValues.artistName,
        royaltyBps: parseFloat(inputValues.royalties) * 100,
        royaltyType: "default",
      }

      const params = {
        collection,
        tokens,
      }

      console.log("deploying collection...");

      const deployResult = await arkClient.deployCollection(params, newOAuth!.access_token);

      if (deployResult?.result?.mint) {
        const mintContract = deployResult.result.mint;

        console.log("contract: ", mintContract);

        if (uploadedFiles?.profile) {
          imageUpload(mintContract.id, uploadedFiles.profile, newOAuth!.access_token, "profile", arkClient);
        }

        if (uploadedFiles?.banner) {
          imageUpload(mintContract.id, uploadedFiles.banner, newOAuth!.access_token, "banner", arkClient);
        }
  
        dispatch(actions.Mint.addMintContract(mintContract));
      }
    })
  }

  const imageUpload = (mintContractId: string, uploadFile: File, accessToken: string, type: string, arkClient: ArkClient) => {
    runUploadImage(async () => {
      const requestResult = await arkClient.requestMintImageUploadUrl(mintContractId, accessToken, type);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });
    
      console.log("data: ", blobData);
      console.log("url: ", requestResult.result.uploadUrl);

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      await arkClient.notifyMintImageUpload(mintContractId, accessToken, type);
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
  }, [acceptTerms, inputValues.collectionName, inputValues.royalties, nfts, attributes]);

  if (loadingQueryMint)
    return <CircularProgress />

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

            {!pendingMintContract &&
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
                  loadingDeployCollection={loadingDeployCollection}
                />
              </Fragment>
            }

            {pendingMintContract && (
              <MintProgress pendingMintContract={pendingMintContract} />
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
    borderRight: `1px solid rgba${theme.palette.type === "dark"
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
