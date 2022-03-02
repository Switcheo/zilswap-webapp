import React, { useState } from "react";
import cls from "classnames";
import { Box, BoxProps, IconButton, Typography, Link } from "@material-ui/core";
import { WarningOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import BigNumber from "bignumber.js";
import { AppTheme } from "app/theme/types";
import { TWITTER_REGEX, INSTAGRAM_REGEX } from "app/utils/constants";
import { ArkInput, HelpInfo, NotificationBox } from "app/components";
import { hexToRGBA } from "app/utils";
import PlaceholderLight from "app/components/ArkComponents/ArkImageView/placeholder_bear_light.png";
import PlaceholderDark from "app/components/ArkComponents/ArkImageView/placeholder_bear_dark.png";
import BannerLight from "app/components/ArkComponents/ArkImageView/Banner_Light.png";
import BannerDark from "app/components/ArkComponents/ArkImageView/Banner_Dark.png";
import { CollectionInputs, Errors, MintImageFiles, MintOptionType } from "../../Mint";

interface Props extends BoxProps {
  inputValues: CollectionInputs;
  setInputValues: React.Dispatch<React.SetStateAction<CollectionInputs>>;
  mintOption: string;
  setMintOption: React.Dispatch<React.SetStateAction<MintOptionType>>;
  uploadedFiles: MintImageFiles,
  setUploadedFiles: React.Dispatch<React.SetStateAction<MintImageFiles>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
}

const DESCRIPTION_PLACEHOLDER = "The Bear Market is a collection of 10,000 programmatically, randomly-generated NFT bears on the Zilliqa blockchain."

const MAX_ROYALTIES = 20;

const CollectionDetail: React.FC<Props> = (props: Props) => {
  const { children, className, inputValues, setInputValues, mintOption, setMintOption, uploadedFiles, setUploadedFiles, errors, setErrors, ...rest } = props;
  const classes = useStyles();
  const history = useHistory();
  const [displayImage, setDisplayImage] = useState<string | ArrayBuffer | null>(null);
  const [bannerImage, setBannerImage] = useState<string | ArrayBuffer | null>(null);
  // const [collection, setCollection] = useState<string>("");

  const onHandleDisplayDrop = (files: any, rejection: FileRejection[], dropEvent: DropEvent) => {
    if (!files.length) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setDisplayImage(reader.result);
      setUploadedFiles({ ...uploadedFiles, profile: files[0] });
    }

    reader.readAsDataURL(files[0]);
  }

  const onHandleBannerDrop = (files: any, rejection: FileRejection[], dropEvent: DropEvent) => {
    if (!files.length) {
      return;
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setBannerImage(reader.result);
      setUploadedFiles({ ...uploadedFiles, banner: files[0] });
    }

    reader.readAsDataURL(files[0]);
  }

  const onNavigateBack = () => {
    history.push(`/ark/discover`);
  };

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "collectionName":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 50) return "Maximum of 50 characters";
        return ""
      case "symbol":
        if (input.length && input.length < 3) return "Minimum of 3 characters";
        if (input.length > 10) return "Maximum of 10 characters";
        return ""
      case "description":
        if (input.length && input.length < 2) return "Minimum of 2 characters";
        if (input.length > 300) return "Maximum of 300 characters";
        return ""
      case "discordUrl":
        if (input.length > 253) return "Maximum of 253 characters";
        if (input.indexOf("https://discord.gg/") !== 0) return "Invalid URL, it should begin with https://discord.gg/";
        return ""
      case "telegramUrl":
        if (input.length > 253) return "Maximum of 253 characters";
        if (input.indexOf("https://t.me/") !== 0) return "Invalid URL, it should begin with https://t.me/";
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
      case "royalties":
        const value = Number(input);
        if (value < 0 || value > MAX_ROYALTIES || isNaN(value)) return "ARKY supports up to 20% royalties, charged to sellers"
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

  const onEndEditRoyalties = () => {
    let royalties = inputValues["royalties"];
    let value = new BigNumber(royalties);

    if (value.isNaN() || value.isZero()) {
      setInputValues({
        ...inputValues,
        "royalties": "0"
      })
    } else {
      setInputValues({
        ...inputValues,
        "royalties": parseFloat(royalties).toString()
      })
    }
  }

  // const handleSelectCollection = (collection: string) => {
  //   setCollection(collection);
  //   setInputValues({ ...inputValues, "collectionName": collection });
  // }

  return (
    <Box className={classes.root} {...rest}>

      <Box mb={3}>
        <IconButton onClick={onNavigateBack} className={classes.backButton}>
          <ArrowBackIcon /><Typography className={classes.extraMargin}>Go Back</Typography>
        </IconButton>

        <NotificationBox IconComponent={WarningOutlined}>
          <Typography>
            ARKY's NFT Mint feature is currently in Beta mode.
            If you encounter a bug, share it on our
            {" "}
            <Link target="_blank" href="https://discord.gg/zilswap">Discord</Link>.
          </Typography>
        </NotificationBox>

        <Box marginBottom={3} />

        <Typography className={classes.pageHeader}>1. Set up Collection</Typography>
      </Box>

      {/* Collection */}
      <Box className={classes.collectionBox}>
        {/* <Typography className={classes.header}>
          COLLECTION
        </Typography>
        <Typography className={classes.instruction}>Create a new collection or select from your existing collections.</Typography>
        <ToggleButtonGroup className={classes.buttonGroup} exclusive value={mintOption} onChange={(_, newOption) => {newOption !== null && setMintOption(newOption)}}>
          <ToggleButton value="create" className={classes.collectionButton}>
            <Typography>Create Collection</Typography>
          </ToggleButton>

          <ToggleButton value="select" className={classes.collectionButton}>
            <Typography>Select Collection</Typography>
          </ToggleButton>
        </ToggleButtonGroup> */}

        {/* {mintOption === "select" && (
          <Box mt={3}>
            <Typography className={classes.header}>
              SELECT EXISTING COLLECTION
            </Typography>
            <FormControl className={classes.formControl} fullWidth>
              <Select
                MenuProps={{ 
                  classes: { paper: classes.selectMenu },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left"
                  },
                  getContentAnchorEl: null
                }}
                variant="outlined"
                value={collection}
                onChange={(event) => handleSelectCollection(event.target.value as string)}
                renderValue={(currCollection) => {
                  const selected = currCollection as string;
                  if (!selected.length) {
                    return <Typography className={classes.selectPlaceholder}>Select Collection</Typography>;
                  }

                  return selected;
                }}
                displayEmpty
              >
              </Select>
            </FormControl>
          </Box>
        )} */}
      </Box>

      {/* Display Picture & Banner */}
      <Box className={classes.displayBox}>
        <Typography className={classes.header}>
          DISPLAY PICTURE &amp; BANNER
        </Typography>
        <Typography className={cls(classes.instruction, classes.lineHeight)}>
          Customise your collection page with a display picture and banner.
          {" "}
          <HelpInfo
            className={classes.infoIcon}
            icon={<InfoIcon />}
            placement="top"
            title="Note that image uploaded will be applied to both dark and light themes on ARKY."
          />
        </Typography>

        <Box display="flex" justifyContent="space-between">
          {/* Display Picture */}
          <Box>
            <Dropzone accept='image/jpeg, image/png' onFileDialogCancel={() => setDisplayImage(null)} onDrop={onHandleDisplayDrop}>
              {({ getRootProps, getInputProps }) => (
                <Box>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {!displayImage && (
                      <Box className={cls(classes.displayImage, classes.displayImagePlaceholder)}>
                        <Typography align="center" className={classes.displayText}>Drag and drop image here.</Typography>
                      </Box>
                    )}
                    {displayImage && (<img alt="" className={classes.displayImage} src={displayImage?.toString() || ""} />)}
                  </div>
                </Box>
              )}
            </Dropzone>
          </Box>

          {/* Banner */}
          <Box flex={.95}>
            <Dropzone accept='image/jpeg, image/png' onFileDialogCancel={() => setBannerImage(null)} onDrop={onHandleBannerDrop}>
              {({ getRootProps, getInputProps }) => (
                <Box>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {!bannerImage && (
                      <Box className={classes.dropBox}>
                        <Typography className={classes.bannerText}>Drag and drop banner here.</Typography>
                      </Box>
                    )}
                    {bannerImage && <img alt="" className={classes.bannerImage} src={bannerImage?.toString() || ""} />}
                  </div>
                </Box>
              )}
            </Dropzone>
          </Box>
        </Box>

        <Typography className={cls(classes.instruction, classes.footerInstruction)}>
          Recommended Format: PNG/JPEG &nbsp;|&nbsp; DP Size: 250 (w) x 250 (h) px &nbsp;|&nbsp; Banner Size: 1300 (w) x 250 (h) px
        </Typography>
      </Box>

      {/* Collection Name */}
      <ArkInput
        className={cls(classes.collectionName, classes.inputHeader, classes.input)}
        placeholder="Beary Bare Bears" error={errors.collectionName} errorBorder={!!errors.collectionName} value={inputValues.collectionName}
        label="COLLECTION NAME" onValueChange={(value) => updateInputs("collectionName")(value)}
        instruction="Give your collection an identifiable name." wordLimit={50}
        disabled={mintOption === "select"}
      />

      {/* Description */}
      <ArkInput
        className={cls(classes.description, classes.inputHeader, classes.input)}
        placeholder={DESCRIPTION_PLACEHOLDER} error={errors.description} value={inputValues.description}
        label="DESCRIPTION" onValueChange={(value) => updateInputs("description")(value)}
        instruction="What makes your collection special?" wordLimit={300} multiline={true}
      />

      {/* Artist Name */}
      <ArkInput
        className={cls(classes.artistName, classes.inputHeader, classes.input)} value={inputValues.artistName}
        label="ARTIST NAME" onValueChange={() => { }}
        instruction={
          <span>
            Your collection will be minted under this profile.
            {" "}
            <HelpInfo
              className={classes.infoIcon}
              icon={<InfoIcon />}
              placement="top"
              title="You may edit your name via your profile settings." />
          </span>}
        disabled
      />

      {/* Token Symbol */}
      <ArkInput
        className={cls(classes.symbol, classes.inputHeader, classes.input)}
        placeholder="BEAR" error={errors.symbol} errorBorder={!!errors.symbol} value={inputValues.symbol}
        label="TOKEN SYMBOL" onValueChange={(value) => updateInputs("symbol")(value)}
        instruction="The contract symbol that will be viewable on ViewBlock (e.g. $BEAR)." wordLimit={10}
        disabled={mintOption === "select"}
      />

      {/* Royalties */}
      <ArkInput
        type="number"
        onInputBlur={onEndEditRoyalties}
        className={cls(classes.royalties, classes.inputHeader, classes.input)}
        endAdornment={<span>%</span>}
        placeholder="2.5" error={errors.royalties} value={inputValues.royalties}
        label="ROYALTIES" onValueChange={(value) => updateInputs("royalties")(value)}
        instruction={`Collect royalties of up to ${MAX_ROYALTIES}%.`}
      />

      {/* Socials */}
      <Box className={classes.socialsBox}>
        <Typography className={classes.socialsHeader}>SOCIALS</Typography>
        <ArkInput
          className={classes.socialInput}
          inline={true} placeholder="https://thebear.market" error={errors.websiteUrl} value={inputValues.websiteUrl}
          label="Website" onValueChange={(value) => updateInputs("websiteUrl")(value)}
        />
        <ArkInput
          className={classes.socialInput}
          inline={true} placeholder="https://discord.gg/example"
          error={errors.discordUrl} value={inputValues.discordUrl} label="Discord"
          onValueChange={(value) => updateInputs("discordUrl")(value)}
        />
        <ArkInput
          className={classes.socialInput}
          startAdornment={<Typography>@</Typography>} inline={true} placeholder="bearycute"
          error={errors.twitterHandle} value={inputValues.twitterHandle} label="Twitter"
          onValueChange={(value) => updateInputs("twitterHandle")(value)}
        />
        <ArkInput
          className={classes.socialInput}
          startAdornment={<Typography>@</Typography>} inline={true} placeholder="bearycute"
          error={errors.instagramHandle} value={inputValues.instagramHandle} label="Instagram"
          onValueChange={(value) => updateInputs("instagramHandle")(value)}
        />
        <ArkInput
          className={classes.socialInput}
          inline={true} placeholder="https://t.me/example"
          error={errors.telegramUrl} value={inputValues.telegramUrl} label="Telegram"
          onValueChange={(value) => updateInputs("telegramUrl")(value)} />
      </Box>
    </Box>
  )
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    maxWidth: 600,
    "& .MuiToggleButton-root.Mui-disabled": {
      "& .MuiTypography-root": {
        color: theme.palette.text?.disabled,
      },
      backgroundColor: theme.palette.action?.disabledBackground,
    }
  },
  backButton: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    opacity: "50%",
    borderRadius: "12px",
    padding: theme.spacing(1, 2),
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
  inputHeader: {
    "& div:first-child>p:first-child": {
      fontSize: "16px",
      fontWeight: 900,
      [theme.breakpoints.down("xs")]: {
        fontSize: "14px",
      }
    },
  },
  collectionName: {
    marginTop: theme.spacing(3),
  },
  symbol: {
    marginTop: theme.spacing(1),
  },
  description: {
    marginTop: theme.spacing(1),
  },
  artistName: {
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
    fontSize: "16px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    marginTop: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    }
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontWeight: 600,
    fontSize: 13,
    margin: theme.spacing(.4, 0),
    marginBottom: "4px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "16px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
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
    width: "50%",
    padding: theme.spacing(2.5, 5),
    backgroundColor: `rgba${theme.palette.type === "dark"
      ? hexToRGBA("#DEFFFF", 0.1)
      : hexToRGBA("#003340", 0.2)}`,
    "& .MuiTypography-root": {
      fontSize: "14px",
      color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    },
  },
  displayBox: {
    marginTop: theme.spacing(3),
  },
  infoIcon: {
    verticalAlign: "text-top",
    fontSize: "1rem",
  },
  displayImage: {
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPositionY: "center",
    backgroundPositionX: "center",
    height: 110,
    width: 110,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  displayImagePlaceholder: {
    backgroundImage: `url(${theme.palette.type === "dark" ? PlaceholderDark : PlaceholderLight})`,
  },
  displayText: {
    padding: theme.spacing(2),
    color: theme.palette.primary.light,
  },
  dropBox: {
    backgroundImage: `url(${theme.palette.type === "dark" ? BannerDark : BannerLight})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPositionY: "center",
    backgroundPositionX: "center",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    height: "110px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "100%",
    backgroundPositionX: "center",
    borderRadius: 5,
    backgroundColor: "#29475A",
    width: "100%",
    height: "110px",
    objectFit: "cover",
    cursor: "pointer",
  },
  bannerText: {
    color: theme.palette.primary.light,
  },
  footerInstruction: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontWeight: 600,
    fontSize: 11,
  },
  formControl: {
    "& .MuiSelect-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
      border: theme.palette.border,
      marginTop: theme.spacing(1),
      height: "19px",
      "&[aria-expanded=true]": {
        borderColor: theme.palette.action?.selected,
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      fontSize: "12px",
      lineHeight: "18px",
      padding: "9.125px 12px",
    },
    "& .MuiSelect-icon": {
      top: "calc(50% - 8px)",
      fill: theme.palette.text?.primary,
    },
    "& .MuiSelect-iconOpen": {
      fill: theme.palette.action?.selected,
    },
  },
  selectMenu: {
    marginTop: "6px",
    backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
    "& .MuiListItem-root": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
    },
    "& .MuiListItem-root.Mui-focusVisible": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
    },
    "& .MuiListItem-root.Mui-selected": {
      backgroundColor: "transparent",
      color: "#00FFB0",
    },
  },
  selectPlaceholder: {
    color: theme.palette.primary.light,
    fontSize: "12px",
    lineHeight: "18px",
  },
  input: {
    "& .MuiFormControl-root": {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down("xs")]: {
        marginBottom: theme.spacing(2),
      }
    },
    "& .MuiInputBase-root": {
      "& input, & textarea": {
        fontSize: "13px",
        [theme.breakpoints.down("xs")]: {
          fontSize: "12px",
        }
      }
    },
    "& #instruction": {
      fontSize: "13px",
      marginBottom: "4px",
      [theme.breakpoints.down("xs")]: {
        fontSize: "12px",
      }
    },
    "& #instruction > p": {
      lineHeight: 2,
    }
  },
  socialInput: {
    "& .MuiFormControl-root": {
      marginBottom: theme.spacing(2),
    },
    "& .MuiInputBase-root": {
      "& input": {
        fontSize: "13px",
        [theme.breakpoints.down("xs")]: {
          fontSize: "12px",
        }
      }
    },
  },
  lineHeight: {
    lineHeight: 1.66,
  }
}));

export default React.memo(CollectionDetail);
