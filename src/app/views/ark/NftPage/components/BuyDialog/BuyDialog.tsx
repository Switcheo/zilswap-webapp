import { DialogContent, DialogProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal, FancyButton, Text } from "app/components";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { NftCard } from "app/views/ark/Collection/components";
import { Nft } from "app/store/marketplace/types";

interface Props extends Partial<DialogProps> {
  token: Nft;
  collectionAddress: string;
}

const BuyDialog: React.FC<Props> = (props: Props) => {
  const { children, className, collectionAddress, token, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");

  const open = useSelector<RootState, boolean>(
    (state) => state.layout.showBuyNftDialog
  );

  const onConfirm = () => {
    runConfirmPurchase(async () => {});
  };

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("close"));
  };

  return (
    <DialogModal
      header="Confirm Purchase"
      {...rest}
      open={open}
      onClose={onCloseDialog}
      className={cls(classes.root, className)}
    >
      <DialogContent className={classes.dialogContent}>
        {error && (
          <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
        )}

        {/* Nft card */}
        <NftCard token={token} collectionAddress={collectionAddress} />

        {/* Terms */}

        <FancyButton
          className={classes.actionButton}
          loading={loading}
          variant="contained"
          color="primary"
          onClick={onConfirm}
        >
          Confirm Purchase
        </FancyButton>
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(3),
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "24px",
        linHeight: "36px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
    },
  },
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRight:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderBottom:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 3, 2),
    minWidth: 320,
  },
  actionButton: {
    height: 46,
  },
}));

export default BuyDialog;
