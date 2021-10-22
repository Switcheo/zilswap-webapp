import React, { useEffect } from "react";
import { Box, BoxProps } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { ArkNFTListing } from "app/components";
import { BlockchainState, RootState } from "app/store/types";
import SearchFilter from "app/components/ARKFilterBar/components/SearchFilter";

interface Props extends BoxProps {
  address: string,
  onSaleOnly: boolean,
}

const Collected: React.FC<Props> = (props: Props) => {
  const { address, onSaleOnly, className } = props;
  const blockchainState = useSelector<RootState, BlockchainState>((state) => state.blockchain);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.MarketPlace.updateFilter({
      collectionAddress: undefined,
      traits: {},
      saleType: {
        fixed_price: onSaleOnly,
        timed_auction: false,
      },
      owner: address.toLocaleLowerCase()
    }));
    // eslint-disable-next-line
  }, [blockchainState.ready, address])

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

export default Collected;
