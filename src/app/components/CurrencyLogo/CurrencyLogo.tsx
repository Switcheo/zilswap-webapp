import { makeStyles, useTheme } from "@material-ui/core";
import cls from "classnames";
import React from "react";
import { AppTheme } from "app/theme/types";
import { useNetwork } from "app/utils";
import { Network } from "zilswap-sdk/lib/constants";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: 28,
    height: 28,
    display: "flex",
    borderRadius: 14,
    padding: 2,
  },
  svg: {
    maxWidth: "100%",
    width: "unset",
    height: "unset",
    flex: 1,
  },
}));

const CurrencyLogo = (props: any) => {
  const { currency, address, className }: {
    currency: string | false;
    address: string;
    className: string;
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const network = useNetwork();

  const tokenKey = currency === 'ZIL' ? '' : `.${address}`
  var tokenIconUrl: string

  if(network === Network.TestNet) {
    tokenIconUrl = `https://dr297zt0qngbx.cloudfront.net/tokens/testnet/${address}`
  } else {
    tokenIconUrl = `https://meta.viewblock.io/ZIL${tokenKey}/logo${theme.palette.type === "dark" ? '?t=dark' : ''}`
  }

  return (
    <div className={cls(classes.root, className)}>
      <img 
        className={classes.svg} 
        src={tokenIconUrl}
        alt={`${currency} Token Logo`}
        loading="lazy"
      />
    </div>
  )
};

export default CurrencyLogo;
