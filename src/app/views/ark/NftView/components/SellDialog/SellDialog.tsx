import React, { useState, useEffect, useMemo } from "react";
import { Box, Container, FormHelperText, InputLabel, Typography, DialogContent, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import { BN_ZERO } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { ArkExpiry, ArkNFTCard, CurrencyInput, DialogModal, FancyButton, Text } from "app/components";
import ArkPage from "app/layouts/ArkPage";
import { getBlockchain, getWallet, getTokens, getMarketplace } from "app/saga/selectors";
import { Nft, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, bnOrZero, useToaster, useValueCalculators, toHumanNumber } from "app/utils";
import { ArkClient, logger, waitForTx } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ReactComponent as Checkmark } from "./checkmark.svg";

interface SellForm {
  description: string,
  saleType: "fixed_price" | "timed_auction",
  sellToken: TokenInfo,
  buyNowPrice: string,
  startingPrice: string,
  reservePrice: string,
};

const SellDialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const tokenState = useSelector(getTokens);
  const { exchangeInfo } = useSelector(getMarketplace);
  const valueCalculators = useValueCalculators();
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [open, setOpen] = useState(false)
  const [expiry, setExpiry] = useState(0)
  const [runConfirmSell, loading, error] = useAsyncTask("confirmSell", () => setOpen(false));
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [token, setToken] = useState<Nft>();
  const [waitingForApprove, setWaitingForApprove] = useState(false);
  const toaster = useToaster();
  // const [errors, setErrors] = useState({
  //   description: "",
  // })
  const [inputValues, setInputValues] = useState<SellForm>({
    description: "",
    saleType: "fixed_price",
    sellToken: tokenState.tokens[ZIL_ADDRESS],
    buyNowPrice: "0",
    startingPrice: "0",
    reservePrice: "0",
  });
  const [hasApproved, setHasApproved] = useState(false)
  const [hasPosted, setHasPosted] = useState(false)
  const history = useHistory()

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  const isOwnToken = useMemo(() => {
    return token?.owner?.address && wallet?.addressInfo.byte20?.toLowerCase() === token?.owner?.address;
  }, [token, wallet?.addressInfo]);

  useEffect(() => {
    if (wallet) {
      getNFTDetails();
    }
    // eslint-disable-next-line
  }, [wallet])

  const getNFTDetails = (bypass?: boolean) => {
    runGetNFTDetails(async () => {
      const arkClient = new ArkClient(network);
      const address = fromBech32Address(collectionId).toLowerCase()
      const viewerAddress = wallet?.addressInfo.byte20.toLocaleLowerCase()
      const { result } = await arkClient.getNftToken(address, tokenId, viewerAddress);
      setToken(result.model);
    })
  }

  // const updateInputs = (type: string) => {
  //   return (newInput: string) => {
  //     setInputValues({
  //       ...inputValues,
  //       [type]: newInput
  //     })
  //     if (!newInput) {
  //       return setErrors({
  //         ...errors, [type]: ""
  //       })
  //     }
  //     const errorText = validateInput(type, newInput)

  //     setErrors({
  //       ...errors, [type]: errorText
  //     })
  //   }
  // }

  // const validateInput = (type: string, input: string) => {
  //   switch (type) {
  //     case "description":
  //       if (input.length > 300) return "max 300 characters";
  //       return ""
  //     default: return "false";
  //   }
  // }

  const onCurrencyChange = (token: TokenInfo) => {
    setInputValues({
      ...inputValues,
      sellToken: token
    })
  };

  const onPriceChange = (type: string, rawAmount: string = "0") => {
    setInputValues({
      ...inputValues,
      [type]: rawAmount
    })
  };

  const onEndEditPrice = (type: keyof Pick<SellForm, "buyNowPrice" | "reservePrice" | "startingPrice">) => {
    let bidAmount = new BigNumber(inputValues[type]).decimalPlaces(
      inputValues.sellToken?.decimals ?? 0
    );
    if (bidAmount.isNaN() || bidAmount.isNegative() || !bidAmount.isFinite())
      setInputValues({
        ...inputValues,
        [type]: "0"
      })
  };

  const onExpiryChange = (expiryBlock: number) => {
    setExpiry(expiryBlock)
  }

  const onCloseDialog = () => {
    if (loading) return;
    setOpen(false);
  };

  const onConfirm = () => {
    if (!wallet?.provider || !match.params?.collection || !match.params?.id || !inputValues.sellToken || inputValues.buyNowPrice === "0" || !exchangeInfo) return;
    runConfirmSell(async () => {
      const { collection: address, id } = match.params;

      const priceAmount = new BigNumber(inputValues.buyNowPrice).shiftedBy(inputValues.sellToken.decimals);
      const price = { amount: priceAmount, address: fromBech32Address(inputValues.sellToken.address) };

      if (price.address === token?.bestAsk?.price.address && price.amount.gte(token.bestAsk.price.amount)) {
        const priceToken = tokenState.tokens[inputValues.sellToken.address];
        const decimals = priceToken?.decimals ?? 0;
        const existingPriceHuman = bnOrZero(token.bestAsk.price.amount).decimalPlaces(0).shiftedBy(-decimals);
        throw new Error(`Selling price should be lower than existing price of ${existingPriceHuman.toFormat()} ${priceToken?.symbol}`)
      }

      if (typeof token?.collection?.royaltyBps !== "number")
        throw new Error("Could not retrieve collection information");

      const totalFeeBps = bnOrZero(exchangeInfo.baseFeeBps).plus(token.collection.royaltyBps);
      const feeAmount = priceAmount.times(totalFeeBps).dividedToIntegerBy(10000).plus(1);

      setOpen(true)
      const arkClient = new ArkClient(network);

      const walletAddress = wallet.addressInfo.byte20.toLowerCase();
      const hexTokenAddress = fromBech32Address(address).toLowerCase();
      const transaction = await arkClient.approveAllowanceIfRequired(hexTokenAddress, walletAddress, ZilswapConnector.getSDK());

      if (transaction?.id) {
        toaster("Approve TX Submitted", { hash: transaction.id });
        setWaitingForApprove(true);

        try {
          await waitForTx(transaction.id);
          setHasApproved(true);
        } finally {
          setWaitingForApprove(false);
        }
      }

      const nonce = new BigNumber(Math.random()).times(2147483647).decimalPlaces(0).toString(10); // int32 max 2147483647
      const message = arkClient.arkMessage("Execute", arkClient.arkChequeHash({
        side: "Sell",
        token: { address, id, },
        price,
        feeAmount,
        expiry,
        nonce,
      }))

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any

      const result = await arkClient.postTrade({
        publicKey,
        signature,

        collectionAddress: address,
        address: wallet.addressInfo.byte20.toLowerCase(),
        tokenId: id,
        side: "Sell",
        expiry,
        nonce,
        price,
      });

      logger("post trade", result);
      setHasPosted(true);
      toaster(`Successfully listed token #${id}!`);
      history.push(`/ark/collections/${collectionId}/${tokenId}`)
    });
  };

  const sellUsdValue = useMemo(() => {
    if (!inputValues.sellToken) return BN_ZERO;
    const input = bnOrZero(inputValues.buyNowPrice).shiftedBy(inputValues.sellToken.decimals);

    return valueCalculators.usd(tokenState, inputValues.sellToken.address, input.toString(10));
  }, [inputValues, valueCalculators, tokenState])

  if (!isOwnToken) {
    return <></>
  }

  return (
    <ArkPage {...rest}>
      <Container className={cls(classes.root, className)}>
        <Box className={classes.container}>
          <Box justifyContent="flex-start" marginBottom={4}>
            <Typography variant="h1">Sell</Typography>
          </Box>
          <Box className={classes.contentBox}>
            <Box>
              {/* <Box className={classes.description}>
                <ArkInput
                  placeholder="eg. This NFT was owned by an NBA player" error={errors.description} value={inputValues.description}
                  label="Additional description" onValueChange={(value) => updateInputs("description")(value)} multiline={true}
                />
              </Box> */}

              {/* <Box display="flex" flexDirection="column" marginTop={2}>
                <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                  Sell type
                </InputLabel>
                <FormHelperText className={classes.instruction}>By default, all Fixed Price listings are set to open to bids.</FormHelperText>
                <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gridGap={8} marginTop={1}>
                  <button
                    className={cls(classes.saleTypeButton, {
                      [classes.saleTypeButtonSelected]: inputValues.saleType === "fixed_price"
                    })}
                    onClick={() => setInputValues({
                      ...inputValues,
                      saleType: "fixed_price"
                    })}
                  >Fixed Price</button>
                  <button
                    className={cls(classes.saleTypeButton, {
                      [classes.saleTypeButtonSelected]: inputValues.saleType === "timed_auction"
                    })}
                    onClick={() => setInputValues({
                      ...inputValues,
                      saleType: "timed_auction"
                    })}
                  >Timed Auction</button>
                </Box>
              </Box> */}

              {inputValues.saleType === "fixed_price" &&
                <Box display="flex" flexDirection="column" marginTop={2}>
                  <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                    Buy Now Price
                  </InputLabel>
                  <FormHelperText className={classes.instruction}>Transactions will be made automatically once the buyer hits "Confirm".</FormHelperText>
                  <Box marginTop={1}>
                    <CurrencyInput
                      token={inputValues.sellToken ?? null}
                      amount={inputValues.buyNowPrice}
                      tokenList="ark-zil"
                      hideBalance
                      onEditorBlur={() => onEndEditPrice('buyNowPrice')}
                      onAmountChange={value => onPriceChange('buyNowPrice', value)}
                      onCurrencyChange={onCurrencyChange}
                    />
                  </Box>
                  <Text variant="body2" align="left" marginTop={1} marginLeft={2}>
                    ≈ ${toHumanNumber(sellUsdValue, 2)}
                  </Text>
                </Box>
              }

              {inputValues.saleType === "timed_auction" &&
                <>
                  <Box display="flex" flexDirection="column" marginTop={4}>
                    <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                      Starting Price
                    </InputLabel>
                    <FormHelperText className={classes.instruction}>Set a minimum bid XXXXXXXXX</FormHelperText>
                    <Box marginTop={1}>
                      <CurrencyInput
                        token={inputValues.sellToken ?? null}
                        amount={inputValues.buyNowPrice}
                        onEditorBlur={() => onEndEditPrice('startingPrice')}
                        onAmountChange={value => onPriceChange('startingPrice', value)}
                        onCurrencyChange={onCurrencyChange}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" marginTop={4}>
                    <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                      Reserve Price
                    </InputLabel>
                    <FormHelperText className={classes.instruction}>If no bid hits the reserve price, your auction will close without a sale.</FormHelperText>
                    <Box marginTop={1}>
                      <CurrencyInput
                        label="Reserve Price"
                        token={inputValues.sellToken ?? null}
                        amount={inputValues.buyNowPrice}
                        onEditorBlur={() => onEndEditPrice('reservePrice')}
                        onAmountChange={value => onPriceChange('reservePrice', value)}
                        onCurrencyChange={onCurrencyChange}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" marginTop={4}>
                    <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                      End Auction On
                    </InputLabel>
                    <FormHelperText className={classes.instruction}>Choose when to end your timed auction.</FormHelperText>
                  </Box>
                </>
              }

              <ArkExpiry label="Offer Expiry" onExpiryChange={onExpiryChange} />

              <Box display="flex" flexDirection="column" marginTop={4}>
                <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                  Fees
                </InputLabel>
                <FormHelperText className={classes.instruction}>The following fees will be deducted once this NFT is sold.</FormHelperText>
                {exchangeInfo?.baseFeeBps && (
                  <Box display="flex" marginTop={1}>
                    <Typography className={classes.feeLabel}>Service Fee</Typography>
                    <Typography className={classes.feeValue}>{exchangeInfo.baseFeeBps / 100}%</Typography>
                  </Box>
                )}
                {token?.collection && token.collection.royaltyBps !== null &&
                  <Box display="flex" marginTop={1}>
                    <Typography className={classes.feeLabel}>Royalties</Typography>
                    <Typography className={classes.feeValue}>{new BigNumber(token.collection.royaltyBps).shiftedBy(-2).toString()}%</Typography>
                  </Box>
                }
              </Box>

              {error && (
                <Text marginTop={2} className={classes.breakWord} color="error" >Error: {error?.message ?? "Unknown error"}</Text>
              )}
              <FancyButton
                className={classes.actionButton}
                loading={loading}
                disabled={!new BigNumber(inputValues.buyNowPrice).gt(0)}
                variant="contained"
                color="primary"
                onClick={onConfirm}
                walletRequired
              >
                Sell NFT
              </FancyButton>
            </Box>
            <Box className={classes.nftBox}>
              {token &&
                <ArkNFTCard
                  className={classes.nftCard}
                  token={token}
                  collectionAddress={fromBech32Address(collectionId).toLowerCase()}
                  dialog={true}
                />
              }
            </Box>
          </Box>
        </Box>

        <DialogModal
          className={classes.dialogRoot}
          header="Complete Listing"
          open={open}
          onClose={onCloseDialog}
        >
          <DialogContent className={classes.dialogContent}>
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" marginBottom={4} position="relative">
                <Box className={cls(classes.stepBar, {
                  [classes.stepBarFirstStepCompleted]: hasApproved,
                  [classes.stepBarCompleted]: hasApproved && hasPosted
                })}></Box>
                <Box className={cls(classes.step, {
                  [classes.stepActive]: !hasApproved,
                  [classes.stepCompleted]: hasApproved
                })}>
                  {hasApproved ? (
                    <Checkmark />
                  ) : (
                    <>1</>
                  )}
                  {waitingForApprove && (
                    <CircularProgress className={classes.progress} color="inherit" />
                  )}
                </Box>
                <Box display="flex" flexDirection="column" alignItems="stretch">
                  <Text className={classes.stepLabel}>Approve Token</Text>
                  <Text>Approve once, and never again. This step approves the token for trading and involves a one-off gas fee.</Text>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <Box className={cls(classes.step, {
                  [classes.stepActive]: !hasPosted && hasApproved,
                  [classes.stepCompleted]: hasPosted
                })}>
                  {hasPosted ? (
                    <Checkmark />
                  ) : (
                    <>2</>
                  )}
                </Box>
                <Box display="flex" flexDirection="column" alignItems="stretch">
                  <Text className={classes.stepLabel}>Confirm Listing</Text>
                  <Text>Approve once, and never again. This step approves the token for trading and involves a one-off gas fee.</Text>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </DialogModal>
      </Container>
    </ArkPage>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0
    },
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "680px",
    width: "100%",
    display: "row",
  },
  contentBox: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      flexDirection: "column-reverse"
    }
  },
  nftBox: {
    marginLeft: theme.spacing(6),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
    }
  },
  nftCard: {
    maxWidth: "none",
  },
  description: {
    "& .MuiTypography-root": {
      marginBottom: 6,
      textTransform: "uppercase"
    },
    "& .MuiInputBase-input": {
      height: "80px !important"
    }
  },
  label: {
    fontSize: "18px",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: "bold",
    width: 150,
    overflowX: "visible",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  instruction: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontSize: 12,
    margin: 0,
    opacity: 0.5,
    [theme.breakpoints.up("sm")]: {
      width: 400,
    }
  },
  saleTypeButton: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    flexGrow: 1,
    outline: "none",
    border: "none",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
    fontWeight: "bold",
    cursor: "pointer"
  },
  saleTypeButtonSelected: {
    backgroundColor: "#00FFB0",
    color: "#003340",
  },
  actionButton: {
    height: 58,
    marginTop: 24
  },
  feeLabel: {
    fontWeight: "bold",
    flexGrow: 1,
    fontSize: "14px"
  },
  feeValue: {
    fontWeight: "bold",
    fontSize: "14px"
  },
  dialogRoot: {
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
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft:
      theme.palette.border,
    borderRight:
      theme.palette.border,
    borderBottom:
      theme.palette.border,
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 4.5, 5),
    [theme.breakpoints.up("sm")]: {
      width: 436,
    }
  },
  dialogButton: {
    height: 42,
    marginTop: 6
  },
  progress: {
    position: "absolute",
  },
  step: {
    width: 110,
    height: 52,
    borderRadius: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#223139",
    marginRight: 24,
    position: "relative"
  },
  stepLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2
  },
  stepActive: {
    backgroundColor: "#6BE1FF",
    color: "#003340"
  },
  stepCompleted: {
    backgroundColor: "#00FFB0",
    color: "#003340"
  },
  stepBar: {
    position: "absolute",
    top: 50,
    left: 23,
    height: 44,
    width: 6,
    backgroundColor: "#223139",
    backgroundImage: "linear-gradient(#6BE1FF, #223139)",
    zIndex: 0
  },
  stepBarFirstStepCompleted: {
    backgroundImage: "linear-gradient(#00FFB0, #6BE1FF)",
  },
  stepBarCompleted: {
    backgroundImage: "linear-gradient(#00FFB0, #00FFB0)",
  },
  breakWord: {
    wordBreak: "break-word"
  },
}));

export default SellDialog;
