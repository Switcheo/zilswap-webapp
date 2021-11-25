import React, { useState } from "react";
import cls from "classnames";
import { Box, BoxProps, Tooltip, Typography, Switch, FormControlLabel, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { AppTheme } from "app/theme/types";
import { ArkInput } from "app/components";
import { hexToRGBA, SimpleMap } from "app/utils";

interface Props extends BoxProps {

}

const NftUpload: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [hasAttributes, setHasAttributes] = useState<boolean>(true);
  const [bannerImage, setBannerImage] = useState<string | ArrayBuffer | null>(null);
  const [uploadFile, setUploadFile] = useState<SimpleMap<File>>({});
  const [input, setInput] = useState<string>("");

  const onHandleBannerDrop = (files: any, rejection: FileRejection[], dropEvent: DropEvent) => {

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

  return (
    <Box className={classes.root} {...rest}>
      <Box mt={5} mb={3}>
        <Typography className={classes.pageHeader}>2. Upload NFTs</Typography>
      </Box>

      {/* Upload Files */}
      <Box className={classes.uploadBox}>
        <Typography className={classes.header}>
          UPLOAD FILES
        </Typography>
        <Typography className={classes.instruction}>
          Your NFTs will be named according to their file names by default. You may edit them below.
          {" "}
          <Tooltip placement="top" title="We recommend naming your files prior to uploading them for better collection management.">
            <InfoIcon className={classes.infoIcon} />
          </Tooltip>
        </Typography>

        <Box>
          <Dropzone accept='image/jpeg, image/png' onFileDialogCancel={() => setBannerImage(null)} onDrop={onHandleBannerDrop}>
            {({ getRootProps, getInputProps }) => (
              <Box className={classes.dropBox}>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  {!bannerImage && (
                      <Typography className={classes.bannerText}>Drag and drop your files here.</Typography>
                  )}
                  {bannerImage && <img alt="" className={classes.bannerImage} src={bannerImage?.toString() || ""} />}
                </div>
              </Box>
            )}
          </Dropzone>
        </Box>

        <Typography className={cls(classes.instruction, classes.footerInstruction)}>
          Recommended format: PNG/JPEG &nbsp;|&nbsp; Maximum number of files: 100 &nbsp;|&nbsp; Maximum size per file: 50MB
        </Typography>
      </Box>

      {/* Attributes */}
      <Box className={classes.attributesBox}>
        <Box display="flex" justifyContent="space-between">
          <Typography className={classes.header}>
            ATTRIBUTES
          </Typography>
          <FormGroup row className={classes.formGroup}>
            <FormControlLabel
              control={
                <Switch
                  color="secondary"
                  checked={hasAttributes}
                  onChange={() => setHasAttributes(!hasAttributes)}
                  {...rest}
                  className={classes.switch}
                />
              }
              label={
                <Typography className={classes.switchLabel}>
                  Turn this on if your collection has attributes.
                </Typography>
              }
              labelPlacement="start"
            />
          </FormGroup>
        </Box>
        <Typography className={classes.instruction} style={{ marginTop: "-5px" }}>
          Customise attributes according to your NFT collection.
          {" "}
          <Tooltip placement="top" title="Add all attributes that are a part of this colleciton, and assign them to specific NFTs below.">
            <InfoIcon className={classes.infoIcon} />
          </Tooltip>
        </Typography>
        
        {hasAttributes && (
          <TableContainer>
            <Table>
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell align="left">
                    <Typography>Attributes</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>Values</Typography>
                  </TableCell>        
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                <TableRow>
                  <TableCell component="th" scope="row">
                    <ArkInput
                      value={input}
                      onValueChange={(value) => setInput(value)}
                    />
                    {/* Text Field */}
                  </TableCell>
                  <TableCell>
                    <ArkInput
                      value={input}
                      onValueChange={(value) => setInput(value)}
                    />
                    {/* Something */}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Manage NFTs */}
    </Box>
  )
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: "100%",
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
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
  uploadBox: {
    marginTop: theme.spacing(4),
  },
  infoIcon: {
    verticalAlign: "text-top",
    fontSize: "1rem",
  },
  dropBox: {
    borderRadius: 12,
    border: theme.palette.border,
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "transparent",
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
    height: "inherit",
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
    fontSize: 10,
  },
  attributesBox: {
    marginTop: theme.spacing(3),
  },
  switch: {
    "& .MuiSwitch-track": {
      position: "relative",
      backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.5)}`,
    },
    "& .Mui-checked+.MuiSwitch-track": {
      backgroundColor: `rgba${hexToRGBA("#00FFB0", 1)}`,
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#0D1B24",
      width: 14,
      height: 14,
    },
    "& .Mui-checked": {
      "& .MuiSwitch-thumb": {
        backgroundColor: "#FFFFFF",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: "6px",
      top: "6px",
      left: "6px",
    },
  },
  switchLabel: {
    color: theme.palette.primary.light,
  },
  formGroup: {
    marginTop: "-12.5px",
  },
  tableHead: {
    "& th.MuiTableCell-root": {
      padding: theme.spacing(1, 0),
      borderColor: theme.palette.type === "dark" ? "#29475A" : `rgba${hexToRGBA("#003340", 0.2)}`,
    },
    "& .MuiTypography-root": {
      color: theme.palette.primary.light,
    }
  },
  tableBody: {
    "& .MuiTableCell-root": {
      borderBottom: "none",
      padding: theme.spacing(0),
      "&:first-child": {
        padding: theme.spacing(1, 1.5, 1, 0),
      },
    }
  },
}));

export default NftUpload;
