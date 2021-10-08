import { DialogContent, DialogProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal, FancyButton, Text } from "app/components";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";

interface Props extends Partial<DialogProps> {
}

const BuyDialog: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");

  const open = useSelector<RootState, boolean>(state => state.layout.showBuyNftDialog);

  const onConfirm = () => {
    runConfirmPurchase(async () => {
      
    });
  };

  return (
    <DialogModal header="Confirm Purchase" {...rest} open={open} className={cls(classes.root, className)}>
      <DialogContent>
        {error && (
          <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
        )}
        <FancyButton loading={loading} variant="contained" onClick={onConfirm}>
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
