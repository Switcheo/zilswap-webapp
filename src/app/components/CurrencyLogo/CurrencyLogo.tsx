import React from "react";
import { ReactComponent as SWTH } from "./SWTH.svg";
import { ReactComponent as ZIL } from "./ZIL.svg";
import { ReactComponent as ETH } from "./ETH.svg";
import { ReactComponent as C0XBTC } from "./0xBTC.svg";
import { ReactComponent as DAI } from "./DAI.svg";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { makeStyles } from "@material-ui/core";

export type CurrencyLogoMap = {
  [index: string]: any
}

const currencies: CurrencyLogoMap = {
  "SWTH": SWTH,
  "ITN": SWTH,
  "ZIL": ZIL,
  "ETH": ETH,
  "0xBTC": C0XBTC,
  "DAI": DAI
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: 28
  }
}));

const CurrencyLogo = (props: any) => {
  const { currency, className }: {
    currency: string;
    className: string;
  } = props;
  const classes = useStyles();
  const Logo = currencies[currency];
  if (!Logo) return null;
  return (
    <div className={cls(classes.root, className)}>
      <Logo />
    </div>
  );
};

export default CurrencyLogo;