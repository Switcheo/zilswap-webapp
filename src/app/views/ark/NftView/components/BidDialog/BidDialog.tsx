import React, { Fragment, useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { useHistory } from "react-router-dom";
import { bnOrZero } from "tradehub-api-js/build/main/lib/tradehub/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { Box, Checkbox, DialogContent, DialogProps, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { ZilswapConnector } from "core/zilswap";
import { ArkExpiry, ArkNFTCard, CurrencyInput, CurrencyLogo, DialogModal, FancyButton, Text } from "app/components";
import { getBlockchain, getMarketplace, getTokens, getTransactions, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft } from "app/store/marketplace/types";
import { RootState, TokenInfo, WalletObservedTx } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, toHumanNumber, useAsyncTask, useToaster, getLocalStored } from "app/utils";
import { LocalStorageKeys } from "app/utils/constants";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { ArkClient, logger } from "core/utilities";
import { fromBech32Address, toBech32Address } from "core/zilswap";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ReactComponent as WarningIcon } from "../assets/warning.svg";

interface Props extends Partial<DialogProps> {
  token: Nft;
  collectionAddress: string;
  onComplete?: () => void;
}

const bidStorageKey = LocalStorageKeys.ArkBidAcceptTerms

const initialFormState = {
  bidAmount: "0",
  acceptTerms: !!getLocalStored(bidStorageKey),
};

