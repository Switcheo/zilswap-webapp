import { Backdrop, Dialog, DialogProps, DialogTitle, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import cls from "classnames";
import React from "react";

export interface DialogModalProps extends DialogProps {
  header?: string;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));
const DialogModal: React.FC<DialogModalProps> = (props: DialogModalProps) => {
  const { children, className, header, onClose, ...rest } = props;
  const classes = useStyles();

  const onCloseButton = (e: any) => {
    if (typeof onClose === "function")
      onClose(e, "backdropClick");
  };

  return (
    <Dialog
      maxWidth={"md"}
      closeAfterTransition
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...rest}
      className={cls(classes.root, className)} >
      <DialogTitle disableTypography>
        <Typography variant="h2">{header}</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onCloseButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {children}
    </Dialog>
  );
};

export default DialogModal;