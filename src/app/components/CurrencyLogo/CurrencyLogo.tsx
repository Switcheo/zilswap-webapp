import { makeStyles } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
// import { ReactComponent as DAI } from "./DAI.svg";
import cls from "classnames";
import React from "react";
import { TOKENS } from "zilswap-sdk/lib/constants";
import { ReactComponent as SWTH } from "./SWTH.svg";
import { ReactComponent as XSGD } from "./XSGD.svg";
import { ReactComponent as ZIL } from "./ZIL.svg";

export type CurrencyLogoMap = {
  [index: string]: any
};

const currencies: CurrencyLogoMap = {
  [TOKENS.MainNet.ZIL]: ZIL,
  [TOKENS.TestNet.ZIL]: ZIL,
  [TOKENS.TestNet.SWTH]: SWTH,
  [TOKENS.TestNet.XSGD]: XSGD,
};

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
  return (
    <div className={cls(classes.root, className)}>
      {!!Logo && <Logo />}
    </div>
  );
};

export default CurrencyLogo;