import React, { useState } from "react";
import { Box, BoxProps, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppTheme } from "app/theme/types";
import { TWITTER_REGEX, INSTAGRAM_REGEX } from "app/utils/constants";
import { ArkInput } from "app/components";
import { CollectionInputs } from "../../Mint";

interface Props extends BoxProps {
  inputValues: CollectionInputs;
  setInputValues: React.Dispatch<React.SetStateAction<CollectionInputs>>;
}

const DESCRIPTION_PLACEHOLDER = "The Bear Market is a collection of 10,000 programmatically, randomly-generated NFT bears on the Zilliqa blockchain."

const CollectionDetail: React.FC<Props> = (props: Props) => {
  const { children, className, inputValues, setInputValues, ...rest } = props;
  const classes = useStyles();
  const history = useHistory();
  const [errors, setErrors] = useState({
    collectionName: "",
    description: "",
    royalties: "",
    websiteUrl: "",
    discordLink: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramLink: "",
  })

  const onNavigateBack = () => {
    history.push(`/ark/discover`);
  }

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "description":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 300) return "Maximum of 300 characters";
        return ""
      case "discordLink":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 253) return "Maximum of 253 characters";
        if (!input.match(/^(http|https):\/\//g)) return "Invalid URL, it should begin with http:// or https://";
        return ""
      case "telegramLink":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 253) return "Maximum of 253 characters";
        if (!input.match(/^(http|https):\/\//g)) return "Invalid URL, it should begin with http:// or https://";
        return ""
      case "websiteUrl":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 253) return "Maximum of 253 characters";
        if (!input.match(/^(http|https):\/\//g)) return "Invalid URL, it should begin with http:// or https://";
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

  return (
    <Box className={classes.root} {...rest}>
      <Box mb={3}>
        <IconButton onClick={onNavigateBack} className={classes.backButton}>
          <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
        </IconButton>
        <Typography className={classes.pageHeader}>1. Set up Collection</Typography>
      </Box>

      <ArkInput
        className={classes.collectionName}
        placeholder="Beary Bare Bears" error={errors.collectionName} value={inputValues.collectionName}
        label="COLLECTION NAME" onValueChange={(value) => updateInputs("collectionName")(value)}
        instruction="Give your collection an identifiable name." wordLimit={50}
      />

      <ArkInput
        className={classes.description}
        placeholder={DESCRIPTION_PLACEHOLDER} error={errors.description} value={inputValues.description}
        label="DESCRIPTION" onValueChange={(value) => updateInputs("description")(value)}
        instruction="What makes your collection special?" wordLimit={300} multiline={true}
      />

      <ArkInput
        className={classes.royalties}
        endAdornment={<span>%</span>}
        placeholder="2.5" error={errors.royalties} value={inputValues.royalties}
        label="ROYALTIES" onValueChange={(value) => updateInputs("royalties")(value)}
        instruction="Collect royalties of up to 8%."
      />
      
      <Box className={classes.socialsBox}>
        <Typography className={classes.header}>SOCIALS</Typography>
        <ArkInput
          inline={true} placeholder="https://thebear.market" error={errors.websiteUrl} value={inputValues.websiteUrl}
          label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)}
        />
        <ArkInput
          inline={true} placeholder="https://discord.gg/example"
          error={errors.discordLink} value={inputValues.discordLink} label="Discord"
          onValueChange={(value) => updateInputs("discordLink")(value)}
        />
        <ArkInput
          startAdornment={<Typography>@</Typography>} inline={true} placeholder="bearycute"
          error={errors.twitterHandle} value={inputValues.twitterHandle} label="Twitter"
          onValueChange={(value) => updateInputs("twitterHandle")(value)}
        />
        <ArkInput
          startAdornment={<Typography>@</Typography>} inline={true} placeholder="bearycute"
          error={errors.instagramHandle} value={inputValues.instagramHandle} label="Instagram"
          onValueChange={(value) => updateInputs("instagramHandle")(value)}
        />
        <ArkInput
          inline={true} placeholder="https://t.me/example"
          error={errors.telegramLink} value={inputValues.telegramLink} label="Telegram"
          onValueChange={(value) => updateInputs("telegramLink")(value)} />
      </Box>
    </Box>
  )
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    minWidth: 400,
  },
  connectionText: {
    margin: theme.spacing(1),
  },
  backButton: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    opacity: "50%",
    borderRadius: "12px",
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(3),
    transform: "translateX(-18px)",
  },
  extraMargin: {
    marginLeft: theme.spacing(2),
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
  },
  collectionName: {
    marginTop: theme.spacing(4),
  },
  description: {
    marginTop: theme.spacing(1),
  },
  royalties: {
    marginTop: theme.spacing(1),
  },
  socialsBox: {
    marginTop: theme.spacing(1),
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "13px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    marginTop: theme.spacing(1)
  },
}));

export default CollectionDetail;
