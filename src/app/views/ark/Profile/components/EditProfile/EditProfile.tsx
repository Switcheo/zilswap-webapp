import React, { useEffect, useState } from "react";
import { Box, BoxProps, IconButton, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { ConnectedWallet } from "core/wallet";
import { ArkClient } from "core/utilities";
import { EmailRegex } from "app/utils/constants";
import { useAsyncTask, useNetwork, useTaskSubscriber, useToaster } from "app/utils";
import { MarketPlaceState, OAuth, Profile, RootState } from "app/store/types";
import { ArkInput, FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import { actions } from "app/store";
import { ReactComponent as UploadSVG } from "../assets/upload.svg";

interface Props extends BoxProps {
  onBack: () => void;
  profile?: Profile;
  wallet?: ConnectedWallet | null;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "500px",
    display: "row",
  },
  content: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row-reverse",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    }
  },
  profileButton: {
    marginTop: theme.spacing(2),
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px",
    width: "100%",
    borderRadius: "12px"
  },
  backButton: {
    color: "#DEFFFF",
    opacity: "50%",
    borderRadius: "12px",
    paddingLeft: 0,
  },
  extraMargin: {
    marginLeft: theme.spacing(2)
  },
  profileImage: {
    height: 130,
    width: 130,
    border: "5px solid #0D1B24",
    borderRadius: "50%",
    backgroundColor: "#DEFFFF",
  },
  uploadInput: {
    display: "none",
  },
  uploadText: {
    opacity: "50%",
    fontSize: "14px",
  },
  uploadBox: {
    cursor: "pointer",
    maxHeight: 200,
  },
  connectionText: {
    margin: theme.spacing(1),
  },
}));

const EditProfile: React.FC<Props> = (props: Props) => {
  const { wallet, profile, onBack, children, className, ...rest } = props;
  const classes = useStyles();
  const network = useNetwork();
  const marketplaceState = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [runUpdateProfile, isLoading] = useAsyncTask("updateProfile");
  const [errors, setErrors] = useState({
    username: "",
    bio: "",
    twitterHandle: "",
    email: "",
    instagramHandle: "",
    websiteUrl: "",
  })
  const [inputValues, setInputValues] = useState<any>({
    username: profile?.username || "",
    bio: profile?.bio || "",
    twitterHandle: profile?.twitterHandle || "",
    email: profile?.email || "",
    instagramHandle: profile?.instagramHandle || "",
    websiteUrl: profile?.websiteUrl || "",
  })
  const toaster = useToaster(false)
  const dispatch = useDispatch();
  const [loadingProfile] = useTaskSubscriber("loadProfile");

  useEffect(() => {
    if (profile) {
      setInputValues({
        username: profile?.username || "",
        bio: profile?.bio || "",
        twitterHandle: profile?.twitterHandle || "",
        email: profile?.email || "",
        instagramHandle: profile?.instagramHandle || "",
        websiteUrl: profile?.websiteUrl || "",
      })
    }
    // eslint-disable-next-line
  }, [profile])

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "username":
        if (input.length > 50) return "max 50 characters";
        return ""
      case "bio":
        if (input.length > 10) return "max 250 characters";
        return ""
      case "twitterHandle":
        if (input.length > 15) return "max 15 characters";
        return ""
      case "email":
        if (input.length > 320) return "max 320 characters";
        return ""
      case "instagramHandle":
        if (input.length > 30) return "max 30 characters";
        return ""
      case "websiteUrl":
        if (input.length > 253) return "max 253 characters";
        return ""
      default: return "false";
    }
  }

  const updateInputs = (type: string) => {
    return (newInput: string) => {
      const errorText = validateInput(type, newInput)
      setInputValues({
        ...inputValues,
        [type]: newInput
      })
      setErrors({
        ...errors, [type]: errorText
      })
    }
  }

  const onImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files[0]) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    }

    reader.readAsDataURL(files[0]);
  }

  const onUpdateProfile = () => {
    runUpdateProfile(async () => {
      let filteredData: any = {};
      Object.keys(inputValues).forEach((key) => {
        if (inputValues[key] && (inputValues[key] !== (profile as any)[key])) {
          filteredData[key] = inputValues[key];
          if (key === "email" && !EmailRegex.test(inputValues[key])) {
            setErrors({
              ...errors, [key]: "invalid email"
            })
          }
        }
      })
      if (hasError()) return;

      const arkClient = new ArkClient(network);
      const { oAuth } = marketplaceState;
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }

      const result = await arkClient.updateProfile(profile!.address, filteredData, checkedOAuth!);
      if (!result.error) {
        toaster("Profile updated");
        dispatch(actions.MarketPlace.loadProfile());
      } else {
        toaster("Error updating profile");
      }
    });
  }

  const hasError = () => {
    return !!Object.values(errors).reduce((prev, curr) => prev + curr);
  }

  const hasChange = () => {
    let change = false
    Object.keys(inputValues).forEach((key) => {
      if (inputValues[key] === "" && !(profile as any)[key]) {

      } else if (inputValues[key] !== (profile as any)[key]) {

        change = true;
      }
    })
    return change;
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <Box justifyContent="flex-start">
          <IconButton onClick={() => onBack()} className={classes.backButton}>
            <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
          </IconButton>
          <Typography variant="h1">Edit Profile</Typography>
        </Box>
        {wallet && (
          <Box className={classes.content}>
            <Box display="flex" justifyContent="center" padding={4}>
              <label htmlFor="ark-profile-image" className={classes.uploadBox}>
                {profileImage && (<img alt="" className={classes.profileImage} src={profileImage ? profileImage.toString() : ""} />)}
                {!profileImage && (<div className={classes.profileImage} />)}
                <Box mt={2} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                  <Typography className={classes.uploadText}>Upload</Typography>

                  <UploadSVG />
                </Box>
              </label>
              <TextField
                className={classes.uploadInput}
                id="ark-profile-image"
                type="file"
                inputProps={{ accept: "image/x-png,image/jpeg" }}
                onChange={onImageUpload}
              />
            </Box>
            <Box>
              <ArkInput placeholder="Add a funky name" error={errors.username} value={inputValues.username} label="Display Name" onValueChange={(value) => updateInputs("username")(value)} />
              <ArkInput placeholder="Write a lil' about yourself (or your collection!)" error={errors.bio} value={inputValues.bio} label="Bio" onValueChange={(value) => updateInputs("bio")(value)} multiline={true} />
              <ArkInput placeholder="Add your Twitter handle so we know you're legit" error={errors.twitterHandle} value={inputValues.twitterHandle} label="Twitter" onValueChange={(value) => updateInputs("twitterHandle")(value)} />
              <ArkInput placeholder="We'll hit you up with updates!" error={errors.email} value={inputValues.email} label="Email" onValueChange={(value) => updateInputs("email")(value)} />
              <ArkInput placeholder="Do it for the gram" error={errors.instagramHandle} value={inputValues.instagramHandle} label="Instagram" onValueChange={(value) => updateInputs("instagramHandle")(value)} />
              <ArkInput placeholder="Might be useful, especially if you're an artist" error={errors.websiteUrl} value={inputValues.websiteUrl} label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)} />
              <FancyButton loading={isLoading || loadingProfile} onClick={onUpdateProfile} disabled={hasError() || !hasChange()} fullWidth className={classes.profileButton} variant="contained" color="primary">
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
    </Box>
  );
};

export default EditProfile;
