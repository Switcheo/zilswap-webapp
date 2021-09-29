import { Box, BoxProps, Typography, IconButton, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";
import { ArkInput, FancyButton } from "app/components";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ReactComponent as UploadSVG } from "./upload.svg";

interface Props extends BoxProps {
  onBack: () => void
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "400px"
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
  },
}));

const EditProfile: React.FC<Props> = (props: Props) => {
  const { onBack, children, className, ...rest } = props;
  const classes = useStyles();
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [inputValues, setInputValues] = useState({
    name: "",
    bio: "",
    twitter: "",
    email: "",
    instagram: "",
    website: "",
  })

  const updateInputs = (type: string) => {
    return (newInput: string) => {
      setInputValues({
        ...inputValues,
        [type]: newInput
      })
    }
  }

  const onProfileUpload = (event: any) => {
    const files = event.target.files;
    if (!files[0]) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    }

    reader.readAsDataURL(files[0]);
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box display="flex" flexDirection="row">
        <Box className={classes.container}>
          <Box>
            <IconButton onClick={() => onBack()} className={classes.backButton}>
              <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
            </IconButton>
          </Box>
          <ArkInput value={inputValues.name} label="Display Name" onValueChange={(value) => updateInputs("name")(value)} />
          <ArkInput value={inputValues.bio} label="Bio" onValueChange={(value) => updateInputs("bio")(value)} multiline={true} />
          <ArkInput value={inputValues.twitter} label="Twitter" onValueChange={(value) => updateInputs("twitter")(value)} />
          <ArkInput value={inputValues.email} label="Email" onValueChange={(value) => updateInputs("email")(value)} />
          <ArkInput value={inputValues.instagram} label="Instagram" onValueChange={(value) => updateInputs("instagram")(value)} />
          <ArkInput value={inputValues.website} label="Website" onValueChange={(value) => updateInputs("website")(value)} />
          <FancyButton fullWidth className={classes.profileButton} variant="contained" color="primary">
            Save Profile
          </FancyButton>
        </Box>
        <Box padding={4}>
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
            onChange={onProfileUpload}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfile;
