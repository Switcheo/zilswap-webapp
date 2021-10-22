import React, { useEffect, useState } from "react";
import cls from "classnames";
import {
  Box, BoxProps,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient } from "core/utilities";
import { Cheque } from "app/store/types";
import { getBlockchain } from "app/saga/selectors";
import { ArkBidsTable, ArkToggle } from "app/components";

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
  const { network } = useSelector(getBlockchain);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [bids, setBids] = useState<Cheque[]>([]);
  const [runGetBids] = useAsyncTask("getBids");

  // fetch nft data, if none redirect back to collections / show not found view
  useEffect(() => {
    runGetBids(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.listNftCheques({ initiatorAddress: address, isActive: activeOnly ? 'true' : undefined });

      setBids(result.result.entries);
    })
    // eslint-disable-next-line
  }, [network, address]);

  return (
    <Box className={cls(classes.root, className)}>
      <ArkToggle onCheck={setActiveOnly} label="Show active offers only&nbsp;" />
      <ArkBidsTable bids={bids} />
    </Box>
  );
};

export default BidsReceived;
