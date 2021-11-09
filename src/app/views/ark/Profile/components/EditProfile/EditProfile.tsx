import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, IconButton, TextField, Typography, Button, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import NavigationPrompt from "react-router-navigation-prompt";
import { useHistory } from "react-router";
import dayjs from "dayjs";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PanoramaIcon from '@material-ui/icons/Panorama';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { ArkClient } from "core/utilities";
import { EMAIL_REGEX, USERNAME_REGEX, TWITTER_REGEX, INSTAGRAM_REGEX } from "app/utils/constants";
import { useAsyncTask, useNetwork, useToaster, useTaskSubscriber, SimpleMap, snakeToTitle } from "app/utils";
import { OAuth } from "app/store/types";
import { ArkInput, FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import { actions } from "app/store";
import ArkPage from "app/layouts/ArkPage";
import { getMarketplace, getWallet } from "app/saga/selectors";
import { ImageDialog, WarningDialog } from "./components";

type ProfileInputs = {
  email: string;
  username: string;
  bio: string;
  websiteUrl: string;
  twitterHandle: string;
  instagramHandle: string;
}

const EditProfile: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const network = useNetwork();
  const history = useHistory();
  const { wallet } = useSelector(getWallet);
  const marketplaceState = useSelector(getMarketplace);
  const address = wallet?.addressInfo.byte20
  const { profile } = marketplaceState;
  const toaster = useToaster(false)
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [bannerImage, setBannerImage] = useState<string | ArrayBuffer | null>(null);
  const [uploadFile, setUploadFile] = useState<SimpleMap<File>>({});
  const [runUpdateProfile, isLoading] = useAsyncTask("updateProfile");
  const [runUploadImage] = useAsyncTask("uploadImage");
  const [runDeleteImage] = useAsyncTask("deleteImage", () => { toaster("Error removing image") })
  const [errors, setErrors] = useState({
    username: "",
    bio: "",
    email: "",
    twitterHandle: "",
    instagramHandle: "",
    websiteUrl: "",
  })
  const [inputValues, setInputValues] = useState<ProfileInputs>({
    username: profile?.username || "",
    bio: profile?.bio || "",
    email: profile?.email || "",
    twitterHandle: profile?.twitterHandle || "",
    instagramHandle: profile?.instagramHandle || "",
    websiteUrl: profile?.websiteUrl || "",
  })
  // const [enableEmailNotification, setEnableEmailNotification] = useState(false);
  const [loadingProfile] = useTaskSubscriber("loadProfile");
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [toRemove, setToRemove] = useState<string | null>(null);

  const hasChange = useMemo(() => {
    if (!profile) return true
    let change = false;
    Object.entries(inputValues).forEach(([key, value]) => {
      const profileValue = (profile as any)[key];
      if (!profileValue && !value) return;
      if (profileValue !== value) {
        change = true;
      }
    })
    return change;
  }, [inputValues, profile])

  const hasError = useMemo(() => {
    const errorString = Object.values(errors).reduce((prev, curr) => prev + curr);
    return !!errorString;
  }, [errors])

  useEffect(() => {
    setInputValues({
      username: profile?.username || "",
      bio: profile?.bio || "",
      email: profile?.email || "",
      twitterHandle: profile?.twitterHandle || "",
      instagramHandle: profile?.instagramHandle || "",
      websiteUrl: profile?.websiteUrl || "",
    })
  }, [profile])


  const onNavigateBack = () => {
    history.push(`/ark/profile`);
  }

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "username":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 20) return "max 20 characters";
        if (!USERNAME_REGEX.test(input)) return "Must only contain alphanumeric or underscore characters";
        return ""
      case "bio":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 160) return "Maximum of 160 characters";
        return ""
      case "email":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 320) return "Maximum of 320 characters";
        if (input.length && !EMAIL_REGEX.test(input)) return "Email is invalid"
        return ""
      case "twitterHandle":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 15) return "Maximum of 15 characters";
        if (input.length && !TWITTER_REGEX.test(input)) return "Must only contain alphanumeric or underscore characters"
        return ""
      case "instagramHandle":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 30) return "Maximum of 30 characters";
        if (input.length && !INSTAGRAM_REGEX.test(input)) return "Must only contain alphanumeric or underscore characters"
        return ""
      case "websiteUrl":
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
      if (!hasChange && !profileImage && !bannerImage)
        return;

      if (!wallet)
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
          imageUpload(uploadFile.profile);
        }
        if (bannerImage && uploadFile.banner) {
          imageUpload(uploadFile.banner, "banner");
        }
        if (hasChange) {
          await arkClient.updateProfile(address!, filteredData, checkedOAuth!);
          toaster("Profile updated");
          dispatch(actions.MarketPlace.loadProfile());
        }
      } catch (error) {
        toaster(`Error updating profile: ${typeof error === "string" ? error : error?.message}`);
      }
    });
  }

  const imageUpload = (uploadFile: File, type = "profile") => {
    runUploadImage(async () => {
      if (!uploadFile || !wallet) return;
      const arkClient = new ArkClient(network);
      const { oAuth } = marketplaceState;
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || oAuth.address !== wallet.addressInfo.bech32 || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }
      const requestResult = await arkClient.requestImageUploadUrl(address!, checkedOAuth!.access_token, type);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      await arkClient.notifyUpload(address!, oAuth!.access_token, type);
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

  const onDelete = (type: string) => {
    runDeleteImage(async () => {
      if (!uploadFile || !wallet || !type) return;
      const arkClient = new ArkClient(network);
      const { oAuth } = marketplaceState;
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || oAuth.address !== wallet.addressInfo.bech32 || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }

      await arkClient.removeImage(address!.toLowerCase(), checkedOAuth!.access_token, type);
      dispatch(actions.MarketPlace.loadProfile());

      toaster(`${type} removed!`);
    })
  }

  const clearOrRemove = (type: string) => {
    switch (type) {
      case "banner":
        if (bannerImage) return setBannerImage(null);
        return setToRemove(type);
      case "profile":
        if (profileImage) return setProfileImage(null);
        return setToRemove(type);
      default: return;
    }
  }

  return (
    <ArkPage {...rest}>
      <Box className={cls(classes.root, className)}>
        <Box className={classes.container}>
          <Box mb={3} justifyContent="flex-start">
            <IconButton onClick={onNavigateBack} className={classes.backButton}>
              <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
            </IconButton>
            <Typography className={classes.pageHeader}>Edit Profile</Typography>
          </Box>
          {wallet && (
            <Box className={classes.content}>
              <Box display="flex" justifyContent="center" paddingLeft={8} paddingRight={8}>
                <Box className={classes.uploadBox}>
                  {(profileImage || profile?.profileImage?.url) && (<img alt="" className={classes.profileImage} src={profileImage?.toString() || profile?.profileImage?.url || ""} />)}
                  {!profileImage && !profile?.profileImage?.url && (<div className={classes.profileImage} />)}
                  <Button onClick={() => setOpenDialog(true)} className={classes.labelButton}>Select</Button>
                  {(profileImage || profile?.profileImage?.url) && (<Button className={classes.deleteButton} onClick={() => clearOrRemove("profile")} >{profileImage ? "Clear" : "Remove"}</Button>)}
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
                  <Typography className={classes.instruction}>Decorate your profile with a banner.&nbsp;<Tooltip placement="top" title="Note that image uploaded will be applied to both dark and light themes on ARK." ><ErrorOutlineIcon fontSize="small" /></Tooltip></Typography>
                  <Box flexGrow={1} />
                  {(bannerImage || profile?.bannerImage?.url) && (<Button className={classes.deleteButton} onClick={() => clearOrRemove("banner")}>{bannerImage ? "Clear" : "Remove"}</Button>)}
                </Box>
                <Dropzone accept='image/jpeg, image/png' onFileDialogCancel={() => setBannerImage(null)} onDrop={onHandleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <Box className={classes.dropBox}>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <Box display="flex" flexDirection="column" justifyContent="center" height="100px">
                          {!bannerImage && !profile?.bannerImage?.url && (
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <PanoramaIcon fontSize="large" />
                              <Typography>Drop a banner image here.</Typography>
                            </Box>
                          )}
                          {(bannerImage || profile?.bannerImage?.url) && <img alt="" className={classes.bannerImage} src={bannerImage?.toString() || profile?.bannerImage?.url || ""} />}
                        </Box>
                      </div>
                    </Box>
                  )}
                </Dropzone>
                <Typography className={cls(classes.instruction, classes.footerInstruction)}>Recommended format: PNG/JPEG &nbsp;|&nbsp; Banner size: 1300 (w) x 250 (h) px</Typography>
                <ArkInput
                  placeholder="BearCollector" error={errors.username} value={inputValues.username}
                  label="DISPLAY NAME" onValueChange={(value) => updateInputs("username")(value)}
                  instruction="This is how other users identify you on ARK." wordLimit={20}
                />
                {/* <ArkInput
                  placeholder="bearsarecute@example.com" error={errors.email} value={inputValues.email}
                  label={
                    <ArkToggle className={classes.switch} initialIsChecked={enableEmailNotification}
                      onCheck={(isChecked: boolean) => setEnableEmailNotification(isChecked)}
                      overrideSm={true} header="EMAIL NOTIFICATIONS" />
                  }
                  onValueChange={(value) => updateInputs("email")(value)} hideInput={!enableEmailNotification}
                  instruction="We'll send you notifications on bid updates, price changes and more."
                />

                <Collapse in={enableEmailNotification}>
                  <Box display="flex" flexDirection="column">
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Item Sold" lineFooter="When someone buys your item."
                    />
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Bid Activity" lineFooter="When someone bids on your item."
                    />
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Auction Expiration" lineFooter="When your auction expires."
                    />
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Successful Purchase" lineFooter="When you buy an item."
                    />
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Successful Bid" lineFooter="When you place a bid on an item."
                    />
                    <ArkCheckbox className={classes.checkbox}
                      lineHeader="Outbid" lineFooter="When someone outbids you in an auction."
                    />
                  </Box>
                </Collapse> */}

                <ArkInput
                  placeholder="My spirit animal's a bear" error={errors.bio} value={inputValues.bio}
                  label="BIO" onValueChange={(value) => updateInputs("bio")(value)} multiline={true}
                  instruction="Write a little about yourself." wordLimit={160}
                />

                <Typography className={classes.social}>SOCIALS</Typography>
                <ArkInput
                  startAdorment={<Typography>@</Typography>} inline={true} placeholder="nftsforlife"
                  error={errors.twitterHandle} value={inputValues.twitterHandle} label="Twitter"
                  onValueChange={(value) => updateInputs("twitterHandle")(value)}
                />
                <ArkInput
                  startAdorment={<Typography>@</Typography>} inline={true} placeholder="nftsforlife"
                  error={errors.instagramHandle} value={inputValues.instagramHandle} label="Instagram"
                  onValueChange={(value) => updateInputs("instagramHandle")(value)} />
                <ArkInput
                  inline={true} placeholder="https://www.example.com" error={errors.websiteUrl} value={inputValues.websiteUrl}
                  label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)}
                />

                <FancyButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  loading={isLoading || loadingProfile}
                  onClick={() => onUpdateProfile(false)}
                  disabled={(!hasChange && !profileImage && !bannerImage) || hasError}
                  className={classes.profileButton}
                >
                  Save Profile
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
        </Box>
        <ImageDialog
          open={openDialog || !!toRemove}
          onCloseDialog={toRemove ? () => setToRemove(null) : () => setOpenDialog(false)}
          onClickConfirm={toRemove ? () => onDelete(toRemove) : () => onNavigateBack()}
          message={toRemove ? `${snakeToTitle(toRemove)} image will be remove!` : undefined}
          buttonText={toRemove ? `Remove` : undefined}
          header={toRemove ? "Banner Image" : undefined}
          cancelText={toRemove ? "Cancel" : undefined}
        />
        <NavigationPrompt when={hasChange}>
          {({ onCancel, onConfirm }) => (
            <WarningDialog
              open={true}
              onCloseDialog={() => { setOpenDialog(false); onCancel(); }}
              onBack={onConfirm}
              clearPrompt={onCancel}
            />
          )}
        </NavigationPrompt>
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
    backgroundColor: "#DEFFFF",
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
    fontSize: 11,
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
  }
}));

export default EditProfile;
