import React, { useEffect } from "react";
import { Box, BoxProps } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { ArkNFTListing } from "app/components";
import { BlockchainState, RootState } from "app/store/types";
import SearchFilter from "app/components/ARKFilterBar/components/SearchFilter";

interface Props extends BoxProps {
  address: string,
  filter: 'collected' | 'onSale' | 'liked'
}

const Nfts: React.FC<Props> = (props: Props) => {
  const { address, filter, className } = props;
  const blockchainState = useSelector<RootState, BlockchainState>((state) => state.blockchain);
  const dispatch = useDispatch();
  const addressFilter = address.toLocaleLowerCase();

  useEffect(() => {
    dispatch(actions.MarketPlace.updateFilter({
      collectionAddress: undefined,
      traits: {},
      saleType: {
        fixed_price: filter === 'onSale',
        timed_auction: false,
      },
      likedBy: filter === 'liked' ? addressFilter : undefined,
      owner: filter === 'collected' ? addressFilter : undefined,
    }));
    // eslint-disable-next-line
  }, [blockchainState.ready, address, filter])

  return (
    <Box className={className}>
      <ArkNFTListing filterComponent={
        <Box marginTop={2}>
          <SearchFilter />
        </Box>
      } />
    </Box>
  );
};

export default Nfts;
