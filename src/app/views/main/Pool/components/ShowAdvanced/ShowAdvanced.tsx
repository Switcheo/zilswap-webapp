import { Divider, makeStyles, Typography } from "@material-ui/core";
import { ContrastBox, KeyValueDisplay } from "app/components";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import React from "react";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {

  },
  showAdvanced: {
    padding: `20px ${theme.spacing(8)}px 52px ${theme.spacing(8)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  selectRoot: {
    height: 30,
    display: "table",
  },
  select: {
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  expire: {
    height: 30,
    width: 60,
    marginRight: theme.spacing(1),
    textAlign: "center"
  },
  selectedDropdown: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.background.default,
    borderRadius: 2
  },
  tooltipSVG: {
    marginLeft: theme.spacing(1),
    height: 12,
    verticalAlign: "middle"
  },
  tooltip: {
    backgroundColor: theme.palette.background.tooltip,
    color: theme.palette.background.default
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  minutes: {
    display: "flex",
    alignItems: "center"
  },
  text: {
    fontWeight: 400,
    letterSpacing: 0
  },
  bold: {
    fontWeight: 500
  },
  selectMenu: {
    padding: 2
  }
}));

const ShowAdvanced = (props: any) => {
  const { showAdvanced, poolValue } = props;
  const classes = useStyles();
  const state = useSelector<RootState, { [key: string]: any }>(state => state.pool.values);
  const { withdrawCurrency } = state;

  if (!showAdvanced) return null;

  return (
    <ContrastBox className={classes.showAdvanced}>
      <Typography className={classes.text} variant="body2">You are removing <span className={classes.bold}>{(0).toLocaleString("en-US", { maximumFractionDigits: 10 })} ZIL{withdrawCurrency && ` + {0} {withdrawCurrency}`}</span> from the liquidity pool. (<span className={classes.bold}>~{(0).toLocaleString("en-US", { maximumFractionDigits: 10 })}</span> Liquidity tokens)</Typography>
      <Divider className={classes.divider} />
      <KeyValueDisplay mt={"22px"} kkey={"Current Total Supply"} value={`${parseFloat(poolValue.tokenReserve).toLocaleString("en-US", { maximumFractionDigits: 10 })} Liquidity Tokens`} />
      <KeyValueDisplay mt={"22px"} kkey={"Each Pool Token Value"} value={`${1 * poolValue.exchangeRate} ZIL${withdrawCurrency ? ` + ${(parseFloat("0")).toLocaleString("en-US", { maximumFractionDigits: 10 })} ${withdrawCurrency}` : ""}`} />

    </ContrastBox >
  )
}

export default ShowAdvanced;