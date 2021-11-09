import React from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import { PoolsListing } from "app/views/pools/PoolsOverview/components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

const PoolLiquidity: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();


  return (
    <Page {...rest} className={cls(classes.root, className)}>
      <Container maxWidth="lg">
        <PoolsListing ownedLiquidity={true} />
      </Container>
      {children}
    </Page>
  );
};

export default PoolLiquidity;
