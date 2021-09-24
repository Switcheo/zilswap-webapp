import { Box, BoxProps, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";
import { ArkInput, FancyButton } from "app/components";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

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
  }
}));

const EditProfile: React.FC<Props> = (props: Props) => {
  const { onBack, children, className, ...rest } = props;
  const classes = useStyles();
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

  return (
    <Box {...rest} className={cls(classes.root, className)}>
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
    </Box>
  );
};

export default EditProfile;
