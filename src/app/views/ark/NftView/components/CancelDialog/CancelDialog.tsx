import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Box, CircularProgress, DialogContent, DialogProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { Transaction } from "@zilliqa-js/account";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { DialogModal, Text } from "app/components";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Cheque, Nft, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useToaster } from "app/utils";
import { ArkClient, logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";

interface Props extends Partial<DialogProps> {
  token: Nft;
  onComplete?: (txs: Transaction[]) => Promise<void> | void;
}

const CancelDialog: React.FC<Props> = (props: Props) => {
  const { children, className, token, onComplete, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [sellCheques, setSellCheques] = useState<Cheque[]>([]);
  const [cancelledCheques, setCancelledCheques] = useState<Cheque[]>([]);
  const [runQueryAsks, loadingQueryAsks] = useAsyncTask("cancelQueryAsks");
  const [runCancelSell, loading, error, clearError] = useAsyncTask("cancelSellNft");

  const open = useSelector<RootState, boolean>(state => state.layout.showCancelSellNftDialog);

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowCancelSellNftDialog("close"));
  };

  useEffect(() => {
    if (!wallet?.provider || !open) return;
    clearError();
    runQueryAsks(async () => {
      const { collection: address, id } = match.params
      const arkClient = new ArkClient(network);
      const queryResult = await arkClient.listNftCheques({
        collectionAddress: fromBech32Address(address),
        initiatorAddress: wallet.addressInfo.byte20.toLowerCase(),
        side: "sell",
        isActive: "true",
        tokenId: id,
        limit: 100,
      });

      setSellCheques(queryResult.result.entries);

      cancelSellCheques(queryResult.result.entries);
    });

    // eslint-disable-next-line
  }, [wallet?.addressInfo.byte20, token.collection?.address, token.tokenId, open]);

  const cancelSellCheques = (sellCheques: Cheque[]) => {
    if (!wallet?.provider || !sellCheques.length) return;
    runCancelSell(async () => {
      const arkClient = new ArkClient(network);

      const zilswap = ZilswapConnector.getSDK();
      const cancelTxs: Transaction[] = [];
      for (const cheque of sellCheques) {
        const { chequeHash } = cheque;

        const message = arkClient.arkMessage("Void", chequeHash.replace(/^0x/i, ""));
        const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any;

        const voidChequeResult = await arkClient.voidCheque({
          publicKey, signature, chequeHash,
        }, zilswap);

        zilswap.observeTx({
          hash: voidChequeResult.id!,
          deadline: zilswap.getCurrentBlock() + 1000,
        });

        setCancelledCheques(cancelledCheques => [
          ...cancelledCheques,
          cheque,
        ]);

        dispatch(actions.MarketPlace.listenPendingTx({
          chequeHash,
          txHash: voidChequeResult.id!,
        }));

        cancelTxs.push(voidChequeResult);

        logger("exec trade result", voidChequeResult)
      }


      onCloseDialog();
      onComplete?.(cancelTxs);
      toaster("Cancel listing transactions submitted!")
    });
  };

  return (
    <DialogModal
      header="Cancel Listing"
      open={open}
      onClose={loading ? undefined : onCloseDialog}
      {...rest}
      className={clsx(classes.root, className)}
    >
      <DialogContent className={classes.dialogContent}>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" marginBottom={4} position="relative">
            <Box display="flex" flexDirection="column" alignItems="stretch">
              <Text className={classes.label}>Approve Transaction</Text>
              <Box display="flex" marginTop={1} alignItems="center">
                {loading && (
                  <CircularProgress size="small" className={classes.loader} color="primary" />
                )}
                {!loadingQueryAsks && (
                  <Text>
                    You are cancelling listing: {cancelledCheques.length + 1} of {sellCheques.length}.
                  </Text>
                )}
              </Box>
              {!!error && (
                <Text marginTop={1} color="error">
                  {error?.message ?? error}
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(4.5, 4.5, 5),
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "24px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
      "& .MuiIconButton-root": {
        top: "21px",
        right: "21px",
      },
    },
    position: "relative",
  },
  loader: {
    marginRight: theme.spacing(1),
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2
  },
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 4.5, 2),
    [theme.breakpoints.up("sm")]: {
      width: 436,
    }
  },
}));

export default CancelDialog;
