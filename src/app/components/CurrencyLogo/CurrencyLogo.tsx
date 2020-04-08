import React from "react";
import { ReactComponent as SWTH } from "./SWTH.svg";
import { ReactComponent as ZIL } from "./ZIL.svg";

export type CurrencyLogoMap = {
  [index: string]: any
}

const currencies: CurrencyLogoMap = {
  "SWTH": SWTH,
  "ZIL": ZIL
}

const CurrencyLogo = (props: any) => {
  const { currency, className }: {
    currency: string;
    className: string;
  } = props;
  const Logo = currencies[currency];
  return <div className={className}>
    {Logo ? <Logo /> : null}
  </div>;
};

export default CurrencyLogo;