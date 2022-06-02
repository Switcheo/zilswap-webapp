import React from "react";
import { Box, Typography, Link, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { ReactComponent as WarningIcon } from "app/assets/icons/warning.svg";

interface Props extends Partial<BoxProps> {
  collectionAddress: string;
  reportState: number | null | undefined;
}

const ArkReportedBanner: React.FC<Props> = (props: Props) => {
  const { reportState } = props;
  const classes = useStyles();

  const link = "https://docs.zilswap.io/arky/report";

  const generateLabel = () => {
    return reportState === 1 ? (
      <Typography className={classes.warning}>This collection was reported for
        suspicious activity. <Link href={link} target="_blank">Learn More</Link></Typography>
    ) : (
      <Typography className={classes.suspicious}>This collection was reported for
        suspicious activity and cannot be traded on ARKY. <Link href={link} target="_blank">What happens next?</Link></Typography>
    )
  }

  return (
    <Box className={cls(classes.bannerContainer,
      reportState === 1 ? classes.warningBanner : classes.suspiciousBanner)}>
      <WarningIcon className={reportState === 1 ? classes.warningIcon : classes.suspiciousIcon} />
      {generateLabel()}
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  bannerContainer: {
    width: "100%",
    padding: theme.spacing(1.5),
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: " center",
    "& p": {
      fontSize: 14,
      lineHeight: "17.2px",
      marginLeft: 10,
      "& a": {
        textDecoration: "underline",
        color: "inherit"
      }
    },
  },
  warningBanner: {
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: "rgba(255, 223, 107, 0.2)",
  },
  suspiciousBanner: {
    border: "1px solid #FF5252",
    backgroundColor: "rgba(255, 82, 82, 0.2)",
  },
  warning: {
    color: theme.palette.warning.main
  },
  suspicious: {
    color: "#FF5252"
  },
  warningIcon: {
    "& path": {
      stroke: theme.palette.warning.main
    }
  },
  suspiciousIcon: {
    "& path": {
      stroke: "#FF5252"
    }
  },
}));

export default ArkReportedBanner;
