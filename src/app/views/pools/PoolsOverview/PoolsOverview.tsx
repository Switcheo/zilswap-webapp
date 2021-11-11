import React from "react";
import { Box, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { PoolsOverviewBanner } from "app/components";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
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
      <Container maxWidth="lg">
        {/* <PoolsSearchInput onSearch={onSearch} marginY={4} /> */}
        <PoolsListing />
      </Container>
      {children}
    </Page>
  );
};

export default PoolsOverview;
