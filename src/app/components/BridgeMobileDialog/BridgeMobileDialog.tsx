import React from "react";
import { DialogContent, DialogProps, makeStyles } from "@material-ui/core";
import cls from "classnames";
import { DialogModal, Text } from 'app/components';
import { AppTheme } from "app/theme/types";

interface Props extends Partial<DialogProps> {
  open: boolean;
  onCloseDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const BridgeMobileDialog = (props: Props) => {
  const { className, open, onCloseDialog } = props;
  const classes = useStyles();

  return (
    <DialogModal
      header="Mobile not supported."
      open={open}
      onClose={() => onCloseDialog(false)}
      className={cls(classes.root, className)}
    >
      <DialogContent className={cls(classes.dialogContent)}>
        <Text className={classes.bodyText}>
          ZilBridge is not supported on mobile devices. For the best bridging experience, please perform or 
          resume your transfers on a Desktop device.
        </Text>
      </DialogContent>
  </DialogModal>
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(2.5, 3, 1.5),
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "16px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.2rem",
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    maxWidth: 500,
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
    padding: theme.spacing(0, 3, 2.5),
    display: "flex",
  },
  bodyText: {
    fontSize: "14px",
    lineHeight: "18px",
    fontWeight: 400,
  }
}));

export default BridgeMobileDialog;
