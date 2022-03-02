import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, IconButton, TextField, Typography, Button, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Redirect } from "react-router-dom";
import dayjs from "dayjs";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PanoramaIcon from '@material-ui/icons/Panorama';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/zilliqa";
import { ArkClient } from "core/utilities";
import { useAsyncTask, useNetwork, useToaster, SimpleMap } from "app/utils";
import { CollectionWithStats, OAuth } from "app/store/types";
import { ArkInput, FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import { actions } from "app/store";
import ArkPage from "app/layouts/ArkPage";
import { getMarketplace, getWallet } from "app/saga/selectors";
import { ImageDialog } from "./components";

interface ProfileInputs {
  name: string;
  description: string;
  websiteUrl: string;
  discordUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  ownerName: string;
}

const emptyInputs = () => ({
  name: "",
  description: "",
  websiteUrl: "",
  discordUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  telegramUrl: "",
  ownerName: "",
})


const EditCollection: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  console.log("enter edit collection")
  const { children, className, match, ...rest } = props;
  const classes = useStyles();
  const network = useNetwork();
  const history = useHistory();
  const { wallet } = useSelector(getWallet);
  const marketplaceState = useSelector(getMarketplace);
  const { profile } = marketplaceState;
  const toaster = useToaster(false)
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [bannerImage, setBannerImage] = useState<string | ArrayBuffer | null>(null);
  const [collection, setCollection] = useState<CollectionWithStats>();
  const [uploadFile, setUploadFile] = useState<SimpleMap<File>>({});
  const [runUpdateProfile, isLoading] = useAsyncTask("updateProfile");
  const [runUploadImage] = useAsyncTask("uploadImage");
  const [errors, setErrors] = useState(emptyInputs())
  const [inputValues, setInputValues] = useState<ProfileInputs>(emptyInputs())
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  // const [toRemove, setToRemove] = useState<string | null>(null);

  const { hexAddress } = useMemo(() => {
    if (!match.params?.collection) {
      history.push("/arky/discover");
      return {};
    }

    let collectionAddress = match.params.collection;
    if (collectionAddress?.startsWith("zil1")) {
      return {
        bech32Address: collectionAddress,
        hexAddress: fromBech32Address(collectionAddress)?.toLowerCase(),
      };
    } else {
      history.push(`/arky/mod/${toBech32Address(collectionAddress)}/modify`);
      return {};
    }
    // eslint-disable-next-line
  }, [match.params?.collection]);


  const reloadCollection = async () => {
    if (!hexAddress) return;

    const arkClient = new ArkClient(network);
    const data = await arkClient.listCollection();
    const collection: CollectionWithStats = data.result.entries.find(
      (collection: CollectionWithStats) => collection.address === hexAddress
    );
    if (collection) {
      setCollection(collection);
    } else {
      history.push("/arky/discover");
    }
  };

  // get collection stat data
  useEffect(() => {

    reloadCollection();
    // eslint-disable-next-line
  }, [hexAddress]);

  const hasError = useMemo(() => {
    const errorString = Object.values(errors).reduce((prev, curr) => prev + curr);
    return !!errorString;
  }, [errors])

  const hasChange = useMemo(() => {
    if (!collection) return true
    let change = false;
    Object.entries(inputValues).forEach(([key, value]) => {
      const ogValue = (collection as any)[key];
      if (!ogValue && !value) return;
      if (ogValue !== value) {
        change = true;
        return false;
      }
    })
    return change;
  }, [inputValues, collection])

  useEffect(() => {
    setInputValues({
      ...inputValues,
      description: collection?.description ?? "",
      name: collection?.name ?? "",
      instagramUrl: collection?.instagramUrl ?? "",
      discordUrl: collection?.discordUrl ?? "",
      websiteUrl: collection?.websiteUrl ?? "",
      twitterUrl: collection?.twitterUrl ?? "",
      telegramUrl: collection?.telegramUrl ?? "",
      ownerName: collection?.ownerName ?? "",
    })

    // eslint-disable-next-line
  }, [collection])


  const onNavigateBack = () => {
    if (!collection)
      history.push("/arky");
    else
      history.push(`/arky/collections/${collection.address}`);
  }

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "username":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 20) return "max 20 characters";
        return ""
      case "ownerName":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 160) return "Maximum of 160 characters";
        return ""
      case "websiteUrl":
      case "discordUrl":
      case "instagramUrl":
      case "twitterUrl":
      case "telegramUrl":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 253) return "Maximum of 253 characters";
        if (!input.match(/^(http|https):\/\//g)) return "Invalid URL, it should begin with http:// or https://";
        return ""
      default: return "";
    }
  }

  const updateInputs = (type: string) => {
    return (newInput: string) => {
      setInputValues({ ...inputValues, [type]: newInput })
      if (!newInput) {
        setErrors({ ...errors, [type]: "" })
        return
      }
      const errorText = validateInput(type, newInput)
      setErrors({ ...errors, [type]: errorText })
    }
  }

  const onImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files[0]) {
      return setProfileImage(null);
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      setUploadFile({ ...uploadFile, profile: files[0] });
    }

    reader.readAsDataURL(files[0]);
  }

  const onUpdateProfile = (goBack?: boolean) => {
    runUpdateProfile(async () => {
      if (!profileImage && !bannerImage && !hasChange)
        return;

      if (!wallet || !collection?.address)
        return;

      let ok = true
      let filteredData: any = {};
      Object.entries(inputValues).forEach(([key, value]) => {
        const previous = profile ? (profile as any)[key] : null
        if (previous !== value) {
          if (value === '' && !previous) return
          filteredData[key] = value;
          const errorText = validateInput(key, value)
          if (errorText !== "") {
            ok = false
            setErrors({ ...errors, [key]: errorText })
          }
        }
      })
      if (!ok) {
        toaster("Invalid inputs")
        return
      }

      try {
        const arkClient = new ArkClient(network);
        const { oAuth } = marketplaceState;
        let checkedOAuth: OAuth | undefined = oAuth;
        if (!oAuth?.access_token || oAuth.address !== wallet.addressInfo.bech32 || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
          const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
          dispatch(actions.MarketPlace.updateAccessToken(result));
          checkedOAuth = result;
        }
        if (profileImage && uploadFile.profile) {
          imageUpload(uploadFile.profile, "profile", checkedOAuth!.access_token);
        }
        if (bannerImage && uploadFile.banner) {
          imageUpload(uploadFile.banner, "banner", checkedOAuth!.access_token);
        }
        if (hasChange) {
          await arkClient.updateCollection(collection.address, filteredData, checkedOAuth!);
          toaster("Collection updated");
          reloadCollection();
        }
      } catch (error) {
        toaster(`Error updating collection: ${typeof error === "string" ? error : error?.message}`);
      }
    });
  }

  const imageUpload = (uploadFile: File, type = "profile", accessToken: string) => {
    runUploadImage(async () => {
      if (!uploadFile || !wallet || !collection?.address) return;
      const arkClient = new ArkClient(network);
      const requestResult = await arkClient.requestCollectionImageUploadUrl(collection.address, accessToken, type);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      dispatch(actions.MarketPlace.loadProfile());
      toaster("Image updated");
    })
  }

  const onHandleDrop = (files: any, rejection: FileRejection[], dropEvent: DropEvent) => {

    if (!files.length) {
      return setBannerImage(null);
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setBannerImage(reader.result);
      setUploadFile({ ...uploadFile, banner: files[0] });
    }

    reader.readAsDataURL(files[0]);
  }

  // const clearOrRemove = (type: string) => {
  //   switch (type) {
  //     case "banner":
  //       if (bannerImage) return setBannerImage(null);
  //       return setToRemove(type);
  //     case "profile":
  //       if (profileImage) return setProfileImage(null);
  //       return setToRemove(type);
  //     default: return;
  //   }
  // }

  const disableSave = (isLoading) || (!profileImage && !bannerImage && !hasChange) || hasError;

  console.log("load profile", profile?.admin)
  if (!profile?.admin)
    return <Redirect to="/arky" />

  return (
    <ArkPage {...rest}>
      <Box className={cls(classes.root, className)}>
        <Box className={classes.container}>
          <Box mb={3} justifyContent="flex-start">
            <IconButton onClick={onNavigateBack} className={classes.backButton}>
              <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
            </IconButton>
            <Typography className={classes.pageHeader}>Edit Collection</Typography>
          </Box>
          {wallet && (
            <Box className={classes.content}>
              <Box display="flex" justifyContent="center" paddingLeft={8} paddingRight={8}>
                <Box className={classes.uploadBox}>
                  {(profileImage || collection?.profileImageUrl) && (<img alt="" className={classes.profileImage} src={profileImage?.toString() || collection?.profileImageUrl || ""} />)}
                  {!profileImage && !collection?.profileImageUrl && (<div className={classes.profileImage} />)}
                  <Button onClick={() => setOpenDialog(true)} className={classes.labelButton}>Select</Button>
                  {/* {(profileImage || collection?.profileImageUrl) && (<Button className={classes.deleteButton} onClick={() => clearOrRemove("profile")} >{profileImage ? "Clear" : "Remove"}</Button>)} */}
                </Box>
                <TextField
                  className={classes.uploadInput}
                  id="ark-profile-image"
                  type="file"
                  ref={inputRef}
                  inputProps={{ accept: "image/x-png,image/jpeg" }}
                  onChange={onImageUpload}
                />
              </Box>
              <Box className={classes.formDetail}>

                <Typography className={classes.social}>BANNER</Typography>
                <Box display="flex">
                  <Typography className={classes.instruction}>Decorate your profile with a banner.&nbsp;
                    <Tooltip placement="top" title="Note that image uploaded will be applied to both dark and light themes on ARK." >
                      <InfoIcon className={classes.infoIcon} />
                    </Tooltip>
                  </Typography>
                  <Box flexGrow={1} />
                  {/* {(bannerImage || collection?.bannerImageUrl) && (<Button className={classes.deleteButton} onClick={() => clearOrRemove("banner")}>{bannerImage ? "Clear" : "Remove"}</Button>)} */}
                </Box>
                <Dropzone accept='image/jpeg, image/png' onFileDialogCancel={() => setBannerImage(null)} onDrop={onHandleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <Box className={classes.dropBox}>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <Box display="flex" flexDirection="column" justifyContent="center" height="100px">
                          {!bannerImage && !collection?.bannerImageUrl && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <PanoramaIcon fontSize="large" />
                              <Typography>Drop a banner image here.</Typography>
                            </Box>
                          )}
                          {(bannerImage || collection?.bannerImageUrl) && <img alt="" className={classes.bannerImage} src={bannerImage?.toString() || collection?.bannerImageUrl || ""} />}
                        </Box>
                      </div>
                    </Box>
                  )}
                </Dropzone>
                <Typography className={cls(classes.instruction, classes.footerInstruction)}>Recommended format: PNG/JPEG &nbsp;|&nbsp; Banner size: 1300 (w) x 250 (h) px</Typography>
                <ArkInput
                  className={classes.input}
                  placeholder="The Bear Market" error={errors.name} value={inputValues.name}
                  label="COLLECTION NAME" onValueChange={(value) => updateInputs("name")(value)}
                  instruction="This is how other users identify you on ARKY." wordLimit={20}
                />

                <ArkInput
                  className={classes.input}
                  placeholder="Switcheo Labs" error={errors.ownerName} value={inputValues.ownerName}
                  label="OWNER NAME" onValueChange={(value) => updateInputs("ownerName")(value)}
                  instruction="The collection owner's name." wordLimit={20}
                />

                <ArkInput
                  className={classes.input}
                  placeholder="My spirit animal's a bear" error={errors.description} value={inputValues.description}
                  label="DESCRIPTION" onValueChange={(value) => updateInputs("description")(value)} multiline={true}
                  instruction="Write a little about the collection." wordLimit={160}
                />

                <Typography className={classes.social}>SOCIALS</Typography>
                <ArkInput
                  className={classes.input}
                  inline={true} placeholder="https://www.example.com" error={errors.websiteUrl} value={inputValues.websiteUrl}
                  label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)}
                />
                <ArkInput
                  className={classes.input}
                  inline={true} placeholder="https://www.example.com" error={errors.discordUrl} value={inputValues.discordUrl}
                  label="Discord" onValueChange={(value) => updateInputs("discordUrl")(value)}
                />
                <ArkInput
                  className={classes.input}
                  inline={true} placeholder="https://www.example.com" error={errors.instagramUrl} value={inputValues.instagramUrl}
                  label="Instagram" onValueChange={(value) => updateInputs("instagramUrl")(value)}
                />
                <ArkInput
                  className={classes.input}
                  inline={true} placeholder="https://www.example.com" error={errors.twitterUrl} value={inputValues.twitterUrl}
                  label="Twitter" onValueChange={(value) => updateInputs("twitterUrl")(value)}
                />
                <ArkInput
                  className={classes.input}
                  inline={true} placeholder="https://www.example.com" error={errors.telegramUrl} value={inputValues.telegramUrl}
                  label="Telegram" onValueChange={(value) => updateInputs("telegramUrl")(value)}
                />

                <FancyButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  loading={isLoading}
                  onClick={() => onUpdateProfile(false)}
                  disabled={disableSave}
                  className={classes.profileButton}
                >
                  Save Collection
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

          <ImageDialog
            open={openDialog}
            onCloseDialog={() => setOpenDialog(false)}
            onClickConfirm={() => onNavigateBack()}
          />
        </Box>
      </Box>
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
  container: {
    maxWidth: "680px",
    display: "row",
  },
  content: {
    fontFamily: "'Raleway', sans-serif",
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row-reverse",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  },
  formDetail: {
    minWidth: 400,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      minWidth: 280,
    }
  },
  profileButton: {
    marginTop: theme.spacing(2),
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px",
    width: "100%",
    borderRadius: "12px",
    backgroundColor: "#6BE1FF",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:disabled": {
      backgroundColor: "#6BE1FF88",
      "& .MuiButton-label": {
        color: "#00334088",
      },
    },
  },
  backButton: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    opacity: "50%",
    borderRadius: "12px",
    padding: theme.spacing(1, 2),
    fontFamily: "'Raleway', sans-serif",
    marginBottom: theme.spacing(3),
    transform: "translateX(-18px)",
  },
  extraMargin: {
    marginLeft: theme.spacing(2),
    fontFamily: "'Raleway', sans-serif",
  },
  profileImage: {
    height: 110,
    width: 110,
    border: `5px solid ${theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF"}`,
    borderRadius: "50%",
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF",
    alignSelf: "center"
  },
  uploadInput: {
    display: "none",
  },
  uploadText: {
    opacity: "50%",
    fontSize: "14px",
    fontFamily: "'Raleway', sans-serif",
  },
  uploadBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  connectionText: {
    margin: theme.spacing(1),
    fontFamily: "'Raleway', sans-serif",
  },
  labelButton: {
    borderRadius: 8,
    padding: "8px 16px",
    maxWidth: 80,
    alignSelf: "center",
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    cursor: "pointer",
    marginBottom: theme.spacing(1),
    "&:hover": {
      opacity: 0.5,
    }
  },
  social: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "14px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    marginTop: theme.spacing(1)
  },
  switch: {
    paddingBottom: 0,
    fontFamily: "'Raleway', sans-serif",
  },
  checkbox: {
    marginBottom: theme.spacing(1),
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
  },
  dropBox: {
    borderRadius: 12,
    border: `2px dotted ${theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF"}`,
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
    overflow: "hidden",
    cursor: "pointer",
  },
  bannerImage: {
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "100%",
    backgroundPositionX: "center",
    borderRadius: 5,
    backgroundColor: "#29475A",
    width: "inherit",
    height: "inherit",
    objectFit: "cover",
    cursor: "pointer",
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 12,
    margin: theme.spacing(0.4, 0),
    display: "flex",
    alignItems: "center",
  },
  footerInstruction: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 10,
  },
  deleteButton: {
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    borderRadius: theme.spacing(1),
    fontSize: 10,
    textDecoration: "underline",
    padding: theme.spacing(.5),
    maxWidth: 80,
  },
  infoIcon: {
    verticalAlign: "text-top",
    fontSize: "1rem",
  },
  input: {
    "& .MuiFormControl-root": {
      marginBottom: theme.spacing(2),
    }
  }
}));

export default EditCollection;
