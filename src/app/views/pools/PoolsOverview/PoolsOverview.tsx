import { Box, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PoolsNavigationTabs, PoolsOverviewBanner } from "app/components";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { PoolsListing } from "./components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

const PoolsOverview: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  // const [searchQuery, setSearchQuery] = useState<string | undefined>();

  // const onSearch = (query?: string) => {
  //   setSearchQuery(query);
  // };

  return (
    <Page {...rest} className={cls(classes.root, className)}>
      <Box mt={8}>
        <Container maxWidth="lg">
          <PoolsOverviewBanner />
        </Container>
      </Box>
      <Box marginTop={6}>
        <Container maxWidth="lg">
          <PoolsNavigationTabs />
          {/* <PoolsSearchInput onSearch={onSearch} marginY={4} /> */}
          <PoolsListing />
        </Container>
      </Box>
      {children}
    </Page>
  );
};

export default PoolsOverview;
