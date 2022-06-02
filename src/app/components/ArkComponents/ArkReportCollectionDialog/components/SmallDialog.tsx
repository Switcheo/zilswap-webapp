import React from "react";
import {
  DialogProps, DialogContent, Typography, Box
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import { DialogModal, FancyButton } from "app/components";

interface Props extends Partial<DialogProps> {
  onCloseDialog: () => void;
  onConfirm?: () => void;
  header?: string;
  subHeader?: string;
  details?: string | JSX.Element;
  buttonLabel?: string;
  walletRequired: boolean;
}

const SmallDialog: React.FC<Props> = (props: Props) => {
  const { className, open, header, subHeader, details, buttonLabel, walletRequired,
    onCloseDialog, onConfirm } = props;
  const classes = useStyles();

  return (
    <DialogModal header={header} open={!!open} onClose={onCloseDialog}
      titlePadding={false} className={cls(classes.root, className)}>
      <DialogContent className={cls(classes.dialogContent)}>
        {subHeader &&
          <Typography className={cls(classes.subHeader,
            details ? classes.bottomMargin : classes.largerBottomMargin)}>{subHeader}
          </Typography>}
        {details && <Box className={classes.details}>{details}</Box>}
        <FancyButton color="primary" variant="contained" className={classes.button}
          onClick={onConfirm} walletRequired={walletRequired}>
          {buttonLabel}
        </FancyButton>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiPaper-root": {
      border: theme.palette.type === "dark" ? theme.palette.border : "1px solid #00334033",
    },
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(3, 4),
      color: theme.palette.type === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
      backgroundColor: theme.palette.type === "dark" ? theme.palette.background.default : "#FFFFFF",
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "30px",
        lineHeight: "36px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
      "& button": {
        top: 16
      }
    },
    position: "relative",
  },
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 4, 4),
    minWidth: 310,
    [theme.breakpoints.up('sm')]: {
      width: 428
    },
    overflowY: "auto",
    "&::-webkit-scrollbar-track": {
      marginBottom: theme.spacing(1),
    },
    "&::-webkit-scrollbar": {
      width: "0.5rem"
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
      borderRight: "3px solid transparent",
      backgroundClip: "padding-box"
    },
  },
  subHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 16,
    color: theme.palette.type === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.dark,
    fontWeight: 900,
    textAlign: 'center'
  },
  details: {
    maxWidth: 364,
    margin: "0 auto 24px auto",
    fontFamily: 'Avenir Next',
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.type === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.dark,
    textAlign: 'center',
    lineHeight: "19.65px",
    "& p, a": {
      fontFamily: 'Avenir Next',
      fontSize: 16,
      color: theme.palette.type === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.dark,
      textAlign: 'center',
      lineHeight: "19.65px"
    },
    "& a": {
      textDecoration: "underline"
    }
  },
  button: {
    marginTop: 0,
    borderRadius: "12px",
    display: "flex",
    padding: "18px 32px",
    alignItems: "center",
    minHeight: 24,
    backgroundColor: "#6BE1FF",
    color: theme.palette.primary.main,
    "& .MuiBox-root": {
      minHeight: 24
    },
    "&:hover": {
      backgroundColor: "#60CAE5"
    }
  },
  bottomMargin: {
    marginBottom: "18.78px"
  },
  largerBottomMargin: {
    marginBottom: "24px"
  }
}));

export default SmallDialog;
