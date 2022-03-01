import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { toBech32Address } from "@zilliqa-js/crypto";
import * as IPFS from "ipfs";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useNetwork, useToaster } from "app/utils";
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
  symbol: string;
  royalties: string;
  websiteUrl: string;
  discordUrl: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramUrl: string;
};

export type Errors = {
  collectionName: string;
  description: string;
  artistName: string;
  symbol: string;
  royalties: string;
  websiteUrl: string;
  discordUrl: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramUrl: string;
  nfts: string;
}

export type MintOptionType = "create" | "select";

export type AttributeData = {
  name: string;
  values: string[];
};

export type NftData = {
  name: string;
  image: string | ArrayBuffer | null;
  attributes: ArkClient.TokenTrait[];
};

export type MintImageFiles = {
  profile?: File;
  banner?: File;
}

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
    symbol: "",
    royalties: "2.5",
    websiteUrl: "",
    discordUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramUrl: "",
  });
  const [errors, setErrors] = useState<Errors>({
    collectionName: "",
    description: "",
    artistName: "",
    symbol: "",
    royalties: "",
    websiteUrl: "",
    discordUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramUrl: "",
    nfts: "",
  });

  const [attributes, setAttributes] = useState<AttributeData[]>([]);
  const [nfts, setNfts] = useState<NftData[]>([]);

  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [displayErrorBox, setDisplayErrorBox] = useState<boolean>(false);

  const [runQueryProfile] = useAsyncTask("queryProfile");
  const [runQueryMint, loadingQueryMint] = useAsyncTask("queryMint");
  const [runDeployCollection, loadingDeployCollection] = useAsyncTask("deployCollection", (error) => toaster(error.message, { overridePersist: false }));
  const [runUploadImage] = useAsyncTask("uploadImage");

  const pendingMintContract = mintState.activeMintContract;

  const isMintEnabled = useMemo(() => {
    // errors not empty
    if (Object.values(errors).some(err => !!err))
      return false;
    
    // t&c unchecked
    if (!acceptTerms)
      return false;

    // compulsory fields
    if (!inputValues.collectionName || !inputValues.royalties || !inputValues.symbol || !inputValues.artistName)
      return false;

    // no nft uploaded
    if (nfts.length === 0)
      return false;

    // duplicate attribute name
    const attributeNames = new Set(attributes.map(attribute => attribute.name));
    if (attributeNames.size < attributes.length)
      return false;

    // unfilled attribute data
    for (const attribute of attributes) {
      if (!attribute.name || !attribute.values.length)
        return false;
    }

    // unfilled nft data
    for (const nft of nfts) {
      if (!nft.name)
        return false;

      if (Object.values(nft.attributes).length !== attributes.length)
        return false;

      for (const attr of nft.attributes) {
        if (Object.values(attr).some(data => !data)) {
          return false;
        }
      }
    }

    return true;
  }, [acceptTerms, inputValues.collectionName, inputValues.symbol, inputValues.royalties, inputValues.artistName, nfts, attributes, errors]);

  useEffect(() => {
    if (isMintEnabled) setDisplayErrorBox(false);
  }, [isMintEnabled])

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

        if (pendingMintContract && pendingMintContract.status === "completed")
          dispatch(actions.Mint.dismissMintContract(pendingMintContract));

        if (response?.result?.mint)
          dispatch(actions.Mint.addMintContract(response.result.mint));
      })
    }

    // eslint-disable-next-line
  }, [address, network])

  useEffect(() => {
    if (address) {
      runQueryProfile(async () => {
        let artistName;
        try {
          const arkClient = new ArkClient(network);

          const { result: { model } } = await arkClient.getProfile(address.toLowerCase());
          artistName = model?.username ?? toBech32Address(address);
        } catch (e) {
          artistName = toBech32Address(address);
        }

        setInputValues({
          ...inputValues,
          artistName,
        })
      })
    }

    // eslint-disable-next-line
  }, [address, network])

  const onDeployCollection = () => {
    if (!isMintEnabled) {
      setDisplayErrorBox(true);
      handleDisplayErrors();
      return;
    }
    
    runDeployCollection(async () => {
      let newOAuth: OAuth | undefined = oAuth;
      const arkClient = new ArkClient(network);

      if (!newOAuth?.access_token || (newOAuth?.expires_at && dayjs(newOAuth.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        newOAuth = result;
      }

      const node = await IPFS.create({ repo: 'ok' + Math.random() });

      // upload image to ipfs
      const tokens = await Promise.all(nfts.map(async nft => {
        try {
          const image = nft.image as string;
          const data = image.split(",")[1];
          const buffer = Buffer.from(data, "base64");

          const fileAdded = await node.add(buffer);

          return {
            resourceIpfsHash: fileAdded.path,
            metadata: {
              attributes: nft.attributes,
              name: nft.name,
            }
          }
        } catch (err) {
          throw err;
        }
      }));

      const collection = {
        name: inputValues.collectionName,
        symbol: inputValues.symbol,
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
      };

      const deployResult = await arkClient.deployCollection(params, newOAuth!.access_token);

      if (deployResult?.result?.mint) {
        const mintContract = deployResult.result.mint;

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

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      await arkClient.notifyMintImageUpload(mintContractId, accessToken, type);
    })
  }

  const handleDisplayErrors = () => {
    const displayErrors: any = {};

    if (!inputValues.collectionName)
      errors.collectionName = "Enter a collection name."

    if (!inputValues.symbol)
      errors.symbol = "Enter a token symbol."
    
    if (!nfts.length)
      errors.nfts = "No files uploaded."
    
    setErrors({
      ...errors,
      ...displayErrors,
    })
  }

  if (loadingQueryMint)
    return (
      <Box className={classes.circularProgressBox}>
        <CircularProgress />
      </Box>
    )

  return (
    <ArkPage {...rest}>
      <Container
        className={cls(classes.root, className)}
        maxWidth="md"
        disableGutters
      >
        {wallet && (
          <Box>
            {!pendingMintContract &&
              <Fragment>
                {/* Set Up Collection */}
                <CollectionDetail
                  id="section-1"
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
                  errors={errors}
                  setErrors={setErrors}
                  displayErrorBox={displayErrorBox}
                />

                {/* Confirm Mint */}
                <ConfirmMint
                  id="section-3"
                  acceptTerms={acceptTerms}
                  setAcceptTerms={setAcceptTerms}
                  onDeployCollection={onDeployCollection}
                  displayErrorBox={displayErrorBox}
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
  circularProgressBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(8),
  }
}));

export default Mint;
