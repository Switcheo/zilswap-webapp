import React from "react";
import { DialogContent, DialogProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { ZIL_HASH } from "zilswap-sdk/lib/constants";
import { ZilswapConnector } from "core/zilswap";
import { ArkClient, logger } from "core/utilities";
import { useAsyncTask } from "app/utils";
import { AppTheme } from "app/theme/types";
import { RootState } from "app/store/types";
import { actions } from "app/store";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { DialogModal, FancyButton, Text } from "app/components";

interface Props extends Partial<DialogProps> {
}

const BuyDialog: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");

  const open = useSelector<RootState, boolean>(state => state.layout.showBuyNftDialog);

  const onClose = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("close"));
  };

  const onConfirm = () => {
    if (!wallet?.provider || !match.params?.collection || !match.params?.id) return;
    runConfirmPurchase(async () => {
      const { collection: address, id } = match.params
      const arkClient = new ArkClient(network);
      const price = { amount: new BigNumber(10000), address: ZIL_HASH };
      const nonce = ~~(Math.random() * 4294967295); // uint32 max 4294967295
      const currentBlock = ZilswapConnector.getCurrentBlock();
      const expiry = currentBlock + 100; // blocks
      const msg = arkClient.arkMessage("Execute", arkClient.arkChequeHash({
        side: "Buy",
        price,
        token: { address, id, },
        feeAmount: new BigNumber(250),
        expiry,
        nonce,
      }))

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(msg as any)) as any

      const result = await arkClient.postTrade({
        publicKey,
        signature,

        collectionAddress: address,
        address: wallet.addressInfo.byte20.toLowerCase(),
        tokenId: id,
        side: "Buy",
        expiry,
        nonce,
        price,
      });

      logger("post trade", result);
    });
  };

  return (
    <DialogModal header="Confirm Purchase" onClose={onClose} {...rest} open={open} className={cls(classes.root, className)}>
      <DialogContent>
        {error && (
          <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
        )}
        <FancyButton walletRequired loading={loading} variant="contained" color="primary" onClick={onConfirm}>
          Confirm Purchase
        </FancyButton>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

export default BuyDialog;
