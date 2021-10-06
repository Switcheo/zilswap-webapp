import { Box, BoxProps, Typography, IconButton, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";
import { ArkInput, FancyButton } from "app/components";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ReactComponent as UploadSVG } from "../assets/upload.svg";

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
  },
}));

const EditProfile: React.FC<Props> = (props: Props) => {
  const { onBack, children, className, ...rest } = props;
  const classes = useStyles();
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
  const [errors, setErrors] = useState({
    name: "",
    bio: "",
    twitter: "",
    email: "",
    instagram: "",
    website: "",
  })
  const [inputValues, setInputValues] = useState({
    name: "",
    bio: "",
    twitter: "",
    email: "",
    instagram: "",
    website: "",
  })

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "name":
        if (input.length > 50) return "max 50 characters";
        return ""
      case "bio":
        if (input.length > 10) return "max 250 characters";
        return ""
      case "twitter":
        if (input.length > 15) return "max 15 characters";
        return ""
      case "email":
        if (input.length > 320) return "max 320 characters";
        return ""
      case "instagram":
        if (input.length > 30) return "max 30 characters";
        return ""
      case "website":
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

  const onProfileUpload = (event: any) => {
    const files = event.target.files;
    if (!files[0]) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
    }

    reader.readAsDataURL(files[0]);
  }

  const hasError = () => {
    return !!Object.values(errors).reduce((prev, curr) => prev + curr);
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
              onChange={onProfileUpload}
            />
          </Box>
          <Box>
            <ArkInput placeholder="Add a funky name" error={errors.name} value={inputValues.name} label="Display Name" onValueChange={(value) => updateInputs("name")(value)} />
            <ArkInput placeholder="Write a lil' about yourself (or your collection!)" error={errors.bio} value={inputValues.bio} label="Bio" onValueChange={(value) => updateInputs("bio")(value)} multiline={true} />
            <ArkInput placeholder="Add your Twitter handle so we know you're legit" error={errors.twitter} value={inputValues.twitter} label="Twitter" onValueChange={(value) => updateInputs("twitter")(value)} />
            <ArkInput placeholder="Add your email for updates on bids and purchases" error={errors.email} value={inputValues.email} label="Email" onValueChange={(value) => updateInputs("email")(value)} />
            <ArkInput placeholder="Add your instagram if you wish to be known" error={errors.instagram} value={inputValues.instagram} label="Instagram" onValueChange={(value) => updateInputs("instagram")(value)} />
            <ArkInput placeholder="Add your website, especially if you're an artist" error={errors.website} value={inputValues.website} label="Website" onValueChange={(value) => updateInputs("website")(value)} />
            <FancyButton disabled={hasError()} fullWidth className={classes.profileButton} variant="contained" color="primary">
              Save Profile
            </FancyButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfile;
