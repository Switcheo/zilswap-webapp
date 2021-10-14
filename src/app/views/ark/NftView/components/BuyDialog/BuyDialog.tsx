import React, { Fragment, useState } from "react";
import {
  Backdrop,
  Box,
  Checkbox,
  DialogContent,
  DialogProps,
  FormControlLabel,
  Link,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import LaunchIcon from "@material-ui/icons/Launch";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CurrencyLogo, DialogModal, FancyButton, Text } from "app/components";
import { actions } from "app/store";
import { Nft } from "app/store/marketplace/types";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate, useAsyncTask } from "app/utils";
import { ZIL_ADDRESS } from "app/utils/constants";
import { NftCard } from "app/views/ark/Collection/components";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { fromBech32Address } from "core/zilswap";
import { SocialLinkGroup } from "app/components/ArkComponents";
import { ReactComponent as ChainLinkIcon } from "./chainlink.svg";

interface Props extends Partial<DialogProps> {
  token: Nft;
  collectionAddress: string;
}

const BuyDialog: React.FC<Props> = (props: Props) => {
  const { children, className, collectionAddress, token, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [completedPurchase, setCompletedPurchase] = useState<boolean>(false);

  const open = useSelector<RootState, boolean>(
    (state) => state.layout.showBuyNftDialog
  );

  const onConfirm = () => {
    runConfirmPurchase(async () => {
      await new Promise((res) => setTimeout(res, 3000));

      setCompletedPurchase(true);
    });
  };

  const onCloseDialog = () => {
    if (loading) return;
    dispatch(actions.Layout.toggleShowBuyNftDialog("close"));
    setAcceptTerms(false);
    setCompletedPurchase(false);
  };

  const onViewCollection = () => {
    dispatch(actions.Layout.toggleShowBuyNftDialog("close"));
    history.push("/ark/profile");
  };

  const dialogHeader = loading
    ? ""
    : completedPurchase
    ? "You now own"
    : "Confirm Purchase";

  return (
    <DialogModal
      header={dialogHeader}
      {...rest}
      open={open}
      onClose={onCloseDialog}
      className={cls(classes.root, className)}
      hideCloseButton={loading}
      titlePadding={!!loading}
    >
      <DialogContent className={cls(classes.dialogContent)}>
        {error && (
          <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
        )}

        {/* Nft card */}
        <NftCard
          className={classes.nftCard}
          token={token}
          collectionAddress={fromBech32Address(collectionAddress)}
          dialog={true}
        />

        {/* Price Box */}
        <Box className={classes.priceBox}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text className={classes.priceText}>
              {completedPurchase ? "Bid Price" : "Fixed Price"}
            </Text>
            <Box display="flex" alignItems="center">
              <Text className={classes.price}>100</Text>
              <CurrencyLogo
                currency={"ZIL"}
                address={ZIL_ADDRESS}
                className={classes.currencyLogo}
              />
            </Box>
          </Box>

          {completedPurchase && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={0.5}
            >
              <Text className={classes.txText}>Transaction Hash</Text>
              <Text>
                <Link
                  className={classes.link}
                  underline="hover"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={"hello"}
                >
                  {truncate("0x27f12shdj", 5, 5)}
                  <LaunchIcon className={cls(classes.icon, classes.linkIcon)} />
                </Link>
              </Text>
            </Box>
          )}
        </Box>

        {!(loading || completedPurchase) && (
          <Fragment>
            {/* Terms */}
            <Box className={classes.termsBox}>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radioButton}
                    checkedIcon={<CheckedIcon />}
                    icon={<UncheckedIcon fontSize="small" />}
                    checked={acceptTerms}
                    onChange={() => setAcceptTerms(!acceptTerms)}
                    disableRipple
                  />
                }
                label={
                  <Text>
                    By checking this box, I accept ARK's terms and conditions.
                  </Text>
                }
              />
            </Box>

            <FancyButton
              className={classes.actionButton}
              loading={loading}
              variant="contained"
              color="primary"
              onClick={onConfirm}
              disabled={!acceptTerms}
              walletRequired
            >
              Confirm Purchase
            </FancyButton>
          </Fragment>
        )}

        {completedPurchase && (
          <Box className={classes.completedBox}>
            <FancyButton
              className={classes.actionButton}
              variant="contained"
              color="primary"
              onClick={onViewCollection}
              walletRequired
              fullWidth
            >
              View Collection
            </FancyButton>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Text className={classes.shareText}>Share</Text>
              <SocialLinkGroup />
            </Box>
          </Box>
        )}

        {/* to clean up */}
        <Backdrop open={loading} className={classes.backdrop}>
          <Box flex={1}>
            <Text variant="h2" align="center" className={classes.loadingTitle}>
              Purchase Processing
            </Text>

            <Text align="center" className={classes.loadingBody}>
              Sit tight, it should be confirmed shortly.
            </Text>
          </Box>

          <ChainLinkIcon />

          <Box flex={1} />
        </Backdrop>
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
    position: "relative",
  },
  backdrop: {
    position: "absolute",
    zIndex: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: theme.spacing(3),
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
    minWidth: 380,
    maxWidth: 411,
    overflowY: "auto",
  },
  actionButton: {
    height: 46,
  },
  nftCard: {
    maxWidth: "none",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  termsBox: {
    marginBottom: theme.spacing(1),
    "& .MuiFormControlLabel-root": {
      marginLeft: "-8px",
      marginRight: 0,
    },
  },
  priceBox: {
    borderRadius: 12,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.currencyInput,
    marginBottom: theme.spacing(1),
  },
  priceText: {
    fontSize: "20px",
    lineHeight: "30px",
  },
  price: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "28px",
    paddingBottom: "4px",
    color: theme.palette.primary.dark,
  },
  currencyLogo: {
    paddingBottom: "4px",
  },
  txText: {
    color: theme.palette.label,
  },
  icon: {
    fontSize: "14px",
    color: theme.palette.label,
  },
  link: {
    color: theme.palette.text?.primary,
  },
  linkIcon: {
    marginLeft: 2,
    verticalAlign: "top",
  },
  loadingTitle: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "24px",
    linHeight: "40px",
  },
  loadingBody: {
    fontSize: "14px",
    lineHeight: "24px",
    marginTop: theme.spacing(0.5),
  },
  completedBox: {
    marginTop: theme.spacing(1.5),
  },
  shareText: {
    color: theme.palette.label,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
}));

export default BuyDialog;
