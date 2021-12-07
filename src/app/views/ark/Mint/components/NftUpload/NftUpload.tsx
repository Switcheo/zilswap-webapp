import React, { useState } from "react";
import cls from "classnames";
import { Box, BoxProps, Tooltip, Typography, FormControl, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/InfoOutlined';
import AddIcon from '@material-ui/icons/AddRounded';
import ClearIcon from "@material-ui/icons/ClearRounded";
import DoneIcon from "@material-ui/icons/DoneRounded";
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { AppTheme } from "app/theme/types";
import { ArkChipInput, ArkInput } from "app/components";
import { hexToRGBA } from "app/utils";
import { AttributeData, NftData } from "../../Mint";
import { ReactComponent as FileIcon } from "./assets/file.svg";
import { ReactComponent as FileSuccessIcon} from "./assets/file-success.svg";
// import { ReactComponent as FileErrorIcon } from "./assets/file-error.svg";

interface Props extends BoxProps {
  nfts: NftData[];
  setNfts: React.Dispatch<React.SetStateAction<NftData[]>>;
  attributes: AttributeData[];
  setAttributes: React.Dispatch<React.SetStateAction<AttributeData[]>>;
}

export type ProgressType = "queued" | "uploaded";

const NftUpload: React.FC<Props> = (props: Props) => {
  const { children, className, attributes, setAttributes, nfts, setNfts, ...rest } = props;
  const classes = useStyles();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ProgressType[]>([]);

  const readFiles = (files: File[]) => {
    const reader = new FileReader();
    const size = nfts.length;

    const readFile = (index: number) => {
      if (index >= files.length) return;

      const file = files[index];
      reader.onload = function(e: ProgressEvent<FileReader>) {  
        if (e.target?.result) {
          const image = e.target.result;

          setNfts(prevState => (
            [
              ...prevState.slice(0, size + index),
              {
                id: file.name.substring(0, file.name.indexOf(".")),
                image,
                attributes: {},
                imageFile: file,
              },
              ...prevState.slice(size + index + 1)
            ]
          ));

          setProgress(prevState => (
            [
              ...prevState.slice(0, size + index),
              "uploaded",
              ...prevState.slice(size + index + 1)
            ]
          ));
        }

        readFile(index + 1);
      }

      reader.readAsDataURL(file);
    }

    readFile(0);
  }

  const onHandleFileDrop = (files: File[], rejection: FileRejection[], dropEvent: DropEvent) => {
    if (!files.length || uploadedFiles.length > 100) {
      return;
    }

    setUploadedFiles([
      ...uploadedFiles,
      ...files
    ]);

    setProgress([
      ...progress,
      ...Array(files.length).fill("queued"),
    ]);

    readFiles(files);
  }

  const handleAttributeNameChange = (index: number, value: string) => {
    const newAttribute = {
      ...attributes[index],
      name: value
    }

    const attributesCopy = attributes.slice();
    attributesCopy[index] = newAttribute;

    setAttributes(
      attributesCopy
    );
  }

  const handleAttributeChange = (index: number, attributeName: string, value: string) => {
    const newNfts = nfts.slice();
    newNfts[index].attributes[attributeName] = value;

    setNfts(
      newNfts
    );
  }

  const handleAddAttribute = () => {
    const newAttribute = {
      name: "",
      values: []
    }

    setAttributes(
      [
        ...attributes,
        newAttribute
      ]
    );
  }

  const handleDeleteChip = (index: number, value: string) => {
    const newAttribute = {...attributes[index]};
    const attributeValues = newAttribute.values;
    attributeValues.splice(attributeValues.indexOf(value), 1);
    
    const attributesCopy = attributes.slice();
    attributesCopy[index] = newAttribute;

    setAttributes(
      attributesCopy
    );
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newAttribute = {...attributes[index]};
    const attributeValues = newAttribute.values;

    const element = event.target as HTMLInputElement;
    const newValue = element.value.trim();

    if (attributeValues.includes(newValue)) {
      return;
    }

    attributeValues.push(newValue);
    
    const attributesCopy = attributes.slice();
    attributesCopy[index] = newAttribute;

    setAttributes(
      attributesCopy
    );
  }

  const handleDeleteAttribute = (attributeToDelete: AttributeData) => {
    const newAttributes = attributes.filter(attribute => attribute !== attributeToDelete);
    const newNfts = nfts.slice();

    newNfts.forEach(nft => {
      delete nft.attributes[attributeToDelete.name];
    })

    setAttributes(
      newAttributes
    );

    setNfts(
      newNfts
    );
  }

  const handleDeleteFile = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number) => {
    event.stopPropagation();
    
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newNfts = nfts.filter((_, i) => i !== index);
    const newProgress = progress.filter((_, i) => i !== index);

    setUploadedFiles(
      newFiles
    );

    setNfts(
      newNfts
    );

    setProgress(
      newProgress
    );
  }

  const handleIdChange = (index: number, newId: string) => {
    const newNfts = nfts.slice();
    newNfts[index].id = newId;

    setNfts(
      newNfts
    );
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
          <Dropzone accept='image/jpeg, image/png, image/gif' onFileDialogCancel={() => {}} onDrop={onHandleFileDrop}>
            {({ getRootProps, getInputProps }) => (
              <Box>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box className={cls(classes.dropBox, { [classes.flex]: !uploadedFiles.length })}>
                    {!uploadedFiles.length && (
                      <Typography className={classes.bannerText}>Drag and drop your folder(s) here.</Typography>
                    )}
                    {!!uploadedFiles.length && (
                      <Box className={classes.dropBoxInner}>
                        <Box className={classes.progressBox} flex={1} onClick={(event) => event.stopPropagation()}>
                          <Box className={classes.progressBoxInner}>
                            {uploadedFiles.map((file, index) => {
                              return (
                                <Box display="flex" justifyContent="space-around" alignItems="center" className={classes.nftProgress}>
                                  {progress[index] === "queued"
                                    ? <FileIcon />
                                    : <FileSuccessIcon />
                                  }
                                  <Box display="flex" flexDirection="column" width="270px">
                                    <Typography className={classes.fileName}>{file.name}</Typography>
                                    <Box className={classes.progressBackground}>
                                      <Box className={cls({[classes.progressBar]: progress[index] === "uploaded"})} />
                                    </Box>
                                    <Typography className={classes.nftStatusText}>
                                      {progress[index] === "queued"
                                        ? "Queued"
                                        : "100% Uploaded"
                                      }
                                    </Typography>
                                  </Box>

                                  <ClearIcon className={classes.deleteFileIcon} onClick={(event) => handleDeleteFile(event, index)} />
                                </Box>
                            )})}
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="center" flex={1}>
                          <Typography className={classes.bannerText}>Drag and drop your files here.</Typography>
                        </Box> 
                      </Box>
                    )}
                  </Box>
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
        <Box>
          <Typography className={classes.header}>
            ATTRIBUTES
          </Typography>
        </Box>

        <Typography className={classes.instruction}>
          Customise attributes according to your NFT collection.
          {" "}
          <Tooltip placement="top" title="Add all attributes that are a part of this colleciton, and assign them to specific NFTs below.">
            <InfoIcon className={classes.infoIcon} />
          </Tooltip>
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" width="30%">
                  <Typography>Attributes</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>Values</Typography>
                </TableCell>
                <TableCell width="5%" />        
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {attributes.map((attribute, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" style={{ verticalAlign: "top" }}>
                      <ArkInput
                        placeholder="Name"
                        value={attribute.name}
                        onValueChange={(value) => handleAttributeNameChange(index, value)}
                      />
                    </TableCell>
                    <TableCell>
                      <ArkChipInput
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        placeholder={attribute.values.length ? "" : 'Separate each value with a semi-colon ";"'}
                        chips={attribute.values}
                        onDelete={(value) => handleDeleteChip(index, value)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <ClearIcon className={classes.deleteAttributeIcon} fontSize="small" onClick={() => handleDeleteAttribute(attribute)} />
                    </TableCell>                      
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Button 
            className={classes.addAttributeButton} 
            variant="outlined" 
            onClick={() => handleAddAttribute()} 
            fullWidth
          >
            <AddIcon />
          </Button>
        </TableContainer>
      </Box>

      {/* Manage NFTs */}
      <Box className={classes.manageNftBox}>
        <Typography className={classes.header}>
          MANAGE NFTs
          {" "}
          <span className={classes.uploadedText}>({nfts.length} uploaded)</span>
        </Typography>
        <Typography className={classes.instruction}>
          Edit names or assign attributes below.
        </Typography>
        <TableContainer className={classes.nftTableContainer}>
          <Table stickyHeader>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left">
                  <Typography>NFT</Typography>
                </TableCell>
                {/* no of attributes */}
                {attributes.length
                  ? attributes.map((attribute) => {
                  return (
                    <TableCell>
                      <Typography>{attribute.name}</Typography>
                    </TableCell>
                  )})
                  : <TableCell>
                    <Typography>Attributes</Typography>
                  </TableCell>
                }
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {/* no. of NFTs */}
              {!!nfts.length && nfts.map((nft, index) => {
                return (
                  <TableRow>
                    <TableCell component="th" scope="row" className={classes.imageCell}>
                      <img src={nft.image?.toString()} alt="NFT" height="39.25px" width="39.25px" className={classes.nftImage} />
                      <ArkInput
                        placeholder="Id"
                        value={nft.id}
                        onValueChange={(value) => handleIdChange(index, value)}
                        className={classes.idInput}
                      />
                    </TableCell>

                    {!!attributes.length && attributes.map((attribute: AttributeData) => {
                      const currAttribute = nfts[index].attributes[attribute.name] ?? "";

                      return (
                        <TableCell>
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
                              value={currAttribute}
                              onChange={(event) => handleAttributeChange(index, attribute.name, event.target.value as string)}
                              renderValue={(currAttribute) => {
                                const selected = currAttribute as string;
                                if (!selected.length) {
                                  return <Typography className={classes.selectPlaceholder}>Select</Typography>;
                                }

                                return selected;
                              }}
                              displayEmpty
                            >
                              {attribute.values.map((attributeValue) => {
                                return (
                                  <MenuItem value={attributeValue}>
                                    {attributeValue}
                                    {attributeValue === currAttribute && (
                                      <DoneIcon fontSize="small" />
                                    )}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </TableCell>
                      )
                    })}
                    {!attributes.length && index === 0 &&
                      <TableCell rowSpan={nfts.length} height={nfts.length * 39.25 + (nfts.length - 1) * 8}>
                        <Box className={classes.emptyState}>
                          <Typography>Add attributes via the <strong>Manage Attributes</strong> section.</Typography>
                        </Box>
                      </TableCell>
                    }
                  </TableRow>
              )})}
              {!nfts.length &&
                <TableRow className={classes.emptyStateRow}>
                  <TableCell component="th" scope="row" width="30%" className={classes.emptyStateCell}>
                    <Box className={cls(classes.emptyState, classes.emptyStatePadding)}>
                      <Typography>Upload your NFTs via the <br/><strong>Upload Files</strong> section.</Typography>
                    </Box>
                  </TableCell>

                  {(!attributes.length) && 
                    <TableCell className={classes.emptyStateCell}>
                      <Box className={cls(classes.emptyState, classes.emptyStatePadding)}>
                        <Typography>Add attributes via the <strong>Manage Attributes</strong> section.</Typography>
                      </Box>
                    </TableCell>
                  }
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
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
    color: theme.palette.primary.light,
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
    borderStyle: "dashed",
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "transparent",
    cursor: "pointer",
    minHeight: "110px",
    padding: theme.spacing(2),
  },
  bannerImage: {
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "100%",
    backgroundPositionX: "center",
    borderRadius: 5,
    width: "100%",
    height: "inherit",
    objectFit: "cover",
    cursor: "pointer",
  },
  bannerText: {
    color: theme.palette.primary.light,
    textAlign: "center",
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
      padding: theme.spacing(1, 1, 0, 0),
    },
  },
  addAttributeButton: {
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
    border: theme.palette.border,
    borderStyle: "dashed",
    borderRadius: 12,
    height: "39.25px",
    marginTop: theme.spacing(2),
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.light,
    },
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
      borderColor: theme.palette.action?.selected,
      "& .MuiSvgIcon-root": {
        color: theme.palette.action?.selected,
      }
    },
  },
  manageNftBox: {
    marginTop: theme.spacing(3),
  },
  formControl: {
    "& .MuiSelect-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
      border: theme.palette.border,
      "&[aria-expanded=true]": {
        borderColor: theme.palette.action?.selected,
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      fontSize: "16px",
      padding: "9.125px 12px",
    },
    "& .MuiSelect-icon": {
      top: "calc(50% - 13px)",
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
    fontSize: "16px",
    lineHeight: "16px",
  },
  deleteAttributeIcon: {
    color: theme.palette.primary.light,
    "&:hover": {
      color: theme.palette.text?.primary,
      cursor: "pointer",
    }
  },
  nftTableContainer: {
    maxHeight: 600,
    maxWidth: 790.938,
    backgroundColor: theme.palette.background.default,
    borderRadius: 12,
    "& .MuiTableCell-root": {
      minWidth: 110,
    },
    "&::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.type === "dark" ? "#DEFFFF" : "#02586D",
      borderRadius: 12,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.type === "dark" ? "#29475A" : "rgba(0, 51, 64, 0.2)",
      borderRadius: 12,
      marginTop: theme.spacing(5),
      marginLeft: theme.spacing(1),
    },
    "&::-webkit-scrollbar-track:horizontal": {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(25),
      boxShadow: "inset 0 0 10px 10px green",
      border: "solid 3px transparent",
    },
    "&::-webkit-scrollbar-corner": {
      background: "rgba(0, 0, 0, 0)",
    },
  },
  progressBox: {
    backgroundColor: theme.palette.currencyInput,
    padding: theme.spacing(1.5),
    borderRadius: 12,
  },
  progressBoxInner: {
    display: "flex",
    flexDirection: "column",
    "&::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.type === "dark" ? "#DEFFFF" : "#02586D",
      borderRadius: 12,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.type === "dark" ? "#29475A" : "rgba(0, 51, 64, 0.2)",
      borderRadius: 12,
    },
    maxHeight: 265,
    overflow: "auto",
  },
  progressBackground: {
    backgroundColor: "rgba(107, 225, 255, 0.2)",
    borderRadius: 5,
    display: "flex",
    padding: "3px",
  },
  progressBar: {
    display: "flex",
    backgroundColor: "#00FFB0",
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  nftProgress: {
    "&:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  nftStatusText: {
    marginTop: "4px",
    fontSize: "10px",
    color: theme.palette.primary.light,
  },
  deleteFileIcon: {
    "&:hover": {
      color: theme.palette.icon,
      cursor: "pointer",
    }
  },
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    marginBottom: "6px", 
    wordBreak: "break-all"
  },
  idInput: {
    marginLeft: theme.spacing(1),
    marginTop: 0,
    "& .MuiFormHelperText-root": {
      display: "none",
    }
  },
  dropBoxInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadedText: {
    color: theme.palette.primary.light,
    fontWeight: 600,
    fontFamily: "Avenir Next",
    fontSize: "12px",
  },
  emptyState: {
    border: theme.palette.border,
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#DEFFFF",
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "inherit!important",
    minHeight: "39.25px",
    "& .MuiTypography-root": {
      color: theme.palette.primary.light,
      textAlign: "center",
    }
  },
  emptyStatePadding: {
    padding: theme.spacing(2),
  },
  emptyStateRow: {
    height: "80px",
  },
  emptyStateCell: {
    height: "inherit!important",
  },
  imageCell: {
    display: "flex",
    position: "sticky",
    left: 0,
    zIndex: 1,
    minWidth: "200px!important",
  },
  nftImage: {
    borderRadius: "12px", 
    verticalAlign: "bottom",
  },
}));

export default NftUpload;
