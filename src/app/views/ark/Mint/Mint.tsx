import React, { useState } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import ArkPage from "app/layouts/ArkPage";
import { getWallet } from "app/saga/selectors";
import { CollectionDetail, NftUpload } from "./components";

export type CollectionInputs = {
  collectionName: string;
  description: string;
  royalties: string;
  websiteUrl: string;
  discordLink: string;
  twitterHandle: string;
  instagramHandle: string;
  telegramLink: string;
}

const Mint: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector(getWallet);
  const [inputValues, setInputValues] = useState<CollectionInputs>({
    collectionName: "",
    description: "",
    royalties: "",
    websiteUrl: "",
    discordLink: "",
    twitterHandle: "",
    instagramHandle: "",
    telegramLink: "",
  })

  return (
    <ArkPage {...rest}>
      <Container className={cls(classes.root, className)} maxWidth="sm">
        {wallet && (
          <Box>
            <CollectionDetail setInputValues={setInputValues} inputValues={inputValues} />
            <NftUpload />
          </Box>
        )}
        {!wallet && (
          <Box mt={12} display="flex" justifyContent="center">
            <Box display="flex" flexDirection="column" textAlign="center">
              <Typography className={classes.connectionText} variant="h1">
                Your wallet is not connected.
              </Typography>
              <Typography className={classes.connectionText} variant="body1">
                Please connect your wallet to view this page.
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </ArkPage>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Raleway', sans-serif",
    [theme.breakpoints.down("sm")]: {
      alignItems: "normal",
    }
  },
  connectionText: {
    margin: theme.spacing(1),
  },
}));

export default Mint;
