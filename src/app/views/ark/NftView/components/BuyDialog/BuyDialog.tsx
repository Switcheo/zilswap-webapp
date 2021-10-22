import React, { Fragment, useMemo, useState } from "react";
import { Backdrop, Box, Checkbox, DialogContent, DialogProps, FormControlLabel, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import LaunchIcon from "@material-ui/icons/Launch";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { useHistory } from "react-router-dom";
import { CurrencyLogo, DialogModal, FancyButton, Text, ArkNFTCard } from "app/components";
import { getBlockchain, getTokens, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft } from "app/store/marketplace/types";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, hexToRGBA, truncate, useAsyncTask } from "app/utils";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { ArkClient, logger } from "core/utilities";
import { fromBech32Address, ZilswapConnector } from "core/zilswap";
import { ReactComponent as WarningIcon } from "../assets/warning.svg";
import { ReactComponent as ChainLinkIcon } from "./chainlink.svg";

interface Props extends Partial<DialogProps> {
  token: Nft;
  collectionAddress: string;
}

const BuyDialog: React.FC<Props> = (props: Props) => {
  const { children, className, collectionAddress, token, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const tokenState = useSelector(getTokens);
  const { wallet } = useSelector(getWallet);
  const open = useSelector<RootState, boolean>((state) => state.layout.showBuyNftDialog);
  const dispatch = useDispatch();
  const history = useHistory();
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [completedPurchase, setCompletedPurchase] = useState<boolean>(false);

  const bestAsk = token.bestAsk;

  const {
    priceToken,
    priceHuman,
  } = useMemo(() => {
    if (!bestAsk) return {};
    const priceToken = tokenState.tokens[toBech32Address(bestAsk.price.address)];
    const priceHuman = bnOrZero(bestAsk.price.amount).shiftedBy(-(priceToken?.decimals ?? 0));

    return {
      priceToken,
      priceHuman,
    }
  }, [bestAsk, tokenState.tokens])

  const onConfirm = () => {
    if (!wallet?.provider || !match.params?.collection || !match.params?.id || !bestAsk) return;
    runConfirmPurchase(async () => {
      const { collection: address, id } = match.params

      if (!priceToken) return; // TODO: handle token not found

      const priceAmount = new BigNumber(bestAsk.price.amount);
      const price = { amount: priceAmount, address: fromBech32Address(priceToken.address) };
      const feeAmount = priceAmount.times(ArkClient.FEE_BPS).dividedToIntegerBy(10000).plus(1);

      const arkClient = new ArkClient(network);
      const nonce = new BigNumber(Math.random()).times(2147483647).decimalPlaces(0).toString(10); // int32 max 2147483647
      const currentBlock = ZilswapConnector.getCurrentBlock();
      const expiry = currentBlock + 300; // blocks
      const message = arkClient.arkMessage("Execute", arkClient.arkChequeHash({
        side: "Buy",
        token: { address, id, },
        price,
        feeAmount,
        expiry,
        nonce,
      }))

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any

      const buyCheque: ArkClient.ExecuteBuyCheque = {
        side: "buy",
        expiry,
        nonce,
        publicKey: `0x${publicKey}`,
        signature: `0x${signature}`,
      }

      const execTradeResult = await arkClient.executeTrade({
        buyCheque,
        sellCheque: bestAsk,
        nftAddress: address,
        tokenId: id,
      }, ZilswapConnector.getSDK());

        logger("exec trade result", execTradeResult)
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
        {/* Nft card */}
        <ArkNFTCard
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
            {priceToken && (
              <Box display="flex" alignItems="center">
                <Text className={classes.price}>
                  {priceHuman?.toString(10)}
                </Text>
                <CurrencyLogo
                  currency={priceToken?.symbol}
                  address={priceToken.address}
                  className={classes.currencyLogo}
                />
              </Box>
            )}
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

            {error && (
                <Box className={classes.errorBox}>
                  <WarningIcon className={classes.warningIcon} />
                  <Text color="error">
                    Error: {error?.message ?? "Unknown error"}
                  </Text>
                </Box>
              )}
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

            {/* <Box display="flex" flexDirection="column" alignItems="center">
              <Text className={classes.shareText}>Share</Text>
              <SocialLinkGroup collection={token.collection} />
            </Box> */}
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
      theme.palette.border,
    borderRight:
      theme.palette.border,
    borderBottom:
      theme.palette.border,
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 3, 2),
    minWidth: 380,
    maxWidth: 411,
    overflowY: "auto",
    "&::-webkit-scrollbar-track": {
      marginBottom: theme.spacing(1),
    },
    "&::-webkit-scrollbar": {
      width: "0.5rem"
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
      borderRight: "3px solid transparent",
      backgroundClip: "padding-box"
    },
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
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
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
  errorBox: {
    marginTop: theme.spacing(2),
    minHeight: 46,
    width: "100%",
    border: "1px solid #FF5252",
    backgroundColor: `rgba${hexToRGBA("#FF5252", 0.2)}`,
    borderRadius: 12,
    padding: theme.spacing(2, 3),
    display: "flex",
    alignItems: "center",
  },
  warningIcon: {
    height: 24,
    width: 24,
    flex: "none",
    marginRight: theme.spacing(1)
  }
}));

export default BuyDialog;