const BidDialog: React.FC<Props> = (props: Props) => {
  const { children, className, collectionAddress, token, onComplete, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const tokenState = useSelector(getTokens);
  const { observingTxs } = useSelector(getTransactions);
  const { exchangeInfo } = useSelector(getMarketplace);
  const open = useSelector<RootState, boolean>(
    (state) => state.layout.showBidNftDialog
  );
  const [runConfirmPurchase, loading, error, setPurchaseError] = useAsyncTask("confirmPurchase");
  const [runWrapTx, loadingWrapTx, wrapError, setWrapError] = useAsyncTask("wrapZil");
  const [completedPurchase, setCompletedPurchase] = useState<boolean>(false);
  const [expiry, setExpiry] = useState<number>(0);
  const [formState, setFormState] =
    useState<typeof initialFormState>(initialFormState);
  const [bidToken, setBidToken] = useState<TokenInfo>(
    tokenState.tokens[ZWAP_TOKEN_CONTRACT[network]]
  );
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const match = useRouteMatch<{ id: string; collection: string }>();
  const [runApproveTx, loadingApproveTx, approveError, clearApproveError] = useAsyncTask("approveTx");
  const toaster = useToaster();

  const bestBid = token.bestBid;
  const txIsPending = loadingApproveTx || observingTxs.findIndex(tx => tx.hash.toLowerCase() === pendingTxHash) >= 0;

  const wrappingRequired = bidToken && bidToken.isWzil &&
    (bnOrZero(bidToken.balance).lt(
        bnOrZero(formState.bidAmount).shiftedBy(bidToken.decimals)
    ))

  const isBidEnabled = useMemo(() => {
    if (!formState.acceptTerms) return false;

    if (bnOrZero(formState.bidAmount).isLessThanOrEqualTo(0)) return false;

    if (!bidToken) return false;

    return true;

    // eslint-disable-next-line
  }, [formState, bidToken]);

  const showTxApprove = useMemo(() => {
    if (!bidToken || bidToken.isZil) return false;
    setBidToken(tokenState.tokens[bidToken.address]);
    const arkClient = new ArkClient(network);
    const tokenProxyAddr = arkClient.tokenProxyAddress;

    const priceAmount = bnOrZero(formState.bidAmount);
    const unitlessInAmount = priceAmount.shiftedBy(bidToken.decimals);
    const approved = bnOrZero(bidToken.allowances![tokenProxyAddr] || '0')
    const showTxApprove = approved.isZero() || approved.comparedTo(unitlessInAmount) < 0;

    return showTxApprove;
    // eslint-disable-next-line
  }, [bidToken, formState, txIsPending, network, tokenState.tokens])

  const { bestBidToken, bestBidAmount } = useMemo(() => {
    if (!bestBid) return {};
    const bestBidToken =
      tokenState.tokens[toBech32Address(bestBid.price.address)];
    const bestBidAmount = bnOrZero(bestBid.price.amount).shiftedBy(
      -(bestBidToken?.decimals ?? 0)
    );

    return {
      bestBidToken,
      bestBidAmount,
    };
  }, [bestBid, tokenState.tokens]);

  const clearErrors = () => {
    clearApproveError();
    setPurchaseError();
    setWrapError();
  }

  const onApproveTx = () => {
    if (!bidToken) return;
    if (bidToken.isZil) return;
    if (bnOrZero(formState.bidAmount).isLessThanOrEqualTo(0)) return;
    if (loading) return;

    runApproveTx(async () => {
      const arkClient = new ArkClient(network);
      const tokenProxyAddr = arkClient.tokenProxyAddress;
      const tokenAddress = bidToken.address;
      const tokenAmount = bnOrZero(formState.bidAmount);
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: tokenAmount.shiftedBy(bidToken.decimals),
        tokenID: tokenAddress,
        spenderAddress: tokenProxyAddr,
      });

      if (!observedTx)
        throw new Error("Transfer allowance already sufficient for specified amount");

      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: wallet?.addressInfo.bech32 || "",
        network,
      };

      setPendingTxHash(walletObservedTx.hash.toLowerCase());
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
      toaster("Submitted", { hash: walletObservedTx.hash });
    });
  };

  const onWrap = () => {
    const wzilBalance = bnOrZero(bidToken.balance)
    const zilBalance = bnOrZero(tokenState.tokens[ZIL_ADDRESS].balance)
    const requiredAmount = bnOrZero(formState.bidAmount).shiftedBy(bidToken.decimals)
    const wrapAmount = requiredAmount.minus(wzilBalance)
    if (zilBalance.lt(wrapAmount)) {
      setWrapError(new Error(`Insufficient ZIL balance to wrap. Require ${wrapAmount.shiftedBy(-bidToken.decimals).toFormat(2)
      } more wZIL but only have ${zilBalance.shiftedBy(-12).toFormat(2)} ZIL.`));
      return
    }

    runWrapTx(async () => {
      const arkClient = new ArkClient(network);
      const zilswap = ZilswapConnector.getSDK();
      const result = await arkClient.wrapZil(wrapAmount, zilswap);

      zilswap.observeTx({
        hash: result.id!,
        deadline: Number.MAX_SAFE_INTEGER,
      });

      toaster(`Wrap token txn submitted!`, { hash: result.id });
    });
  }

  const onExpiryChange = (expiryBlock: number) => {
    setExpiry(expiryBlock)
  }

  const onConfirm = () => {
    if (!wallet || !exchangeInfo) return;

    clearErrors();

    runConfirmPurchase(async () => {
      const { collection: address, id } = match.params;

      if (!bidToken) return; // TODO: handle token not found

      const priceAmount = bnOrZero(formState.bidAmount).shiftedBy(
        bidToken.decimals
      );

      if (!bidToken.balance || bidToken.balance?.lt(priceAmount)) {
        setPurchaseError(new Error("Insufficient balance."))
        return;
      }

      const price = {
        amount: priceAmount,
        address: fromBech32Address(bidToken.address),
      };
      const feeAmount = priceAmount
        .times(exchangeInfo.baseFeeBps)
        .dividedToIntegerBy(10000)
        .plus(1);

      const arkClient = new ArkClient(network);
      const nonce = new BigNumber(Math.random())
        .times(2147483647)
        .decimalPlaces(0)
        .toString(10); // int32 max 2147483647
      const message = arkClient.arkMessage(
        "Execute",
        arkClient.arkChequeHash({
          side: "Buy",
          token: { address, id },
          price,
          feeAmount,
          expiry,
          nonce,
        })
      );

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(
        message as any
      )) as any;

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

      if (onComplete) onComplete();
      dispatch(actions.Layout.toggleShowBidNftDialog("close"));
      logger("post trade", result);
      toaster(`Bid confirmed for token #${id}!`);
    });
  };

  const onCloseDialog = () => {
    if (loading) return;
    dispatch(actions.Layout.toggleShowBidNftDialog("close"));
    setCompletedPurchase(false);
  };

  const onViewCollection = () => {
    dispatch(actions.Layout.toggleShowBidNftDialog("close"));
    history.push("/ark/profile");
  };

  const onCurrencyChange = (token: TokenInfo) => {
    clearErrors();
    setBidToken(token);
  };

  const onBidAmountChange = (rawAmount: string = "0") => {
    clearErrors();
    setFormState({
      ...formState,
      bidAmount: rawAmount,
    });
  };

  const onEndEditBidAmount = () => {
    let bidAmount = new BigNumber(formState.bidAmount).decimalPlaces(
      bidToken?.decimals ?? 0
    );
    if (bidAmount.isNaN() || bidAmount.isNegative() || !bidAmount.isFinite())
      setFormState({
        ...formState,
        bidAmount: "0",
      });
  };


  const onToggleAcceptTerms = () => {
    if (formState.acceptTerms) localStorage.removeItem(bidStorageKey);
    else localStorage.setItem(bidStorageKey, JSON.stringify("true"));
    setFormState({
      ...formState,
      acceptTerms: !formState.acceptTerms,
    })
  }

  return (
    <DialogModal
      header="Place a Bid"
      {...rest}
      open={open}
      onClose={onCloseDialog}
      className={cls(classes.root, className)}
    >
      <DialogContent className={cls(classes.dialogContent)}>
        {/* Nft card */}
        <ArkNFTCard
          className={classes.nftCard}
          token={token}
          collectionAddress={fromBech32Address(collectionAddress)}
          dialog={true}
        />

        <Box className={classes.bidContainer}>
          <CurrencyInput
            label="Bid Amount"
            tokenList="ark-zil"
            inputClassName={cls({ [classes.expandedCurrencyInput]: !!bestBid })}
            token={bidToken ?? null}
            amount={formState.bidAmount}
            dialogOpts={{ zrc2Only: true }}
            onEditorBlur={onEndEditBidAmount}
            onAmountChange={onBidAmountChange}
            onCurrencyChange={onCurrencyChange}
          >
            {bestBid && (
              <Box display="flex" alignItems="center" className={classes.bestBid}>
                <Text className={classes.bestBidLabel}>
                  Highest Bid:
                </Text>
                {toHumanNumber(bestBidAmount)}
                <CurrencyLogo
                  currency={bestBidToken?.symbol}
                  address={bestBidToken?.address}
                  className={classes.bestBidTokenLogo}
                />
              </Box>
            )}
          </CurrencyInput>

          {/* Set expiry */}
          <ArkExpiry label="Bid Expiry" onExpiryChange={onExpiryChange} />

          {!completedPurchase && (
            <Fragment>
              {/* Terms */}
              <Box className={classes.termsBox}>
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radioButton}
                      checkedIcon={<CheckedIcon />}
                      icon={<UncheckedIcon fontSize="small" />}
                      checked={formState.acceptTerms}
                      onChange={() => onToggleAcceptTerms()}
                      disableRipple
                    />
                  }
                  label={
                    <Text>
                      I accept ARK's terms and conditions.
                    </Text>
                  }
                />
              </Box>

              {
                wrappingRequired ?
                  <FancyButton
                    className={classes.actionButton}
                    loading={loadingWrapTx}
                    variant="contained"
                    color="primary"
                    onClick={onWrap}
                    disabled={!isBidEnabled}
                    walletRequired
                  >
                    Wrap ZIL
                  </FancyButton>
                  :
                  <FancyButton
                    showTxApprove={showTxApprove}
                    loadingTxApprove={txIsPending}
                    onClickTxApprove={onApproveTx}
                    className={classes.actionButton}
                    loading={loading}
                    variant="contained"
                    color="primary"
                    onClick={onConfirm}
                    disabled={!isBidEnabled}
                    walletRequired
                  >
                    Place Bid
                  </FancyButton>
              }

              {(error || wrapError || approveError) && (
                <Box className={classes.errorBox}>
                  <WarningIcon className={classes.warningIcon} />
                  <Text color="error">
                    Error: {(error?.message || wrapError?.message || approveError?.message) ?? "Unknown error"}
                  </Text>
                </Box>
              )}

            </Fragment>
          )}
        </Box>

        {completedPurchase && (
          <FancyButton
            className={classes.collectionButton}
            variant="contained"
            color="primary"
            onClick={onViewCollection}
            walletRequired
          >
            View Collection
          </FancyButton>
        )}
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
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
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
    display: "flex",
    [theme.breakpoints.down('sm')]: {
      flexDirection: "column",
      minWidth: 380,
      maxWidth: 411,
    },
  },
  bidContainer: {
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(2),
      maxWidth: 420
    }
  },
  expandedCurrencyInput: {
    paddingBottom: theme.spacing(2),
  },
  bestBid: {
    zIndex: 1,
    fontFamily: "Avenir Next",
    fontSize: 12,
    color: theme.palette.text!.primary,
    marginLeft: 18,
    marginTop: theme.spacing(-3.7),
    marginBottom: theme.spacing(1),
  },
  bestBidLabel: {
    color: theme.palette.text!.primary,
    opacity: 0.6,
    marginRight: 4,
  },
  bestBidTokenLogo: {
    height: "18px !important",
    width: "18px !important",
  },
  actionButton: {
    height: 46,
  },
  collectionButton: {
    height: 46,
    marginTop: theme.spacing(1),
  },
  nftCard: {
    maxWidth: "none",
    [theme.breakpoints.up('md')]: {
      maxWidth: 360
    }
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  termsBox: {
    display: "flex",
    justifyContent: "flex-start",
    marginLeft: 2,
    marginTop: theme.spacing(1.5),
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

export default BidDialog;
