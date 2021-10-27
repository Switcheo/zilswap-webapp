import React from "react";
import { ArkBox } from "app/components";
import { makeStyles } from "@material-ui/core";
import { AppTheme } from "app/theme/types";

interface Props { }

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
}));

const ArkPriceHistoryGraph: React.FC<Props> = (props: Props) => {
  const classes = useStyles();
  return <ArkBox variant="base" className={classes.container}>
    Present Data Here
  </ArkBox>
};

export default ArkPriceHistoryGraph;