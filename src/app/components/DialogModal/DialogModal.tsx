import React from "react";
import { Backdrop, Dialog, DialogProps, DialogTitle, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/CloseRounded";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

export interface DialogModalProps extends DialogProps {
  header?: string;
  hideCloseButton?: boolean;
  titlePadding?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey?.[500],
  },
  dialogTitle: {
    backgroundColor: theme.palette.background.default,
    borderTop:
      theme.palette.border,
    borderLeft:
      theme.palette.border,
    borderRight:
      theme.palette.border,
    borderRadius: "12px 12px 0 0",
  },
  titlePadding: {
    padding: `${theme.spacing(5.5, 3)}!important`,
  },
}));
const DialogModal: React.FC<DialogModalProps> = (props: DialogModalProps) => {
  const {
    children,
    className,
    header,
    hideCloseButton,
    onClose,
    titlePadding,
    ...rest
  } = props;
  const classes = useStyles();

  const onCloseButton = (e: any) => {
    if (typeof onClose === "function") onClose(e, "backdropClick");
  };

  return (
    <Dialog
      maxWidth={"md"}
      closeAfterTransition
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...rest}
      className={cls(classes.root, className)}
    >
      <DialogTitle
        disableTypography
        className={cls(classes.dialogTitle, {
          [classes.titlePadding]: titlePadding,
        })}
      >
        <Typography variant="h3">{header}</Typography>
        {!hideCloseButton && (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onCloseButton}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      {children}
    </Dialog>
  );
};

export default DialogModal;
