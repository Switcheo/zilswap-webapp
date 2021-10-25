import React, { useEffect } from "react";
import { Box, BoxProps } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { ArkNFTListing, ArkSearchFilter } from "app/components";
import { BlockchainState, RootState } from "app/store/types";

interface Props extends BoxProps {
  address: string,
  filter: 'collected' | 'onSale' | 'liked'
}

const Nfts: React.FC<Props> = (props: Props) => {
  const { address, filter, className } = props;
  const blockchainState = useSelector<RootState, BlockchainState>((state) => state.blockchain);
  const dispatch = useDispatch();
  const addressFilter = address.toLowerCase();

  useEffect(() => {
    dispatch(actions.MarketPlace.updateFilter({
      collectionAddress: undefined,
      traits: {},
      saleType: {
        fixed_price: filter === 'onSale',
        timed_auction: false,
      },
      likedBy: filter === 'liked' ? addressFilter : undefined,
      owner: ['collected', 'onSale'].includes(filter) ? addressFilter : undefined,
    }));
    // eslint-disable-next-line
  }, [blockchainState.ready, address, filter])

  return (
    <Box className={className}>
      <ArkNFTListing filterComponent={
        <Box marginTop={2}>
          <ArkSearchFilter />
        </Box>
      } />
    </Box>
  );
};

export default Nfts;
