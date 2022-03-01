import React, { useState, useRef } from "react";
import cls from "classnames";
import { Box, BoxProps, Button, Typography, FormControl, FormHelperText, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/InfoOutlined';
import AddIcon from '@material-ui/icons/AddRounded';
import ClearIcon from "@material-ui/icons/ClearRounded";
import DoneIcon from "@material-ui/icons/DoneRounded";
import Dropzone, { FileRejection, DropEvent } from "react-dropzone";
import { AppTheme } from "app/theme/types";
import { ArkChipInput, ArkInput, HelpInfo } from "app/components";
import { hexToRGBA } from "app/utils";
import { AttributeData, Errors, NftData } from "../../Mint";
import { ReactComponent as FileIcon } from "./assets/file.svg";
import { ReactComponent as FileSuccessIcon} from "./assets/file-success.svg";
// import { ReactComponent as FileErrorIcon } from "./assets/file-error.svg";

interface Props extends BoxProps {
  nfts: NftData[];
  setNfts: React.Dispatch<React.SetStateAction<NftData[]>>;
  attributes: AttributeData[];
  setAttributes: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  displayErrorBox: boolean;
}

// need to settle failed as well
export type ProgressType = "queued" | "uploaded";

const MAX_FILE_SIZE = 50 * Math.pow(1024, 2);

const NftUpload: React.FC<Props> = (props: Props) => {
  const { children, className, attributes, setAttributes, nfts, setNfts, errors, setErrors, displayErrorBox, ...rest } = props;
  const classes = useStyles();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressType[]>([]);

  const filesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (filesEndRef?.current) {
      filesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

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
                name: file.name.substring(0, file.name.indexOf(".")),
                image,
                attributes: [],
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

          if (errors.nfts)
            setErrors({
              ...errors,
              nfts: "",
            })
        }

        scrollToBottom();

        readFile(index + 1);
      }

      reader.readAsDataURL(file);
    }

    readFile(0);
  }

  const onHandleFileDrop = (files: File[], rejection: FileRejection[], dropEvent: DropEvent) => {
    if (!files.length || uploadedFiles.length > 200) {
      return;
    }

    setUploadedFiles([
      ...uploadedFiles,
      ...files.map(file => file.name)
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

    const newNfts = nfts.slice();
    newNfts.forEach(nft => {
      const attributes = nft.attributes;

      if (attributes[index]) {
        attributes[index].trait_type = value;
      }
    })

    setNfts(
      newNfts
    );
  }

  const handleAttributeChange = (index: number, attributeIndex: number, attributeName: string, value: string) => {
    const newNfts = nfts.slice();
    const newAttribute = { 
      trait_type: attributeName,
      value
    };

    newNfts[index].attributes[attributeIndex] = newAttribute;

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

  const handleDeleteChip = (index: number, valueToDelete: string) => {
    const newAttribute = { ...attributes[index] };
    const attributeValues = newAttribute.values;
    attributeValues.splice(attributeValues.indexOf(valueToDelete), 1);
    
    const attributesCopy = attributes.slice();
    attributesCopy[index] = newAttribute;

    setAttributes(
      attributesCopy
    );

    const newNfts = nfts.slice();
    newNfts.forEach(nft => {
      const attributes = nft.attributes;

      if (attributes[index]?.value === valueToDelete) {
        attributes[index].value = "";
      }
    })

    setNfts(
      newNfts
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

  const handleDeleteAttribute = (attributeToDelete: AttributeData, attributeIndex: number) => {
    const newAttributes = attributes.filter(attribute => attribute !== attributeToDelete);
    const newNfts = nfts.slice();

    newNfts.forEach(nft => {
      nft.attributes.splice(attributeIndex, 1);
    })

    setAttributes(
      newAttributes
    );

    setNfts(
      newNfts
    );
  }

  const handleEndEditChipInput = (index: number, event: React.FocusEvent<HTMLInputElement>) => {
    const newAttribute = {...attributes[index]};
    const attributeValues = newAttribute.values;

    const element = event.target as HTMLInputElement;
    const newValue = element.value.trim();

    if (attributeValues.includes(newValue) || !newValue.length) {
      return;
    }

    attributeValues.push(newValue);
    
    const attributesCopy = attributes.slice();
    attributesCopy[index] = newAttribute;

    setAttributes(
      attributesCopy
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

  const handleNameChange = (index: number, newName: string) => {
    const newNfts = nfts.slice();
    newNfts[index].name = newName;

    setNfts(
      newNfts
    );
  }

  const repeatedAttribute = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (attributes[i].name !== "" && attributes[i].name === attributes[index].name)
        return true;
    }

    return false;
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
        <Typography className={cls(classes.instruction, classes.lineHeight)}>
          Your NFTs will be named according to their file names by default. You may edit them below.
          {" "}
          <HelpInfo 
            className={classes.infoIcon}
            icon={<InfoIcon />}
            placement="top"
            title="We recommend naming your files prior to uploading them for better collection management."
          />
        </Typography>

        <Box>
          <Dropzone accept='image/jpeg, image/png, image/gif' maxSize={MAX_FILE_SIZE} maxFiles={200} onFileDialogCancel={() => {}} onDrop={onHandleFileDrop}>
            {({ getRootProps, getInputProps }) => (
              <Box>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box className={cls(classes.dropBox, { [classes.flex]: !uploadedFiles.length })}>
                    {!uploadedFiles.length && (
                      <Typography className={classes.bannerText}>Drag and drop your file(s) here.</Typography>
                    )}
                    {!!uploadedFiles.length && (
                      <Box className={classes.dropBoxInner}>
                        <Box className={classes.progressBox} flex={1} onClick={(event) => event.stopPropagation()}>
                          <Box className={classes.progressBoxInner}>
                            {uploadedFiles.map((file, index) => {
                              return (
                                <Box key={index} display="flex" justifyContent="space-around" alignItems="center" className={classes.nftProgress}>
                                  {progress[index] === "queued"
                                    ? <FileIcon />
                                    : <FileSuccessIcon />
                                  }
                                  <Box display="flex" flexDirection="column" width="270px">
                                    <Typography className={classes.fileName}>{file}</Typography>
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
                            <div ref={filesEndRef} />
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="center" flex={1}>
                          <Typography className={classes.dropBoxText}>{isXs ? "Upload Files" : "Drag and drop your files here."}</Typography>
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
          Recommended Format: PNG/JPEG/GIF &nbsp;|&nbsp; Maximum Number of Files: 200 &nbsp;|&nbsp; Maximum File Size: 50MB
        </Typography>
        
        {errors.nfts && (
          <FormHelperText className={classes.errorText}>{errors.nfts}</FormHelperText>
        )}
      </Box>

      {/* Attributes */}
      <Box className={classes.attributesBox}>
        <Box>
          <Typography className={classes.header}>
            SET ATTRIBUTES
          </Typography>
        </Box>

        <Typography className={classes.instruction}>
          Customise attributes according to your NFT collection.
          {" "}
          <HelpInfo 
            className={classes.infoIcon}
            icon={<InfoIcon />}
            placement="top"
            title="Add all attributes that are a part of this collection, and assign them to specific NFTs below."
          />
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
                    <TableCell component="th" scope="row" className={classes.alignTop}>
                      <ArkInput
                        placeholder="Name"
                        value={attribute.name}
                        onValueChange={(value) => handleAttributeNameChange(index, value)}
                        error={repeatedAttribute(index) ? "Please rename this attribute." : (!attribute.name && displayErrorBox) ? "Add attribute name." : ""}
                        errorBorder={repeatedAttribute(index) || (!attribute.name && displayErrorBox)}
                      />
                    </TableCell>
                    <TableCell className={classes.alignTop}>
                      <ArkChipInput
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onInputBlur={(event) => handleEndEditChipInput(index, event)}
                        placeholder={!attribute.values.length ? 'Separate each value with a semi-colon ";"' : ""}
                        chips={attribute.values}
                        onDelete={(value) => handleDeleteChip(index, value)}
                        error={(!attribute.values.length && displayErrorBox) ? "Add attribute values." : ""}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <ClearIcon
                        // to clean up
                        className={cls(classes.deleteAttributeIcon, { [classes.marginTop]: !(repeatedAttribute(index) || ((!attribute.name || !attribute.values.length) && displayErrorBox)) })} 
                        fontSize="small" 
                        onClick={() => handleDeleteAttribute(attribute, index)} 
                      />
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
            <AddIcon className={classes.addIcon} />
          </Button>
        </TableContainer>
      </Box>

      {/* Manage NFTs */}
      <Box className={classes.manageNftBox}>
        <Typography className={classes.header}>
          MANAGE NFTs
          {" "}
          |
          {" "}
          <span>{nfts.length} Uploaded</span>
        </Typography>
        <Typography className={cls(classes.instruction, classes.lineHeight)}>
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
                      !!attribute.values.length && (
                        <TableCell>
                          <Typography>{attribute.name}</Typography>
                        </TableCell>
                      )
                    )
                  })
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
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" className={classes.imageCell}>
                      <Box className={classes.nftImageBox}>
                        <img src={nft.image?.toString()} alt="NFT" className={classes.nftImage} />
                      </Box>
                      <ArkInput
                        placeholder="Name"
                        value={nft.name}
                        onValueChange={(value) => handleNameChange(index, value)}
                        className={classes.nameInput}
                        error={!nft.name ? "Add a name for this NFT" : ""}
                        errorBorder={!nft.name}
                      />
                    </TableCell>

                    {!!attributes.length && attributes.map((attribute, attributeIndex) => {
                      const currAttribute = nfts[index].attributes[attributeIndex]?.value ?? "";

                      return (
                        !!attribute.values.length && (
                          <TableCell className={classes.cellWidth}>
                            <FormControl 
                              className={cls(classes.formControl, { [classes.error]: !currAttribute.length && displayErrorBox, [classes.light]: !currAttribute.length })} 
                              fullWidth
                            >
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
                                onChange={(event) => handleAttributeChange(index, attributeIndex, attribute.name, event.target.value as string)}
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
                      )
                    })}
                    {!attributes.length && index === 0 &&
                      <TableCell rowSpan={nfts.length} height={nfts.length * 39.25 + (nfts.length - 1) * 8} className={classes.removePaddingRight}>
                        <Box className={classes.emptyState}>
                          <Typography>Add attributes via the <strong>Set Attributes</strong> section.</Typography>
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
                    <TableCell className={cls(classes.emptyStateCell, classes.removePaddingRight)}>
                      <Box className={cls(classes.emptyState, classes.emptyStatePadding)}>
                        <Typography>Add attributes via the <strong>Set Attributes</strong> section.</Typography>
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
    fontSize: 13,
    margin: theme.spacing(.4, 0),
    marginBottom: "4px",
    [theme.breakpoints.down("xs")]: {
      fontSize: 12,
    },
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "16px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: 900,
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    }
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
  dropBoxText: {
    color: theme.palette.primary.light,
    textAlign: "center",
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  footerInstruction: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.type === "dark" ? "#DEFFFF99" : "#00334099",
    fontWeight: 600,
    fontSize: 11,
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
  addIcon: {
    transition: "color 0.2s" // in sync with border
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
      fontSize: "13px",
      padding: "10.9px 12px",
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
      fontSize: "13px",
      paddingLeft: "12.5px",
      paddingRight: "10px",
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
    fontSize: "13px",
    color: theme.palette.primary.light,
  },
  light: {
    "& .MuiSelect-icon": {
      fill: theme.palette.primary.light,
    },
    "& .MuiSelect-iconOpen": {
      fill: theme.palette.action?.selected,
    },
  },
  deleteAttributeIcon: {
    color: theme.palette.primary.light,
    "&:hover": {
      color: theme.palette.text?.primary,
      cursor: "pointer",
    }
  },
  nftTableContainer: {
    maxHeight: 503.5,
    maxWidth: 790.938,
    borderRadius: 12,
    backgroundColor: theme.palette.background.default,
    paddingBottom: theme.spacing(1),
    "& .MuiTableCell-root": {
      minWidth: 110,
      backgroundColor: theme.palette.background.default,
    },
    "& .MuiTableCell-alignLeft": {
      zIndex: 3,
    },
    "& .MuiTableCell-stickyHeader": {
      backgroundColor: theme.palette.background.default,
      top: "",
      left: "",
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
      marginLeft: theme.spacing(29.4),
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
    width: "100%",
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
  nameInput: {
    minWidth: "180px",
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
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column-reverse",
    }
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
  nftImageBox: {
    height: "39.25px",
    width: "39.25px",
    overflow: "hidden",
    borderRadius: "12px",
    minWidth: "39.25px",
    backgroundColor: "#002A34",
  },
  nftImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    verticalAlign: "bottom",
  },
  removePaddingRight: {
    paddingRight: "0px!important",
  },
  error: {
    "& .MuiSelect-root": {
      border: "1px solid #FF5252",
    },
  },
  errorText: {
    color: "#FF5252",
    marginTop: "-12px",
    fontSize: 10,
  },
  alignTop: {
    verticalAlign: "top",
  },
  cellWidth: {
    minWidth: "180px!important",
  },
  marginTop: {
    marginTop: "14px",
  },
  lineHeight: {
    lineHeight: 1.66,
  }
}));

export default React.memo(NftUpload);
