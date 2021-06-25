import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import { units } from "@zilliqa-js/zilliqa";
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { actions } from "app/store";
import { BridgeFormState } from "app/store/bridge/types";
import { RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useToaster } from "app/utils";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SWTHAddress, Token, TradeHubSDK } from "tradehub-api-js";
import { ethers } from "ethers";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiAccordionSummary-root": {
      display: "inline-flex"
    },
  },
  container: {
    padding: theme.spacing(2, 4, 0),
    [theme.breakpoints.down("xs")]: {
        padding: theme.spacing(2, 2, 0),
    },
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  backButton: {
    marginLeft: theme.spacing(-1),
    color: theme.palette.text?.secondary,
    padding: "6px"
  },
  box: {
    marginTop: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    padding: theme.spacing(1.5)
  },
  amount: {
    display: "inline-flex",
    marginTop: theme.spacing(1)
  },
  token: {
    margin: theme.spacing(0, 1)
  },
  transferBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.1)}`,
    padding: theme.spacing(1)
  },
  networkBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1)
  },
  label: {
    color: theme.palette.label
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  helpInfo: {
    verticalAlign: "text-top!important"
  },
  textWarning: {
    color: theme.palette.warning.main
  },
  dropDownIcon: {
    color: theme.palette.label
  },
  accordion: {
    borderRadius: "12px",
    boxShadow: "none",
    border: "none",
    backgroundColor:  "rgba(222, 255, 255, 0.1)"
  },
}));

// initialize a tradehub sdk client
// @param mnemonic  (optional) if supplied, initialize the sdk with an account
async function initTradehubSDK(mnemonic?: string) {
  let sdk = new TradeHubSDK({
    network: TradeHubSDK.Network.DevNet,
    debugMode: true,
  });

  if (mnemonic && mnemonic !== "") {
    // init sdk with a valid swth address
    sdk = await sdk.connectWithMnemonic(mnemonic);
  }
  return sdk;
}

// check deposit on switcheo side
// returns true if deposit is confirm, otherwise returns false
async function isDepositOnSwth(swthAddress: string, asset: Token, amount: string) {
  const sdk = new TradeHubSDK({
      network: TradeHubSDK.Network.DevNet,
      debugMode: false,
  })

  const result = await sdk.api.getTransfers({
      account: swthAddress
  })

  console.log(result[0]);
  if (result &&
      result.length > 0 &&
      result[0].transfer_type === "deposit" &&
      result[0].blockchain === asset.blockchain &&
      result[0].contract_hash === asset.lock_proxy_hash &&
      result[0].denom === asset.denom &&
      result[0].status === "success" &&
      result[0].amount === amount) {
      console.log("deposit confirmed; can proceed to withdraw")
      return true
  }
  return false
}

// lock the asset on Ethereum chain
// returns true if lock txn is success, false otherwise
function lockTxnOnEth(swthAddress: string, asset: Token) {

}

const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge);
  const token = useSelector<RootState, TokenInfo | undefined>(state => state.bridge.token);
  const [pending, setPending] = useState<Boolean>(false);
  const [complete, setComplete] = useState<Boolean>(false);

  if (!showTransfer) return null;

  // returns true if asset is native coin, false otherwise
  const isNativeAsset = (asset: Token) => {
    const zeroAddress = "0000000000000000000000000000000000000000";
    return (asset.asset_id === zeroAddress)
  }

  // remove 0x and lowercase
  const santizedAddress = (address: string) => {
    return address.replace("0x", "").toLowerCase();
  }

  const onWithdrawToZIL = async () => {
    console.log("withdraw zil side...");
    setPending(true);

    if (bridgeFormState.destAddress === null) {
      console.error("No address to withdraw to!");
      return null;
    }

    const sdk = await initTradehubSDK(`${BridgeParamConstants.TEMP_SWTH_MNEMONIC}`);

    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.WITHDRAW_DENOM}`];
    const lockProxy = asset.lock_proxy_hash;
    sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    const zilAddress = santizedAddress(bridgeFormState.destAddress!);

    const withdrawTradehub = await sdk.coin.withdraw({
      amount: `${bridgeFormState.transferAmount}`,
      denom: asset.denom,
      to_address: zilAddress,
      fee_address: `${BridgeParamConstants.SWTH_FEE_ADDRESS}`,
      fee_amount: "1",
      originator: sdk.wallet?.bech32Address
    });

    console.log("withdraw (tradehub): %o\n", withdrawTradehub);
    toaster(`Submitted: Initiate withdrawal ${withdrawTradehub.txhash} (SWTH -> ZIL)`);
  }

  const onWithdrawToETH = async () => {
    console.log("withdraw eth side...");
    setPending(true);

    if (bridgeFormState.sourceAddress === null) {
      console.error("No address to withdraw to!");
      return null;
    }

    const sdk = await initTradehubSDK(`${BridgeParamConstants.TEMP_SWTH_MNEMONIC}`);

    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.WITHDRAW_DENOM}`];
    const lockProxy = asset.lock_proxy_hash;
    sdk.eth.configProvider.getConfig().Eth.LockProxyAddr = `0x${lockProxy}`

    const ethAddress = santizedAddress(bridgeFormState.sourceAddress!);

    const withdrawTradehub = await sdk.coin.withdraw({
      amount: new BigNumber("1").toString(10),
      denom: asset.denom,
      to_address: ethAddress,
      fee_address: `${BridgeParamConstants.SWTH_FEE_ADDRESS}`,
      fee_amount: "1",
      originator: sdk.wallet?.bech32Address
    });

    console.log("withdraw (tradehub): %o\n", withdrawTradehub);
    toaster(`Submitted: Initiate withdrawal ${withdrawTradehub.txhash} (SWTH -> ETH)`);
  }

  /**
    * Lock the asset on Zilliqa chain
    * returns true if lock txn is success, false otherwise
    * @param wallet        connected zilliqa wallet
    * @param swthAddress   temp swth address to hold the lock asset
    * @param asset         details of the asset being locked; retrieved from tradehub
    * @param amount        nuumber of asset to be lock, e.g. set '1' if locking 1 native ZIL
    */
  async function lockTxnOnZil(wallet: ConnectedWallet, swthAddress: string, asset: Token, amount: string) {
    if (swthAddress === null || asset === null || wallet === null) {
      console.error("Zilliqa wallet not connected");
      return false;
    }

    const sdk = await initTradehubSDK();
    const lockProxy = asset.lock_proxy_hash;
    sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    const zilAddress = santizedAddress(wallet.addressInfo.byte20);
    const swthAddressBytes = SWTHAddress.getAddressBytes(swthAddress, sdk.network);
    const amountQa = units.toQa(amount, units.Units.Zil); // TODO: might have to determine if is locking asset or native zils

    if (!isNativeAsset(asset)) {
      // not native zils
      // user is transferring zrc2 tokens
      // need approval
      const allowance = await sdk.zil.checkAllowanceZRC2(asset, `0x${zilAddress}`, `0x${lockProxy}`);
      console.log("zil zrc2 allowance: ", allowance);

      const approveZRC2Params = {
        token: asset,
        gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
        gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
        zilAddress: zilAddress,
        signer: wallet.provider?.wallet!,
      }
      console.log("approve zrc2 token parameters: ", approveZRC2Params);
      toaster(`Approval needed (Zilliqa)`);

      const approve_tx = await sdk.zil.approveZRC2(approveZRC2Params);
      toaster(`Submitted: ${approve_tx.id!} (Zilliqa - ZRC2 Approval)`);

      await approve_tx.confirm(approve_tx.id!)
      console.log("transaction confirmed! receipt is: ", approve_tx.getReceipt())
    }

    const lockDepositParams = {
      address: swthAddressBytes,
      amount: new BigNumber(amountQa.toString()),
      token: asset,
      gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
      gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
      zilAddress: zilAddress,
      signer: wallet.provider?.wallet!,
    }

    console.log("lock deposit params: %o\n", lockDepositParams);
    toaster(`Locking asset (Zilliqa)`);
    const lock_tx = await sdk.zil.lockDeposit(lockDepositParams);

    toaster(`Submitted: ${lock_tx.id!} (Zilliqa - Lock Asset)`);

    await lock_tx.confirm(lock_tx.id!);
    console.log("transaction confirmed! receipt is: ", lock_tx.getReceipt());

    let isDeposited = false

    if (lock_tx !== undefined && lock_tx.getReceipt()?.success === true) {
      // check deposit on switcheo    
      for (let attempt = 0; attempt < 50; attempt++) {
        console.log("checking deposit...");
        const isConfirmed = await isDepositOnSwth(swthAddress, asset, amount)
        if (isConfirmed) {
            isDeposited = true
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (isDeposited) {
      return true;
    }
    return false;
  }

  const onConfirmEth = async () => {
    console.log("confirm eth side...");

    setPending(true);

    let provider;
    (window as any).ethereum.enable().then(provider = new ethers.providers.Web3Provider((window as any).ethereum));
    const signer = provider.getSigner();

    const sdk = await initTradehubSDK();
    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.DEPOSIT_DENOM}`];
    const lockProxy = asset.lock_proxy_hash;
    sdk.eth.configProvider.getConfig().Eth.LockProxyAddr = `0x${lockProxy}`

    const ethAddress = await signer.getAddress();
    const gasPrice = await sdk.eth.getProvider().getGasPrice();
    const gasPriceGwei = new BigNumber(gasPrice.toString()).shiftedBy(-9);
    const depositAmt = new BigNumber(1).shiftedBy(asset.decimals);

    // aprove token
    const allowance = await sdk.eth.checkAllowanceERC20(asset, ethAddress, `0x${lockProxy}`);
    if (allowance.lt(depositAmt)) {
      const approve_tx = await sdk.eth.approveERC20({
        token: asset,
        ethAddress: ethAddress,
        gasLimit: new BigNumber(100000),
        gasPriceGwei: gasPriceGwei,
        signer: signer,
      });

      console.log("approve tx", approve_tx.hash);
      await approve_tx.wait();
    }

    const swthAddressBytes = SWTHAddress.getAddressBytes(`${BridgeParamConstants.TEMP_SWTH_ADDRESS}`, sdk.network);
    const lock_tx = await sdk.eth.lockDeposit({
      token: asset,
      address: swthAddressBytes,
      ethAddress: ethAddress.toLowerCase(),
      gasLimit: new BigNumber(250000),
      gasPriceGwei: gasPriceGwei,
      amount: depositAmt,
      signer: signer,
    })

    console.log("lock tx", lock_tx);
    const result = await lock_tx.wait();

    console.log("result: ", result);

    // TODO: check txn on swth

    setTimeout(() => {
      setPending(false);
      setComplete(true);
    }, 5000)
  }

  const onConfirmZIL = async () => {
    setPending(true);

    if (wallet === null) {
      return;
    }

    const sdk = await initTradehubSDK(`${BridgeParamConstants.TEMP_SWTH_MNEMONIC}`);

    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.DEPOSIT_DENOM}`];

    console.log("locking asset: ", asset);

    const isLock = await lockTxnOnZil(wallet!, `${BridgeParamConstants.TEMP_SWTH_ADDRESS}`, asset, bridgeFormState.transferAmount.toString());
    if (isLock) {
      toaster("Success: asset locked! (Zilliqa -> SWTH)");
    }

    // TODO: combine with withdraw flow

    setTimeout(() => {
      setPending(false);
      setComplete(true);
    }, 5000)
  }

  const conductAnotherTransfer = () => {
    dispatch(actions.Bridge.clearForm());
    dispatch(actions.Layout.showTransferConfirmation(false));
  }

  return (
    <Box className={cls(classes.root, classes.container)}>
      {!pending && !complete && (
        <IconButton onClick={() => dispatch(actions.Layout.showTransferConfirmation(false))} className={classes.backButton}>
          <ArrowBack/>
        </IconButton>
      )}

      {!pending && !complete && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h2">Confirm Transfer</Text>
                
          <Text margin={0.5}>
            Please review your transaction carefully.
          </Text>

          <Text color="textSecondary">
            Transactions are non-reversible once they are processed.
          </Text>
        </Box>
      )}

      {(pending || complete) && (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Text variant="h2">{ pending ? "Transfer in Progress..." : "Transfer Complete" }</Text>
                
          <Text className={classes.textWarning} margin={0.5}>
            Do not close this page while we transfer your funds.
          </Text>

          <Text className={classes.textWarning} align="center">
            Failure to keep this page open during the duration of the transfer may lead to a loss of funds. ZilSwap will not be held accountable and cannot help you retrieve those funds.
          </Text>
        </Box>
      )}

      <Box className={classes.box} bgcolor="background.contrast">
        <Box className={classes.transferBox}>
          <Text>Transferring</Text>
          <Text variant="h2" className={classes.amount}>
            {bridgeFormState.transferAmount.toString()}
            <CurrencyLogo className={classes.token} currency={token?.symbol} address={token?.address} />
            {token?.symbol}
          </Text>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">From</Text>
            <Text variant="h4">Ethereum Network</Text>
            <Text variant="button">{truncate(bridgeFormState.sourceAddress, 5, 4)}</Text>
          </Box>
          <Box flex={0.2}></Box>
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">To</Text>
            <Text variant="h4">Zilliqa Network</Text>
            <Text variant="button">{truncate(wallet?.addressInfo.bech32, 5, 4)}</Text>
          </Box>
        </Box>
      </Box>

      {!pending && !complete && (
        <Box marginTop={3} marginBottom={0.5} px={2}>
          <KeyValueDisplay kkey={<strong>Estimated Total Fees</strong>} mb="8px">~ <span className={classes.textColoured}>$21.75</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Ethereum Txn Fee" mb="8px"><span className={classes.textColoured}>0.01</span> ETH ~<span className={classes.textColoured}>$21.25</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Zilliqa Txn Fee" mb="8px"><span className={classes.textColoured}>5</span> ZIL ~<span className={classes.textColoured}>$0.50</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
          <KeyValueDisplay kkey="Estimated Transfer Time" mb="8px"><span className={classes.textColoured}>&lt; 30</span> Minutes<HelpInfo className={classes.helpInfo} placement="top" title="Todo"/></KeyValueDisplay>
        </Box>
      )}

      {(pending || complete) && (
        <Box className={classes.box} bgcolor="background.contrast">
          <Text align="center" variant="h6">{pending ? "Transfer Progress" : "Transfer Complete"}</Text>

          <KeyValueDisplay kkey="Estimated Time Left" mt="8px" mb="8px" px={2}>
            {pending ? <span><span className={classes.textColoured}>20</span> Minutes</span> : "-" }
            <HelpInfo className={classes.helpInfo} placement="top" title="Todo"/>
          </KeyValueDisplay>

          <Accordion className={classes.accordion}>
            <Box display="flex" justifyContent="center">
              <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon}/>}>
                  <Text>View Transactions</Text>
              </AccordionSummary>
            </Box>
            <AccordionDetails>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={onConfirmEth}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : "Confirm (ETH side)"
          }
        </FancyButton>
      )} */}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={onConfirmZIL}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : "Confirm (ZIL -> SWTH)"
          }
        </FancyButton>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={onWithdrawToETH}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : "Withdraw (SWTH -> ETH)"
          }
        </FancyButton>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={onWithdrawToZIL}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : "Withdraw (SWTH -> ZIL)"
          }
        </FancyButton>
      )}

      {complete && (
        <FancyButton
          onClick={conductAnotherTransfer}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          Conduct Another Transfer
        </FancyButton>
      )}
    </Box>
  )
}

export default ConfirmTransfer;
