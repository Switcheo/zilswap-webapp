import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, IconButton, TextField, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import NavigationPrompt from "react-router-navigation-prompt";
import { useHistory } from "react-router";
import dayjs from "dayjs";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ArkClient } from "core/utilities";
import { EMAIL_REGEX, USERNAME_REGEX, TWITTER_REGEX, INSTAGRAM_REGEX } from "app/utils/constants";
import { useAsyncTask, useNetwork, useToaster, useTaskSubscriber } from "app/utils";
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
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [runUpdateProfile, isLoading] = useAsyncTask("updateProfile");
  const [runUploadImage] = useAsyncTask("uploadImage");
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
  const toaster = useToaster(false)
  const dispatch = useDispatch();
  const [loadingProfile] = useTaskSubscriber("loadProfile");
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

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
      setUploadFile(files[0]);
    }

    reader.readAsDataURL(files[0]);
  }

  const onUpdateProfile = (goBack?: boolean) => {
    runUpdateProfile(async () => {
      if (!hasChange && !profileImage)
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
        if (profileImage && uploadFile) {
          imageUpload();
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

  const imageUpload = () => {
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
      const requestResult = await arkClient.requestImageUploadUrl(address!, checkedOAuth!.access_token);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData);
      await arkClient.notifyUpload(address!, oAuth!.access_token);
      toaster("Image updated");
    })
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
              <Box display="flex" justifyContent="center" paddingLeft={10} paddingRight={10}>
                <label className={classes.uploadBox}>
                  {(profileImage || profile?.profileImage?.url) && (<img alt="" className={classes.profileImage} src={profileImage?.toString() || profile?.profileImage?.url || ""} />)}
                  {!profileImage && !profile?.profileImage?.url && (<div className={classes.profileImage} />)}
                  <Button onClick={() => setOpenDialog(true)} className={classes.labelButton}>Select</Button>
                </label>
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
                  disabled={(!hasChange && !profileImage) || hasError}
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
          open={openDialog}
          onCloseDialog={() => setOpenDialog(false)}
          onNavigateOut={() => onNavigateBack()}
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
    paddingLeft: theme.spacing(1),
    fontFamily: "'Raleway', sans-serif",
    marginBottom: theme.spacing(3),
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
    cursor: "pointer",
    maxHeight: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
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
  }
}));

export default EditProfile;
