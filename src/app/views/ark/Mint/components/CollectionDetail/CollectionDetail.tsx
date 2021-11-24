import React, { useState } from "react";
import { Box, BoxProps, IconButton, Tooltip, Typography } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { AppTheme } from "app/theme/types";
import { TWITTER_REGEX, INSTAGRAM_REGEX } from "app/utils/constants";
import { ArkInput } from "app/components";
import { hexToRGBA } from "app/utils";
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
  const [currentSelection, setCurrentSelection] = useState<string>("create");
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

      {/* Collection */}
      <Box className={classes.collectionBox}>
        <Typography className={classes.header}>
          COLLECTION
        </Typography>
        <Typography className={classes.instruction}>Create a new collection or select from your existing collections.</Typography>
        <ToggleButtonGroup className={classes.buttonGroup} exclusive value={currentSelection} onChange={(event, newSelection) => {setCurrentSelection(newSelection)}}>
          <ToggleButton value="create" className={classes.collectionButton}>
            <Typography>Create Collection</Typography>
          </ToggleButton>

          <ToggleButton value="select" className={classes.collectionButton}>
            <Typography>Select Collection</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Display Picture & Banner */}
      <Box className={classes.displayBox}>
        <Typography className={classes.header}>
          DISPLAY PICTURE & BANNER
        </Typography>
        <Typography className={classes.instruction}>
          Customise your collection page with a display picture and banner.
          {" "}
          <Tooltip placement="top" title="Note that image uploaded will be applied to both dark and light themes on ARK.">
            <InfoIcon className={classes.infoIcon} />
          </Tooltip>
        </Typography>

      </Box>

      {/* Collection Name */}
      <ArkInput
        className={classes.collectionName}
        placeholder="Beary Bare Bears" error={errors.collectionName} value={inputValues.collectionName}
        label="COLLECTION NAME" onValueChange={(value) => updateInputs("collectionName")(value)}
        instruction="Give your collection an identifiable name." wordLimit={50}
      />

      {/* Description */}
      <ArkInput
        className={classes.description}
        placeholder={DESCRIPTION_PLACEHOLDER} error={errors.description} value={inputValues.description}
        label="DESCRIPTION" onValueChange={(value) => updateInputs("description")(value)}
        instruction="What makes your collection special?" wordLimit={300} multiline={true}
      />

      {/* Royalties */}
      <ArkInput
        className={classes.royalties}
        endAdornment={<span>%</span>}
        placeholder="2.5" error={errors.royalties} value={inputValues.royalties}
        label="ROYALTIES" onValueChange={(value) => updateInputs("royalties")(value)}
        instruction="Collect royalties of up to 8%."
      />
      
      {/* Socials */}
      <Box className={classes.socialsBox}>
        <Typography className={classes.socialsHeader}>SOCIALS</Typography>
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
    marginTop: theme.spacing(3),
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
  socialsHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "13px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    marginTop: theme.spacing(1)
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontWeight: 600,
    fontSize: 12,
    margin: theme.spacing(.4, 0),
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "13px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 800,
  },
  collectionBox: {
    marginTop: theme.spacing(4),
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "6px",
    "& .MuiToggleButtonGroup-groupedHorizontal:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    "& .MuiToggleButtonGroup-groupedHorizontal:not(:first-child)": {
      marginLeft: 0,
      borderLeft: "1px solid rgba(0, 51, 64, 0.12)",
    },
    "& .MuiToggleButton-root.Mui-selected": {
      backgroundColor: "#00FFB0",
      "& .MuiTypography-root": {
        color: "#003340",
      }
    }
  },
  collectionButton: {
    borderRadius: "12px!important",
    width: "100%",
    padding: theme.spacing(2.5, 5),
    backgroundColor: `rgba${theme.palette.type === "dark"
    ? hexToRGBA("#DEFFFF", 0.1)
    : hexToRGBA("#003340", 0.2)}`,
    "& .MuiTypography-root": {
      fontSize: "14px",
      color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    }
  },
  displayBox: {
    marginTop: theme.spacing(3),
  },
  infoIcon: {
    verticalAlign: "text-top",
    fontSize: "1rem",
  }
}));

export default CollectionDetail;
