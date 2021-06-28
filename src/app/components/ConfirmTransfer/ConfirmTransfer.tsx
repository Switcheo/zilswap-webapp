import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Link, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import { units } from "@zilliqa-js/zilliqa";
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { actions } from "app/store";
import { BridgeState, BridgeFormState, BridgeTx } from "app/store/bridge/types";
import { RootState, TokenInfo, WalletObservedTx } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useNetwork, useToaster } from "app/utils";
import { BridgeParamConstants, ChainTransferFlow } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import { ethers } from "ethers";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SWTHAddress, Token, TradeHubSDK, Blockchain } from "tradehub-api-js";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiAccordionSummary-root": {
      display: "inline-flex"
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      minHeight: 0
    },
    "& .MuiAccordionDetails-root": {
      padding: "0px 16px 16px",
      display: "inherit"
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0
    }
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
    backgroundColor: "rgba(222, 255, 255, 0.1)"
  },
  arrowIcon: {
    verticalAlign: "middle",
    marginBottom: "1.2px",
    color: theme.palette.label
  },
  checkIcon: {
    fontSize: "1rem",
    verticalAlign: "sub",
  },
  link: {
    color: theme.palette.text?.secondary,
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    width: "10px",
    verticalAlign: "top",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
  warningIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.5)
  }
}));

// initialize a tradehub sdk client
// @param mnemonic initialize the sdk with an account
async function initTradehubSDK(mnemonic: string) {
  let sdk = new TradeHubSDK({
    network: TradeHubSDK.Network.DevNet,
    debugMode: true,
  });
  return await sdk.connectWithMnemonic(mnemonic);
}

