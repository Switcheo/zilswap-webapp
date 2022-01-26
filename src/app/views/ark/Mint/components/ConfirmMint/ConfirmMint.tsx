import React from "react";
import { Box, BoxProps, Typography, Checkbox, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { AppTheme } from "app/theme/types";
import { FancyButton } from "app/components";

interface Props extends BoxProps {
  acceptTerms: boolean;
  setAcceptTerms: React.Dispatch<React.SetStateAction<boolean>>;
  onDeployCollection: () => void;
  isMintEnabled: boolean;
  loadingDeployCollection: boolean;
}

const ConfirmMint: React.FC<Props> = (props: Props) => {
  const { acceptTerms, isMintEnabled, setAcceptTerms, onDeployCollection, loadingDeployCollection, children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root} {...rest}>
      <Box mb={4}>
        <Typography className={classes.pageHeader}>3. Confirm Mint</Typography>
      </Box>

      <Typography className={classes.confirmMintText}>
        Please ensure that all information is correct before minting your collection.
        {" "}
        <span className={classes.warningText}>Your NFTs cannot be edited once they have been minted.</span>
      </Typography>

      {/* Terms */}
      <Box className={classes.termsBox}>
        <FormControlLabel
          control={
            <Checkbox
              className={classes.radioButton}
              checkedIcon={<CheckedIcon />}
              icon={<UncheckedIcon fontSize="small" />}
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              disableRipple
            />
          }
        label={
          <Typography className={classes.confirmMintText}>
          By checking this box, I accept ARKY's terms and conditions.
          </Typography>
          }
        />
      </Box>

      <FancyButton variant="contained" color="primary" className={classes.mintButton} disabled={!isMintEnabled || loadingDeployCollection} onClick={onDeployCollection}>
        Mint NFTs
      </FancyButton>
    </Box>
  )
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(5),
  },
  pageHeader: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 30,
    fontWeight: 700,
  },
  warningText: {
    color: "#FF5252",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  termsBox: {
    display: "flex",
    justifyContent: "flex-start",
    marginLeft: 2,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    "& .MuiFormControlLabel-root": {
      marginLeft: "-8px",
      marginRight: 0,
    },
  },
  mintButton: {
    height: 46,
    maxWidth: 500,
  },
  confirmMintText: {
    fontSize: "13px",
    lineHeight: "16px",
  },
}));

export default ConfirmMint;
