import React, { useEffect, useState } from "react";
import cls from "classnames";
import {
  Box, BoxProps,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { getBlockchain, getMarketplace } from "app/saga/selectors";
import { ArkBidsTable, ArkToggle } from "app/components";
import { actions } from "app/store";

interface Props extends BoxProps {
  address: string
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2)
  },
}));

const BidsReceived: React.FC<Props> = (props: Props) => {
  const { address, className } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { bidsTable } = useSelector(getMarketplace);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [runGetBids] = useAsyncTask("getBids");

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    runGetBids(async () => {
      dispatch(actions.MarketPlace.updateBidsTable(undefined));

      const arkClient = new ArkClient(network);
      const listFilter: ArkClient.ListChequesParams = { initiatorAddress: address, isActive: activeOnly ? "true" : undefined, side: "buy" }
      const result = await arkClient.listNftCheques(listFilter);

      dispatch(actions.MarketPlace.updateBidsTable({
        bids: result.result.entries,
        ...listFilter,
      }));
    })
    // eslint-disable-next-line
  }, [network, address, activeOnly]);

  return (
    <Box className={cls(classes.root, className)}>
      <ArkToggle onCheck={setActiveOnly} label="Show active offers only&nbsp;" />
      <ArkBidsTable bids={bidsTable?.bids ?? []} />
    </Box>
  );
};

export default BidsReceived;
