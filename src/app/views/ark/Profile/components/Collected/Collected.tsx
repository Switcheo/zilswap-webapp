import React, { useEffect } from "react";
import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { ArkNFTListing } from "app/components";
import { BlockchainState, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";

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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.MarketPlace.updateFilter({ filterPage: "profile", owner: address.toLocaleLowerCase() }));
    // eslint-disable-next-line
  }, [blockchainState.ready])

  // const loadTokens = () => {
  //   runLoadTokens(async () => {
  //     const arkClient = new ArkClient(blockchainState.network); // TODO: refactor client into redux
  //     const { result } = await arkClient.listTokens({ owner: address });

  //     setTokens(result.entries);
  //     dispatch(actions.MarketPlace.updateTokens(result))
  //   })
  // }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <ArkNFTListing filterPage="profile" />
      {/* <Grid container spacing={2} className={classes.nftContainer}>
        {tokens.length > 0 && tokens.map((token: Nft, i: number) => (
          <Grid item key={token.tokenId} xs={12} md={3} className={classes.gridItem}>
            <ArkNFTCard token={token} collectionAddress={token.collection?.address || ""} />
          </Grid>
        ))}
      </Grid> */}
    </Box>
  );
};

export default Collected;
