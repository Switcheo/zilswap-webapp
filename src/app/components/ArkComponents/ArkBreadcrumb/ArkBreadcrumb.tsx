import React from "react";
import { BoxProps, Breadcrumbs, SvgIcon } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { AppTheme } from "app/theme/types";

export type typeCrumbData = {
  value: string;
  path: string;
};
interface Props extends BoxProps {
  linkPath: typeCrumbData[];
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  breadcrumb: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: theme.palette.text?.primary,
    // "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    // "-webkit-text-stroke-width": "1px",
  },
  separator: {
    color: theme.palette.text?.primary,
  },
}));

const ArkBreadcrumb: React.FC<Props> = (props: Props) => {
  const { linkPath, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Breadcrumbs
      className={classes.root}
      separator={
        <SvgIcon fontSize="small" className={classes.separator}>
          <path
            d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
            color="inherit"
            // strokeWidth={1.5}
            // stroke="rgba(107, 225, 255, 0.2)"
          />
        </SvgIcon>
      }
      aria-label="breadcrumb"
      {...rest}
    >
      {linkPath.map((linkData, index) => (
        <Link key={index} to={linkData.path} className={classes.breadcrumb}>
          {linkData.value}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default ArkBreadcrumb;
