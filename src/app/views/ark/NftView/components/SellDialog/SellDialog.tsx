import React, { useState, useEffect, useMemo } from "react";
import { Box, FormHelperText, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { ZIL_HASH } from "zilswap-sdk/lib/constants";
import { ArkInput, ArkNFTCard, CurrencyInput, FancyButton, Text } from "app/components";
import { getBlockchain, getWallet, getTokens } from "app/saga/selectors";
import { Nft, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient, logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { ZIL_ADDRESS } from "app/utils/constants";


const SellDialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const tokenState = useSelector(getTokens);
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [runConfirmSell, loading, error] = useAsyncTask("confirmSell");
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [token, setToken] = useState<Nft>();
  const [errors, setErrors] = useState({
    description: "",
  })
  const [inputValues, setInputValues] = useState<any>({
    description: "",
    saleType: "fixed_price",
    sellToken: tokenState.tokens[ZIL_ADDRESS],
    buyNowPrice: "0",
    startingPrice: "0",
    reservePrice: "0",
  });

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

  const updateInputs = (type: string) => {
    return (newInput: string) => {
      setInputValues({
        ...inputValues,
        [type]: newInput
      })
      if (!newInput) {
        return setErrors({
          ...errors, [type]: ""
        })
      }
      const errorText = validateInput(type, newInput)

      setErrors({
        ...errors, [type]: errorText
      })
    }
  }

  const validateInput = (type: string, input: string) => {
    switch (type) {
      case "description":
        if (input.length > 300) return "max 300 characters";
        return ""
      default: return "false";
    }
  }

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

  const onEndEditPrice = (type: string) => {
    let bidAmount = new BigNumber(inputValues[type]).decimalPlaces(
      inputValues.sellToken?.decimals ?? 0
    );
    if (bidAmount.isNaN() || bidAmount.isNegative() || !bidAmount.isFinite())
      setInputValues({
        ...inputValues,
        [type]: "0"
      })
  };

  const onConfirm = () => {
    if (!wallet?.provider || !match.params?.collection || !match.params?.id) return;
    runConfirmSell(async () => {
      const { collection: address, id } = match.params

      const priceAmount = new BigNumber(inputValues.buyNowPrice).shiftedBy(inputValues.sellToken.decimals);
      const price = { amount: priceAmount, address: ZIL_HASH };
      const feeAmount = priceAmount.times(ArkClient.FEE_BPS).dividedToIntegerBy(10000).plus(1);

      const arkClient = new ArkClient(network);

      const walletAddress = wallet.addressInfo.byte20.toLowerCase();
      const hexTokenAddress = fromBech32Address(address).toLowerCase();
      await arkClient.approveAllowanceIfRequired(hexTokenAddress, walletAddress, ZilswapConnector.getSDK());

      const nonce = new BigNumber(Math.random()).times(2147483647).decimalPlaces(0).toString(10); // int32 max 2147483647
      const currentBlock = ZilswapConnector.getCurrentBlock();
      const expiry = currentBlock + 300; // blocks
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
    });
  };
  
  if(!isOwnToken) {
    return <></>
  }

  return (
    <Box className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <Box justifyContent="flex-start" marginBottom={4}>
          <Typography variant="h1">Sell</Typography>
        </Box>
        <Box display="flex">
          <Box flexGrow={1}>
            <Box className={classes.description}>
              <ArkInput
                placeholder="eg. This NFT was owned by an NBA player" error={errors.description} value={inputValues.description}
                label="Additional description" onValueChange={(value) => updateInputs("description")(value)} multiline={true}
              />
            </Box>

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
                    hideBalance
                    onEditorBlur={() => onEndEditPrice('buyNowPrice')}
                    onAmountChange={value => onPriceChange('buyNowPrice', value)}
                    onCurrencyChange={onCurrencyChange}
                  />
                </Box>
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
            
            <Box display="flex" flexDirection="column" marginTop={4}>
              <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
                Fees
              </InputLabel>
              <FormHelperText className={classes.instruction}>The following fees will be deducted once this NFT is sold.</FormHelperText>
              <Box display="flex" marginTop={1}>
                <Typography className={classes.feeLabel}>Service Fee</Typography>
                <Typography className={classes.feeValue}>2%</Typography>
              </Box>
              <Box display="flex" marginTop={1}>
                <Typography className={classes.feeLabel}>Royalties</Typography>
                <Typography className={classes.feeValue}>2.5%</Typography>
              </Box>
            </Box>

            {error && (
              <Text color="error">Error: {error?.message ?? "Unknown error"}</Text>
            )}
            <FancyButton 
              className={classes.actionButton}
              loading={loading} 
              variant="contained" 
              color="primary" 
              onClick={onConfirm}
              walletRequired
            >
              Sell NFT
            </FancyButton>
          </Box>
          <Box marginLeft={6}>
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
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "680px",
    width: "100%",
    display: "row",
    paddingTop: 32
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
    width: 400,
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
    height: 46,
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
  }
}));

export default SellDialog;
