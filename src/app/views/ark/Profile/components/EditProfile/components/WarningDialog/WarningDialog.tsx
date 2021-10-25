import React from "react";
import { Button, DialogProps, Typography, DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { DialogModal } from "app/components";
import { AppTheme } from "app/theme/types";

interface Props extends Partial<DialogProps> {
  onCloseDialog?: () => void;
  onBack?: () => void;
  clearPrompt?: () => void;
}

const WarningDialog: React.FC<Props> = (props: Props) => {
  const { clearPrompt, onBack, open, onCloseDialog, children, className, ...rest } = props;
  const classes = useStyles();

  const saveAndNavigate = () => {
    if (onCloseDialog) onCloseDialog();
    if (clearPrompt) clearPrompt();
  }

  const closeAndNavigate = () => {
    if (onCloseDialog) onCloseDialog();
    if (onBack) onBack();
    if (clearPrompt) clearPrompt();
  }

  return (
    <DialogModal
      open={!!open}
      onClose={onCloseDialog}
      header="Save Changes"
      {...rest} className={cls(classes.root, className)}
    >
      <DialogContent className={classes.dialogContent}>
        <Typography className={classes.message}>Do you want to save your profile updates before heading there?</Typography>
        <Button onClick={() => saveAndNavigate()} className={classes.labelButton}>Yes</Button>
        <Button onClick={() => closeAndNavigate()} className={classes.uploadButton}>No</Button>
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

export default WarningDialog;
