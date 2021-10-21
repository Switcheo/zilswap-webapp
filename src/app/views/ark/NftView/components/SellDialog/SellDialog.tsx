import React, { useState, useEffect } from "react";
import { Box, DialogContent, DialogProps, FormHelperText, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { ZIL_HASH } from "zilswap-sdk/lib/constants";
import { ArkInput, ArkNFTCard, DialogModal, FancyButton, Text } from "app/components";
import { getBlockchain, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import { ArkClient, logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";

interface Props extends Partial<DialogProps> {
}

const SellDialog: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const match = useRouteMatch<{ id: string, collection: string }>();
  const [runConfirmSell, loading, error] = useAsyncTask("confirmSell");
  const [runGetNFTDetails] = useAsyncTask("runGetNFTDetails");
  const [token, setToken] = useState<Nft>();
  const [errors, setErrors] = useState({
    description: "",
  })
  const [inputValues, setInputValues] = useState<any>({
    description: "",
  });

  const collectionId = match.params.collection;
  const tokenId = match.params.id;

  const open = useSelector<RootState, boolean>(state => state.layout.showSellNftDialog);

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

  const onClose = () => {
    dispatch(actions.Layout.toggleShowSellNftDialog("close"));
  };

  const onConfirm = () => {
    if (!wallet?.provider || !match.params?.collection || !match.params?.id) return;
    runConfirmSell(async () => {
      const { collection: address, id } = match.params

      const priceAmount = new BigNumber(10).shiftedBy(12);
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

  return (
    <Box className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <Box justifyContent="flex-start">
          <Typography variant="h1">Sell</Typography>
        </Box>
        <Box display="flex">
          <Box flexGrow={1}>
            <ArkInput
              placeholder="eg. This NFT was owned by an NBA player" error={errors.description} value={inputValues.description}
              label="Additional description" onValueChange={(value) => updateInputs("description")(value)} multiline={true}
            />

            <InputLabel shrink focused={false} className={cls({ [classes.label]: true })}>
              Sell type
            </InputLabel>
            <FormHelperText className={classes.instruction}>By default, all Fixed Price listings are set to open to bids.</FormHelperText>

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
          <Box marginLeft={3}>
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
  label: {
    fontSize: "16px",
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
  actionButton: {
    height: 46,
    marginTop: 24
  },
}));

export default SellDialog;
