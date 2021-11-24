import React, { useState } from "react";
import cls from "classnames";
import { Box, BoxProps, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/InfoOutlined';
import PanoramaIcon from '@material-ui/icons/Panorama';
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { AppTheme } from "app/theme/types";
import { ArkInput } from "app/components";
import { SimpleMap } from "app/utils";

interface Props extends BoxProps {

}

const NftUpload: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  const [displayImage, setDisplayImage] = useState<string | ArrayBuffer | null>(null);
  const [bannerImage, setBannerImage] = useState<string | ArrayBuffer | null>(null);
  const [uploadFile, setUploadFile] = useState<SimpleMap<File>>({});

  const onHandleDisplayDrop = (files: any, rejection: FileRejection[], dropEvent: DropEvent) => {

    if (!files.length) {
      return setDisplayImage(null);
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setDisplayImage(reader.result);
      setUploadFile({ ...uploadFile, display: files[0] });
    }

    reader.readAsDataURL(files[0]);
  }

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
                      <Typography>Drag and drop your files here.</Typography>
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
    border: `2px dotted ${theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF"}`,
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
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
    height: "inherit",
    objectFit: "cover",
    cursor: "pointer",
  },
  footerInstruction: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontWeight: 600,
    fontSize: 10,
  },
}));

export default NftUpload;
