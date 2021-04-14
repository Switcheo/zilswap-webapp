import { makeStyles } from "@material-ui/core";
import cls from "classnames";
import React from "react";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: 28,
    height: 28,
    display: "flex",
    background: "#fff",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 14,
    padding: 4,
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
  return (
    <div className={cls(classes.root, className)}>
      {
        currency === 'ZIL' ? (
          <img 
            className={classes.svg} 
            src={`https://meta.viewblock.io/ZIL/logo`}
            alt={`${currency} Token Logo`}
            loading="lazy"
          />
        ) : (
          <img 
            className={classes.svg} 
            src={`https://meta.viewblock.io/ZIL.${address}/logo`}
            alt={`${currency} Token Logo`}
            loading="lazy"
          />
        )
      }
      
    </div>
  )
};

export default CurrencyLogo;
