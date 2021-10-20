import React, { useState, useEffect, useRef } from "react";
import { Box, BoxProps, Collapse, IconButton, TextField, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ConnectedWallet } from "core/wallet";
import { ArkClient } from "core/utilities";
import { EmailRegex, AlphaNumericRegex } from "app/utils/constants";
import { useAsyncTask, useNetwork, useToaster, useTaskSubscriber } from "app/utils";
import { MarketPlaceState, OAuth, Profile, RootState } from "app/store/types";
import { ArkInput, FancyButton, ArkCheckbox } from "app/components";
import { AppTheme } from "app/theme/types";
import { actions } from "app/store";
import ActiveBidToggle from "../ActiveBidToggle";
import { ImageDialog } from "./components";

interface Props extends BoxProps {
  onBack: () => void;
  profile?: Profile;
  wallet?: ConnectedWallet | null;
}

const EditProfile: React.FC<Props> = (props: Props) => {
  const { wallet, profile, onBack, children, className, ...rest } = props;
  const classes = useStyles();
  const network = useNetwork();
  const marketplaceState = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [runUpdateProfile, isLoading] = useAsyncTask("updateProfile");
  const [runUploadImage] = useAsyncTask("uploadImage");
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
  const [enableEmailNotification, setEnableEmailNotification] = useState(false);
  const toaster = useToaster(false)
  const dispatch = useDispatch();
  const [loadingProfile] = useTaskSubscriber("loadProfile");
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

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
        if (!AlphaNumericRegex.test(input)) return "Please ensure username is alphanumeric"
        return ""
      case "bio":
        if (input.length > 10) return "max 250 characters";
        return ""
      case "twitterHandle":
        if (input.length > 15) return "max 15 characters";
        if (!AlphaNumericRegex.test(input)) return "Please ensure twitter handle is alphanumeric"
        return ""
      case "email":
        if (input.length > 320) return "max 320 characters";
        return ""
      case "instagramHandle":
        if (input.length > 30) return "max 30 characters";
        if (!AlphaNumericRegex.test(input)) return "Please ensure instagram handle is alphanumeric"
        return ""
      case "websiteUrl":
        if (input.length > 253) return "max 253 characters";
        return ""
      default: return "false";
    }
  }

  const updateInputs = (type: string) => {
    return (newInput: string) => {
      setInputValues({
        ...inputValues,
        [type]: newInput
      })
      if (!newInput) {
        return setErrors({
          ...errors, [type]: ""
        })
      }
      const errorText = validateInput(type, newInput)

      setErrors({
        ...errors, [type]: errorText
      })
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

  const onUpdateProfile = (queue?: boolean) => {
    runUpdateProfile(async () => {
      if (!hasChange() && !profileImage) {
        if (queue) onBack();
        return;
      }
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
      if (profileImage && uploadFile) await imageUpload();
      if (hasChange()) {
        const result = await arkClient.updateProfile(profile!.address, filteredData, checkedOAuth!);
        if (!result.error) {
          toaster("Profile updated");
          dispatch(actions.MarketPlace.loadProfile());
        } else {
          toaster("Error updating profile");
        }
        if (queue) onBack();
        return;
      }
      toaster("Image updated");
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

  const imageUpload = () => {
    runUploadImage(async () => {
      if (!uploadFile) return;
      const arkClient = new ArkClient(network);
      const { oAuth } = marketplaceState;
      let checkedOAuth: OAuth | undefined = oAuth;
      if (!oAuth?.access_token || (oAuth && dayjs(oAuth?.expires_at * 1000).isBefore(dayjs()))) {
        const { result } = await arkClient.arkLogin(wallet!, window.location.hostname);
        dispatch(actions.MarketPlace.updateAccessToken(result));
        checkedOAuth = result;
      }
      const requestResult = await arkClient.requestImageUploadUrl(profile!.address, checkedOAuth!.access_token);

      const blobData = new Blob([uploadFile], { type: uploadFile.type });

      await arkClient.putImageUpload(requestResult.result.uploadUrl, blobData, uploadFile);
      await arkClient.notifyUpload(profile!.address, oAuth!.access_token);
    })
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
            <Box>
              <ArkInput
                placeholder="coolname" error={errors.username} value={inputValues.username}
                label="Display Name" onValueChange={(value) => updateInputs("username")(value)}
                instruction="This is how other users identify you on ARK."
              />
              <ArkInput
                placeholder="bearsarecute@mail.com" error={errors.email} value={inputValues.email}
                label="Email" onValueChange={(value) => updateInputs("email")(value)}
                instruction="We'll send you notifications on bid updates, price changes and more."
              />
              <ArkInput
                placeholder="My spirit animal's a bear" error={errors.bio} value={inputValues.bio}
                label="Bio" onValueChange={(value) => updateInputs("bio")(value)} multiline={true}
                instruction="Write a little about yourself."
              />

              <Typography className={classes.social}>Socials</Typography>
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
                inline={true} placeholder="www.imannftartist.com" error={errors.websiteUrl} value={inputValues.websiteUrl}
                label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)}
              />

              <ActiveBidToggle className={classes.switch} isChecked={enableEmailNotification} onChecked={(isChecked) => setEnableEmailNotification(isChecked)} hideCount={true} overrideSm={true} header="EMAIL NOTIFICATIONS" />

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
              </Collapse>

              <FancyButton loading={isLoading || loadingProfile} onClick={() => onUpdateProfile()} disabled={hasError() || (!hasChange() && !profileImage)} fullWidth className={classes.profileButton} variant="contained" color="primary">
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
        onCloseDialog={() => setOpenDialog(false)}
        onBack={onBack} open={openDialog}
        onSave={onUpdateProfile}
      />
    </Box>
  );
};


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "680px",
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
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    opacity: "50%",
    borderRadius: "12px",
    paddingLeft: 0,
  },
  extraMargin: {
    marginLeft: theme.spacing(2)
  },
  profileImage: {
    height: 110,
    width: 110,
    border: `5px solid #0D1B24`,
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  connectionText: {
    margin: theme.spacing(1),
  },
  labelButton: {
    borderRadius: 8,
    padding: "8px 16px",
    maxWidth: 80,
    alignSelf: "center",
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.action?.active,
    color: theme.palette.primary.contrastText,
    cursor: "pointer",
    "&:hover": {
      opacity: 0.5,
    }
  },
  social: {
    fontSize: "16px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontFamily: "Avenir Next LT Pro",
    fontWeight: "bold",
    marginTop: theme.spacing(1)
  },
  switch: {
    paddingBottom: 0,
  },
  checkbox: {
    marginBottom: theme.spacing(1),
  }
}));

export default EditProfile;
