import React from "react";
import cls from "classnames";
import { Box, BoxProps, makeStyles, Typography } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import { FancyButton, KeyValueDisplay, Text } from "app/components";
import { ReactComponent as WarningIcon } from "app/views/ark/NftView/components/assets/warning.svg";
import { hexToRGBA } from "app/utils";
import { ReactComponent as Checkmark } from "app/views/ark/NftView/components/SellDialog/checkmark.svg";

interface Props extends BoxProps {
  setShowLoadingMint: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingMint: React.FC<Props> = (props: Props) => {
  const { children, className, setShowLoadingMint, ...rest } = props;
  const classes = useStyles();

  const onViewCollection = () => {
    setShowLoadingMint(false);
  }

  return (
    <Box className={classes.root} {...rest} display="flex" flexDirection="column">
      <Typography className={classes.header}>Minting NFTs</Typography>

      <Box display="flex" alignItems="center" marginTop={4} marginBottom={5} position="relative">
        <Box className={cls(classes.stepBar, {
          [classes.stepBarActive]: true,
          [classes.stepBarCompleted]: false
        })}></Box>
        <Box className={cls(classes.step, {
          [classes.stepActive]: true,
          [classes.stepCompleted]: false
        })}>
          {false ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>1</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Text className={classes.stepLabel}>Approve Transaction</Text>
          <Text className={classes.stepDescription}>Approve the transaction on your wallet to start minting.</Text>
        </Box>
      </Box>

      <Box display="flex" marginBottom={5} position="relative">
        <Box className={cls(classes.stepBar, classes.stepBarSecond, {
          [classes.stepBarActive]: false,
          [classes.stepBarCompleted]: false
        })}></Box>
        <Box className={cls(classes.step, {
          [classes.stepActive]: false,
          [classes.stepCompleted]: false
        })}>
          {false ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>2</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Text className={classes.stepLabel}>Minting NFTs</Text>
          <Text className={classes.stepDescription}>You've done your job, now leave the rest to us. Some <br/> backend magic is happening to make sure your minting is smooth sailing.</Text>

          {/* progress bar */}
          <Box mt={2} display="flex">
            <Box className={classes.defaultBackground}>
              <Box className={classes.defaultBar} />
            </Box>

            <Box className={classes.progressBackground} width="50%">
              <Box className={classes.progressBar} />
            </Box>
          </Box>

          <KeyValueDisplay kkey="NFTs minted" mt="6px" className={classes.nftsMinted}>
            <span>25/50</span>
          </KeyValueDisplay>
        </Box>
      </Box>

      <Box display="flex" alignItems="center">
        <Box className={cls(classes.step, {
          [classes.stepActive]: false,
          [classes.stepCompleted]: false
        })}>
          {false ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>3</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Text className={classes.stepLabel}>Complete</Text>
          <Text className={classes.stepDescription}>Minting is complete! Check it out on ARKY.</Text>
        </Box>
      </Box>

      <KeyValueDisplay kkey="Estimated Time" mt="24px" mb="24px" className={classes.estimatedTime}>
        <span>~ 27 Minutes Left</span>
      </KeyValueDisplay>

      <Box className={classes.warningBox}>
        <WarningIcon className={classes.warningIcon} />
        <Text>
          Keep this window open so no data will be lost.
        </Text>
      </Box>

      <FancyButton variant="contained" color="primary" className={classes.actionButton} onClick={onViewCollection} fullWidth>
        View Collection
      </FancyButton>
    </Box>
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(3.75, 4.5, 4.5),
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "35px",
  },
  actionButton: {
    marginTop: theme.spacing(3),
    height: 46,
  },
  warningBox: {
    minHeight: 46,
    width: "100%",
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: `rgba${hexToRGBA(theme.palette.warning.main, 0.2)}`,
    borderRadius: 12,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& .MuiTypography-root": {
      color: `rgba${hexToRGBA(theme.palette.warning.main, 0.8)}`,
      fontSize: "14px",
      lineHeight: "17px",
    }
  },
  warningIcon: {
    height: 24,
    width: 24,
    flex: "none",
    marginRight: theme.spacing(1),
    "& path": {
      stroke: theme.palette.warning.main,
    },
  },
  estimatedTime: {
    "& .MuiTypography-root": {
      color: theme.palette.text?.primary,
      fontSize: "14px",
      lineHeight: "18px",
    }
  },
  step: {
    width: 110,
    height: 52,
    borderRadius: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#223139",
    backgroundImage: "linear-gradient(#29475A, #223139)",
    marginRight: 24,
    position: "relative",
    maxWidth: 54.5,
    minWidth: 53.75,
  },
  stepLabel: {
    fontWeight: "bold",
    fontSize: "16px",
    lineHeight: "19px",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
      marginBottom: theme.spacing(0.5),
    }
  },
  stepDescription: {
    fontSize: "14px",
    lineHeight: "19px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    }
  },
  stepActive: {
    backgroundColor: "#6BE1FF",
    backgroundImage: "none",
    color: "#003340"
  },
  stepCompleted: {
    backgroundColor: "#00FFB0",
    color: "#003340"
  },
  stepBar: {
    position: "absolute",
    top: 50,
    left: 25,
    height: 60,
    width: 6,
    backgroundColor: "#223139",
    backgroundImage: "linear-gradient(#29475A, #223139)",
    zIndex: 0,
  },
  stepBarSecond: {
    height: 130,
  },
  stepBarActive: {
    backgroundImage: "linear-gradient(#6BE1FF, #223139)",
  },
  stepBarCompleted: {
    backgroundImage: "linear-gradient(#00FFB0, #00FFB0)",
  },
  progress: {
    position: "absolute",
  },
  stepNumber: {
    fontFamily: "Avenir Next",
    fontSize: "16px",
    lineHeight: "19px",
  },
  defaultBackground: {
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#D4FFF2", 0.25)}`,
    borderRadius: 5,
    display: "flex",
    padding: "4px",
    width: "100%",
  },
  defaultBar: {
    display: "flex",
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#D4FFF2", 0.5)}`,
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  progressBackground: {
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#00FFB0" : "#6BE1FF", 0.1)}`,
    borderRadius: 5,
    display: "flex",
    padding: "4px",
    marginLeft: "-100%",
  },
  progressBar: {
    display: "flex",
    backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#6BE1FF",
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  nftsMinted: {
    "& .MuiTypography-root": {
      color: theme.palette.text?.primary,
      fontSize: "14px",
      lineHeight: "18px",
    }
  },
}))

export default LoadingMint;
