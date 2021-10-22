import React from "react";
import { DialogContent, DialogProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { DialogModal, FancyButton, Text } from "app/components";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient, logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";

interface Props extends Partial<DialogProps> {
  token: Nft;
}

const CancelDialog: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [runCancelSell, loading, error] = useAsyncTask("cancelSellNft");

  const open = useSelector<RootState, boolean>(state => state.layout.showCancelSellNftDialog);

  const onClose = () => {
    dispatch(actions.Layout.toggleShowCancelSellNftDialog("close"));
  };

  const onConfirm = () => {
    if (!wallet?.provider || !token.bestAsk) return;
    runCancelSell(async () => {
      const { collection: address, id } = match.params

      const arkClient = new ArkClient(network);
      const cheque = token.bestAsk!;

      const chequeHash = arkClient.arkChequeHash({
        side: cheque.side as "Buy" | "Sell",
        token: { address, id, },
        price: {
          address: cheque.price.address,
          amount: new BigNumber(cheque.price.amount),
        },
        feeAmount: new BigNumber(cheque.feeAmount),
        expiry: cheque.expiry,
        nonce: cheque.nonce,
      });

      const message = arkClient.arkMessage("Void", chequeHash)
      const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any

      const execTradeResult = await arkClient.voidCheque({
        publicKey,
        signature,
        chequeHash,
      }, ZilswapConnector.getSDK());

      logger("exec trade result", execTradeResult)
    });
  };

  return (
    <DialogModal header="Cancel Listing" onClose={onClose} {...rest} open={open} className={cls(classes.root, className)}>
      <DialogContent>
        {error && (
          <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
        )}
        <FancyButton walletRequired loading={loading} variant="contained" color="primary" onClick={onConfirm}>
          Confirm Cancel
        </FancyButton>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

export default CancelDialog;
