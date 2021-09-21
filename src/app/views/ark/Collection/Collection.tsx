import { Breadcrumbs, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SvgIcon from "@material-ui/core/SvgIcon";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  breadcrumbs: {
    marginTop: theme.spacing(2),
  },
  breadcrumb: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#6BE1FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
}));

const Collection: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();

  // fetch nfts in collection

  const breadcrumbs = [
    <Link key="1" to="/ark/collections" className={classes.breadcrumb}>
      Collections
    </Link>,
    <Link
      key="2"
      to={`/ark/collections/${match.params.collection}`}
      className={classes.breadcrumb}
    >
      The Bear Market
    </Link>,
  ];

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        {/* Breadcrumbs here */}
        <Breadcrumbs
          className={classes.breadcrumbs}
          separator={
            <SvgIcon fontSize="small">
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                color="#6BE1FF"
                strokeWidth={1.5}
                stroke="rgba(107, 225, 255, 0.2)"
              />
            </SvgIcon>
          }
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Container>
    </ARKPage>
  );
};

export default Collection;
