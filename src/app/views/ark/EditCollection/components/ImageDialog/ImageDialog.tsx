import React from "react";
import { Button, DialogProps, Typography, DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { DialogModal } from "app/components";
import { AppTheme } from "app/theme/types";

interface Props extends Partial<DialogProps> {
  onCloseDialog?: () => void;
  onClickConfirm?: () => void;
  message?: string;
  buttonText?: string;
  header?: string;
  cancelText?: string;
}

const ImageDialog: React.FC<Props> = (props: Props) => {
  const {
    message = "Select from your NFT collection or upload manually.",
    buttonText = "Head to Collected", header = "Profile Photo", cancelText = "Upload",
    open, onCloseDialog, onClickConfirm, children, className, ...rest
  } = props;
  const classes = useStyles();

  const onConfirm = () => {
    if (onCloseDialog) onCloseDialog();
    if (onClickConfirm) onClickConfirm();
  }

  const onClose = () => {
    setTimeout(() => {
      if (onCloseDialog) onCloseDialog();
    }, 100)
  }

  if (!open) return null;
  return (
    <DialogModal
      open={!!open}
      onClose={onCloseDialog}
      header={header}
      {...rest} className={cls(classes.root, className)}
    >
      <DialogContent className={classes.dialogContent}>
        <Typography className={classes.message}>{message}</Typography>
        <Button onClick={() => onConfirm()} className={classes.labelButton}>{buttonText}</Button>
        <label htmlFor={cancelText === "Upload" ? "ark-profile-image" : undefined} onClick={() => onClose()} className={classes.uploadButton}>
          <Typography className={classes.collectionText}>{cancelText}</Typography>
        </label>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(5, 5, 2),
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "24px",
        linHeight: "36px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
    },
    position: "relative",
  },
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft:
      theme.palette.border,
    borderRight:
      theme.palette.border,
    borderBottom:
      theme.palette.border,
    borderRadius: "0 0 12px 12px",
    overflowY: "auto",
    padding: theme.spacing(2, 4, 5),
    minWidth: 364,
    [theme.breakpoints.down("sm")]: {
      minWidth: 300,
    },
  },
  labelButton: {
    display: "flex",
    justifyContent: "center",
    height: 56,
    minWidth: 200,
    borderRadius: 12,
    width: "100%",
    padding: "8px 16px",
    backgroundColor: "#6BE1FF",
    marginTop: theme.spacing(1),
    cursor: "pointer",
    textAlign: "center",
    alignItems: "center",
    "&:hover": {
      backgroundColor: "rgba(107, 225, 255, 0.8)",
      opacity: 0.5,
    },
    "& .MuiButton-label": {
      color: "#003340",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
  },
  uploadButton: {
    display: "flex",
    justifyContent: "center",
    height: 56,
    minWidth: 200,
    width: "100%",
    borderRadius: 12,
    padding: "8px 16px",
    backgroundColor: "#003340",
    marginTop: theme.spacing(1),
    cursor: "pointer",
    textAlign: "center",
    alignItems: "center",
    "& .MuiButton-label": {
      color: "#DEFFFF",
    },
    "&:hover": {
      backgroundColor: "rgba(222, 255, 255, 0.08)",
      opacity: 0.5,
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
  },
  collectionText: {
    color: theme.palette.primary.contrastText,
    fontSize: 16,
  },
  message: {
    marginBottom: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
    wordBreak: "break-word"
  },
}));

export default ImageDialog;
