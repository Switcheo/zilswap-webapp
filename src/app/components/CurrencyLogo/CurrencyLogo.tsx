import { makeStyles } from "@material-ui/core";
import SVG from 'react-inlinesvg';
import cls from "classnames";
import React from "react";
import { AppTheme } from "app/theme/types";
import { ReactComponent as SvgTokenPlaceholder } from "./token-placeholder.svg";

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
  return (
    <div className={cls(classes.root, className)}>
      <SVG
        src={`https://raw.githubusercontent.com/Switcheo/zilswap-token-list/master/logos/${currency}.svg`}
        title={`${currency} Token Logo`}
        description={`${currency} Token Logo`}
        cacheRequests={true}
        loader={<SvgTokenPlaceholder />}
      >
        <SvgTokenPlaceholder />
      </SVG>
    </div>
  )
};

export default CurrencyLogo;
