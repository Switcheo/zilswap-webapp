import { makeStyles } from "@material-ui/core";
import SVG from 'react-inlinesvg';
import cls from "classnames";
import React from "react";
import { AppTheme } from "app/theme/types";
import { ReactComponent as SvgTokenPlaceholder } from "./token-placeholder.svg";

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
  const { currency, className }: {
    currency: string | false;
    className: string;
  } = props;
  const classes = useStyles();
  return (
    <div className={cls(classes.root, className)}>
      {
        currency ?
        <SVG
          className={classes.svg}
          src={`https://raw.githubusercontent.com/Switcheo/zilswap-token-list/master/logos/${currency}.svg`}
          title={`${currency} Token Logo`}
          description={`${currency} Token Logo`}
          cacheRequests={true}
          loader={<SvgTokenPlaceholder />}
        >
          <SvgTokenPlaceholder />
        </SVG>
        :
        <SvgTokenPlaceholder />
      }
    </div>
  )
};

export default CurrencyLogo;