// check withdrawal on switcheo side
// returns true if withdraw is confirm, otherwise returns false
async function isWithdrawOnSwth(swthTxnHash: string, asset: Token, amount: string) {
  const sdk = new TradeHubSDK({
    network: TradeHubSDK.Network.DevNet,
    debugMode: false,
  })

  const response = await sdk.api.getTxLog({ hash: swthTxnHash })

  if (response !== null) {
    const result = JSON.parse(response.raw_log);
    if (result !== null && result !== "") {
      return (result[0].log === 'Withdrawal success');
    }
  }

  return false
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

const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const network = useNetwork();
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge.formState);
  const token = useSelector<RootState, TokenInfo | undefined>(state => state.bridge.formState.token);
  const [pending, setPending] = useState<Boolean>(false);
  const [complete, setComplete] = useState<Boolean>(false);

  const swthAddrMnemonic = useMemo(() => SWTHAddress.newMnemonic(), []);

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

  const onWithdraw = async (recvAddress: string) => {
    setPending(true);

    const sdk = await initTradehubSDK(swthAddrMnemonic);

    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.WITHDRAW_DENOM}`];
    console.log("withdraw asset: ", asset);
    const lockProxy = asset.lock_proxy_hash;
    sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    const toAddress = santizedAddress(recvAddress);

    const withdrawTradehub = await sdk.coin.withdraw({
      amount: `${bridgeFormState.transferAmount}`,
      denom: asset.denom,
      to_address: toAddress,
      fee_address: `${BridgeParamConstants.SWTH_FEE_ADDRESS}`,
      fee_amount: "1",
      originator: sdk.wallet?.bech32Address
    });

    console.log("withdraw (tradehub): %o\n", withdrawTradehub);
    toaster(`Submitted: Initiate withdrawal ${withdrawTradehub.txhash} (SWTH -> DEST_BLOCKCHAIN)`);

    let isWithdrawn = false

    // check deposit on switcheo    
    for (let attempt = 0; attempt < 50; attempt++) {
      console.log("checking deposit...");
      const isConfirmed = await isWithdrawOnSwth(`${withdrawTradehub.txhash}`, asset, `${bridgeFormState.transferAmount}`)
      if (isConfirmed) {
        isWithdrawn = true
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setPending(false);
    setComplete(true);

    if (isWithdrawn) {
      toaster(`Success: asset withdraw (SWTH -> DEST_BLOCKCHAIN)`);
      return true;
    }
    return false;
  }

  /**
    * Lock the asset on Ethereum chain
    * returns true if lock txn is success, false otherwise
    * @param swthAddress   temp swth address to hold the lock asset
    * @param asset         details of the asset being locked; retrieved from tradehub
    * @param amount        nuumber of asset to be lock, e.g. set '1' if locking 1 native ETH
    */
  async function lockAssetOnEth(asset: Token, amount: string) {
    const lockProxy = asset.lock_proxy_hash;
    const sdk = await initTradehubSDK(swthAddrMnemonic);
    sdk.eth.configProvider.getConfig().Eth.LockProxyAddr = `0x${lockProxy}`;
    const swthAddress = sdk.wallet.bech32Address;

    let provider;
    (window as any).ethereum.enable().then(provider = new ethers.providers.Web3Provider((window as any).ethereum));
    const signer = provider.getSigner();

    const ethAddress = await signer.getAddress();
    const gasPrice = await sdk.eth.getProvider().getGasPrice();
    const gasPriceGwei = new BigNumber(gasPrice.toString()).shiftedBy(-9);
    const depositAmt = new BigNumber(amount).shiftedBy(asset.decimals);

    // approve token
    if (!isNativeAsset(asset)) {
      toaster(`Approval needed (Ethereum)`);

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
        toaster(`Submitted: ${approve_tx.hash!} (Ethereum - ERC20 Approval)`);
        await approve_tx.wait();
      }
    }

    toaster(`Locking asset (Ethereum)`);

    const swthAddressBytes = SWTHAddress.getAddressBytes(swthAddress, sdk.network);
    const lock_tx = await sdk.eth.lockDeposit({
      token: asset,
      address: swthAddressBytes,
      ethAddress: ethAddress.toLowerCase(),
      gasLimit: new BigNumber(250000),
      gasPriceGwei: gasPriceGwei,
      amount: depositAmt,
      signer: signer,
    });

    await lock_tx.wait();

    toaster(`Submitted: ${lock_tx.hash!} (Ethereum - Lock Asset)`);
    console.log("lock tx", lock_tx.hash!);
    let isDeposited = false

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

    if (isDeposited) {
      return true;
    }
    return false;
  }

  /**
    * Lock the asset on Zilliqa chain
    * returns true if lock txn is success, false otherwise
    * @param wallet        connected zilliqa wallet
    * @param asset         details of the asset being locked; retrieved from tradehub
    * @param amount        nuumber of asset to be lock, e.g. set '1' if locking 1 native ZIL
    */
  async function lockAssetOnZil(wallet: ConnectedWallet, asset: Token, amount: string) {
    if (asset === null || wallet === null) {
      console.error("Zilliqa wallet not connected");
      return false;
    }

    const lockProxy = asset.lock_proxy_hash;
    const sdk = await initTradehubSDK(swthAddrMnemonic);
    sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    const zilAddress = santizedAddress(wallet.addressInfo.byte20);
    const swthAddress = sdk.wallet.bech32Address;
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

      // token approval success
      // if (approve_tx !== undefined && approve_tx.getReceipt()?.success) {
      //   setTokenApproval(true);
      // }
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

    const walletObservedTx: WalletObservedTx = {
      hash: lock_tx.id!,
      deadline: Number.MAX_SAFE_INTEGER,
      address: wallet.addressInfo.bech32 || "",
      network,
    };
    dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
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

  // deposit address depends on the selection
  // not use at the moment because external wallets are used
  const onConfirm = async (depositAddress: string) => {
    setPending(true);

    const transferFlow = BridgeParamConstants.TRANSFER_FLOW;
    const sdk = await initTradehubSDK(swthAddrMnemonic);
    await sdk.token.reloadTokens();
    const asset = sdk.token.tokens[`${BridgeParamConstants.DEPOSIT_DENOM}`];

    if (transferFlow === ChainTransferFlow.ZIL_TO_ETH) {
      // init lock on zil side
      const isLock = await lockAssetOnZil(wallet!, asset, bridgeFormState.transferAmount.toString());
      if (isLock) {
        toaster("Success: asset locked! (Zilliqa -> SWTH)");
      }
    } else {
      // init lock on eth side
      const isLock = await lockAssetOnEth(asset, bridgeFormState.transferAmount.toString());
      if (isLock) {
        toaster("Success: asset locked! (Ethereum -> SWTH)");
      }
    }

    setPending(false);

    const { destAddress, sourceAddress } = bridgeFormState;
    if (!destAddress || !sourceAddress) return;

    const isToEth = transferFlow === ChainTransferFlow.ZIL_TO_ETH;
    const srcChain = isToEth ? Blockchain.Zilliqa : Blockchain.Ethereum
    const bridgeableToken = bridgeState.tokens[srcChain].find(token => token.denom === asset.denom)
    if (!bridgeableToken) {
      throw new Error(`bridgeable token not found for deposited denom: ${asset.denom}`)
    }

    const bridgeTx: BridgeTx = {
        dstAddr: destAddress,
        srcAddr: sourceAddress,
        dstChain: isToEth ? Blockchain.Ethereum : Blockchain.Zilliqa,
        srcChain: srcChain,
        dstToken: bridgeableToken.toDenom,
        srcToken: bridgeableToken.denom,
        sourceTxHash: "placeholder", // TODO: populate source tx hash
        inputAmount: bridgeFormState.transferAmount,
        interimAddrMnemonics: swthAddrMnemonic,
        withdrawFee: new BigNumber(1), // TODO: add withdraw fee
    }
    dispatch(actions.Bridge.addBridgeTx([bridgeTx]))
  }

  const conductAnotherTransfer = () => {
    dispatch(actions.Bridge.clearForm());
    dispatch(actions.Layout.showTransferConfirmation(false));
  }

  return (
    <Box className={cls(classes.root, classes.container)}>
      {!pending && !complete && (
        <IconButton onClick={() => dispatch(actions.Layout.showTransferConfirmation(false))} className={classes.backButton}>
          <ArrowBack />
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
          <Text variant="h2">{pending ? "Transfer in Progress..." : "Transfer Complete"}</Text>

          <Text className={classes.textWarning} margin={0.5}>
            <WarningRoundedIcon className={classes.warningIcon} /> Do not close this page while we transfer your funds.
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
          <KeyValueDisplay kkey={<strong>Estimated Total Fees</strong>} mb="8px">~ <span className={classes.textColoured}>$21.75</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Ethereum Txn Fee" mb="8px"><span className={classes.textColoured}>0.01</span> ETH ~<span className={classes.textColoured}>$21.25</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Zilliqa Txn Fee" mb="8px"><span className={classes.textColoured}>5</span> ZIL ~<span className={classes.textColoured}>$0.50</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="Estimated Transfer Time" mb="8px"><span className={classes.textColoured}>&lt; 30</span> Minutes<HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
        </Box>
      )}

      {(pending || complete) && (
        <Box className={classes.box} bgcolor="background.contrast">
          <Text align="center" variant="h6">{pending ? "Transfer Progress" : "Transfer Complete"}</Text>

          <KeyValueDisplay kkey="Estimated Time Left" mt="8px" mb="8px" px={2}>
            {pending ? <span><span className={classes.textColoured}>20</span> Minutes</span> : "-"}
            <HelpInfo className={classes.helpInfo} placement="top" title="Todo" />
          </KeyValueDisplay>

          <Accordion className={classes.accordion}>
            <Box display="flex" justifyContent="center">
              <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon} />}>
                <Text>View Transactions</Text>
              </AccordionSummary>
            </Box>
            <AccordionDetails>
              <Box>
                {/* Stage 1 */}
                <Box mb={1}>
                  <Text>
                    <strong>Stage 1: Ethereum <ArrowRightRoundedIcon className={classes.arrowIcon} /> TradeHub</strong>
                  </Text>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left" marginBottom={0.5}>
                      <CheckCircleOutlineRoundedIcon className={classes.checkIcon}/> Token Approval (ERC20/ZRC2)
                    </Text>
                    <Text className={classes.label}>
                      <Link
                        className={classes.link}
                        underline="none"
                        rel="noopener noreferrer"
                        target="_blank"
                        href="/">
                        View on Etherscan <NewLinkIcon className={classes.linkIcon} />
                      </Link>
                    </Text>
                  </Box>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={classes.checkIcon}/> Deposit to TradeHub Contract
                    </Text>
                    <Text className={classes.label}>-</Text>
                  </Box>
                </Box>

                {/* Stage 2 */}
                <Box mb={1}>
                  <Text>
                      <strong>Stage 2: TradeHub Confirmation</strong>
                  </Text>
                  <Box display="flex" mt={0.9}>
                    <Text className={classes.label} flexGrow={1} align="left" marginBottom={0.5}>
                      <CheckCircleOutlineRoundedIcon className={classes.checkIcon}/> TradeHub Deposit Confirmation
                    </Text>
                    <Text className={classes.label}>-</Text>
                  </Box>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={classes.checkIcon}/> Withdrawal to Zilliqa
                    </Text>
                    <Text className={classes.label}>-</Text>
                  </Box>
                </Box>

                {/* Stage 3 */}
                <Box>
                  <Text>
                    <strong>Stage 3: TradeHub <ArrowRightRoundedIcon className={classes.arrowIcon} /> Zilliqa</strong>
                  </Text>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={classes.checkIcon}/> Transfer to Zilliqa Wallet
                    </Text>
                    <Text className={classes.label}>-</Text>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={() => {
            const transferFlow = BridgeParamConstants.TRANSFER_FLOW;
            if (transferFlow === ChainTransferFlow.ZIL_TO_ETH) {
              onConfirm(bridgeFormState.destAddress!)
            } else {
              onConfirm(bridgeFormState.sourceAddress!)
            }
          }}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pending
            ? "Transfer in Progress..."
            : BridgeParamConstants.TRANSFER_FLOW === ChainTransferFlow.ZIL_TO_ETH
              ? "Confirm (ZIL -> SWTH)"
              : "Confirm (ETH -> SWTH)"
          }
        </FancyButton>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pending}
          onClick={() => onWithdraw(`${bridgeFormState.sourceAddress}`)}
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
          onClick={() => onWithdraw(`${bridgeFormState.destAddress}`)}
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
