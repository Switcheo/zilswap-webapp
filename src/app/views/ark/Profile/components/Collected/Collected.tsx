import React, { useEffect, useState } from "react";
import { Box, BoxProps, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { ArkClient } from "core/utilities";
import { actions } from "app/store";
import { ArkNFTCard } from "app/components";
import { BlockchainState, Nft, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";

interface Props extends BoxProps {
  address: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  nftContainer: {
    marginTop: theme.spacing(3),
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const Collected: React.FC<Props> = (props: Props) => {
  const { address, children, className, ...rest } = props;
  const classes = useStyles();
  const blockchainState = useSelector<RootState, BlockchainState>((state) => state.blockchain);
  const [runLoadTokens] = useAsyncTask("loadTokens");
  const [tokens, setTokens] = useState<any>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address && blockchainState.ready) {
      loadTokens();
    }
    // eslint-disable-next-line
  }, [blockchainState.ready])

  const loadTokens = () => {
    runLoadTokens(async () => {
      const arkClient = new ArkClient(blockchainState.network); // TODO: refactor client into redux
      const { result } = await arkClient.listTokens({ owner: address });

      setTokens(result.entries);
      dispatch(actions.MarketPlace.updateTokens(result))
    })
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Grid container spacing={2} className={classes.nftContainer}>
        {tokens.length > 0 && tokens.map((token: Nft, i: number) => (
          <Grid item key={token.tokenId} xs={12} md={3} className={classes.gridItem}>
            <ArkNFTCard token={token} collectionAddress={token.collection?.address || ""} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Collected;
