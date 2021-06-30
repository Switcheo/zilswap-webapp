import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Link, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { units } from "@zilliqa-js/zilliqa";
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { BridgeableToken, BridgeFormState, BridgeState, BridgeTx } from "app/store/bridge/types";
import { RootState, WalletObservedTx } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useAsyncTask, useNetwork, useSearchParam, useToaster, useTokenFinder } from "app/utils";
import { BridgeParamConstants, ChainTransferFlow } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { logger } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { ethers } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain, ConnectedTradeHubSDK, RestModels, SWTHAddress, Token, TradeHubSDK } from "tradehub-api-js";
import { ReactComponent as EthereumLogo } from "../../views/main/Bridge/ethereum-logo.svg";
import { ReactComponent as WavyLine } from "../../views/main/Bridge/wavy-line.svg";
import { ReactComponent as ZilliqaLogo } from "../../views/main/Bridge/zilliqa-logo.svg";
import { ReactComponent as StraightLine } from"./straight-line.svg";
// import { ReactComponent as ProgressBar } from"./progress.svg";
import { Network } from "zilswap-sdk/lib/constants";

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
    backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
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
    backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`
  },
  arrowIcon: {
    verticalAlign: "middle",
    marginBottom: "1.2px",
    color: theme.palette.label
  },
  checkIcon: {
    fontSize: "1rem",
    verticalAlign: "sub",
    color: theme.palette.primary.light,
  },
  checkIconCompleted: {
    color: theme.palette.primary.dark
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
  },
  wavyLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-70px",
    marginTop: "-40px",
    display: theme.palette.type === "light" ? "none" : "",
    width: "140px",
    [theme.breakpoints.down("xs")]: {
      width: "100px",
      marginLeft: "-50px",
    },
  },
  straightLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-60px",
    marginTop: "-20px",
    display: theme.palette.type === "light" ? "none" : "",
    [theme.breakpoints.down("xs")]: {
      width: "90px",
      marginLeft: "-45px",
    },
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

// check deposit on switcheo side
// returns true if deposit is confirm, otherwise returns false
async function isDepositOnSwth(swthAddress: string, asset: Token, amount: BigNumber) {
  const sdk = new TradeHubSDK({
    network: TradeHubSDK.Network.DevNet,
    debugMode: false,
  })

  const result = await sdk.api.getTransfers({
    account: swthAddress
  })

  logger(result[0]);
  if (result &&
    result.length > 0 &&
    result[0].transfer_type === "deposit" &&
    result[0].blockchain === asset.blockchain &&
    result[0].contract_hash === asset.lock_proxy_hash &&
    result[0].denom === asset.denom &&
    result[0].status === "success" &&
    result[0].amount === amount.toString(10)) {
    logger("deposit confirmed; can proceed to withdraw")
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
  const tokenFinder = useTokenFinder();
  const [sdk, setSdk] = useState<ConnectedTradeHubSDK | null>(null);
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge.formState);
  const bridgeToken = useSelector<RootState, BridgeableToken | undefined>(state => state.bridge.formState.token);
  const [runInitTradeHubSDK] = useAsyncTask("initTradeHubSDK")
  const enableCheatyButtons = useSearchParam("enableCheatyButtons") === "true";

  const [tokenApproval, setTokenApproval] = useState<Boolean>(false);
  const [approvalHash, setApprovalHash] = useState<string>("");

  const pendingBridgeTx = useMemo(() => bridgeState.bridgeTxs.find(bridgeTx => !bridgeTx.destinationTxHash), [bridgeState]);
  const complete = useMemo(() => !!pendingBridgeTx?.destinationTxHash, [pendingBridgeTx]);
  const swthAddrMnemonic = useMemo(() => SWTHAddress.newMnemonic(), []);


  const { fromToken } = useMemo(() => {
    if (!bridgeToken) return {};
    return {
      fromToken: tokenFinder(bridgeToken.tokenAddress, bridgeToken.blockchain),
      toToken: tokenFinder(bridgeToken.toTokenAddress, bridgeToken.toBlockchain),
    }
  }, [bridgeToken, tokenFinder]);

  useEffect(() => {
    if (!swthAddrMnemonic) return;

    runInitTradeHubSDK(async () => {
      const sdk = await initTradehubSDK(swthAddrMnemonic);
      await sdk.token.reloadTokens();
      setSdk(sdk);
    })

    // eslint-disable-next-line
  }, [swthAddrMnemonic])

  if (!showTransfer) return null;

  // returns true if asset is native coin, false otherwise
  const isNativeAsset = (asset: RestModels.Token) => {
    const zeroAddress = "0000000000000000000000000000000000000000";
    return (asset.asset_id === zeroAddress)
  }

  // remove 0x and lowercase
  const santizedAddress = (address: string) => {
    return address.replace("0x", "").toLowerCase();
  }

  const isApprovalRequired = async (asset: RestModels.Token, amount: BigNumber) => {
    return !isNativeAsset(asset)
  }

  const onWithdraw = async (recvAddress: string) => {
    // setPending(true);

    // const sdk = await initTradehubSDK(swthAddrMnemonic);

    // await sdk.token.reloadTokens();
    // const asset = sdk.token.tokens[`${BridgeParamConstants.WITHDRAW_DENOM}`];
    // logger("withdraw asset: ", asset);
    // const lockProxy = asset.lock_proxy_hash;
    // sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    // sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    // sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    // const toAddress = santizedAddress(recvAddress);

    // const withdrawTradehub = await sdk.coin.withdraw({
    //   amount: `${bridgeFormState.transferAmount}`,
    //   denom: asset.denom,
    //   to_address: toAddress,
    //   fee_address: `${BridgeParamConstants.SWTH_FEE_ADDRESS}`,
    //   fee_amount: "0",
    //   originator: sdk.wallet?.bech32Address
    // });

    // logger("withdraw (tradehub): %o\n", withdrawTradehub);
    // toaster(`Submitted: Initiate withdrawal ${withdrawTradehub.txhash} (SWTH -> DEST_BLOCKCHAIN)`);

    // let isWithdrawn = false

    // // check deposit on switcheo    
    // for (let attempt = 0; attempt < 50; attempt++) {
    //   logger("checking deposit...");
    //   const isConfirmed = await isWithdrawOnSwth(`${withdrawTradehub.txhash}`, asset, `${bridgeFormState.transferAmount}`)
    //   if (isConfirmed) {
    //     isWithdrawn = true
    //     break;
    //   }
    //   await new Promise(resolve => setTimeout(resolve, 2000));
    // }

    // setPending(false);
    // setComplete(true);

    // if (isWithdrawn) {
    //   toaster(`Success: asset withdraw (SWTH -> DEST_BLOCKCHAIN)`);
    //   return true;
    // }
    return false;
  }

  /**
    * Lock the asset on Ethereum chain
    * returns the txn hash if lock txn is successful, otherwise return null
    * @param asset         details of the asset being locked; retrieved from tradehub
    */
  async function lockAssetOnEth(asset: RestModels.Token) {
    if (!bridgeToken || !fromToken || !sdk) return null;

    const lockProxy = asset.lock_proxy_hash;
    sdk.eth.configProvider.getConfig().Eth.LockProxyAddr = `0x${lockProxy}`;
    const swthAddress = sdk.wallet.bech32Address;

    let provider;
    (window as any).ethereum.enable().then(provider = new ethers.providers.Web3Provider((window as any).ethereum));
    const signer = provider.getSigner();

    const amount = bridgeFormState.transferAmount;
    const ethAddress = await signer.getAddress();
    const gasPrice = await sdk.eth.getProvider().getGasPrice();
    const gasPriceGwei = new BigNumber(gasPrice.toString()).shiftedBy(-9);
    const depositAmt = amount.shiftedBy(asset.decimals);

    // approve token
    const approvalRequired = await isApprovalRequired(asset, depositAmt);
    if (approvalRequired) {
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

        logger("approve tx", approve_tx.hash);
        toaster(`Submitted: (Ethereum - ERC20 Approval)`, { hash: approve_tx.hash!, sourceBlockchain: "eth" });
        setApprovalHash(approve_tx.hash!);
        await approve_tx.wait();

        // token approval success
        if (approve_tx !== undefined && (approve_tx as any).status === 1) {
          setTokenApproval(true);
        }
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

    toaster(`Submitted: (Ethereum - Lock Asset)`, { sourceBlockchain: "eth", hash: lock_tx.hash! });
    logger("lock tx", lock_tx.hash!);
    let isDeposited = false

    // check deposit on switcheo    
    for (let attempt = 0; attempt < 50; attempt++) {
      logger("checking deposit...");
      const isConfirmed = await isDepositOnSwth(swthAddress, asset, amount)
      if (isConfirmed) {
        isDeposited = true
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (isDeposited) {
      return lock_tx.hash!;
    }
    return null;
  }

  /**
    * Lock the asset on Zilliqa chain
    * returns the txn hash if lock txn is successful, otherwise return null
    * @param asset         details of the asset being locked; retrieved from tradehub
    */
  async function lockAssetOnZil(asset: RestModels.Token) {
    if (wallet === null) {
      console.error("Zilliqa wallet not connected");
      return null;
    }
    if (!sdk) {
      console.error("TradeHubSDK not initialized");
      return null;
    }

    const lockProxy = asset.lock_proxy_hash;
    sdk.zil.configProvider.getConfig().Zil.LockProxyAddr = `0x${lockProxy}`;
    sdk.zil.configProvider.getConfig().Zil.ChainId = 333;
    sdk.zil.configProvider.getConfig().Zil.RpcURL = "https://dev-api.zilliqa.com";

    const amount = bridgeFormState.transferAmount;
    const zilAddress = santizedAddress(wallet.addressInfo.byte20);
    const swthAddress = sdk.wallet.bech32Address;
    const swthAddressBytes = SWTHAddress.getAddressBytes(swthAddress, sdk.network);
    const amountQa = units.toQa(amount.toString(10), units.Units.Zil); // TODO: might have to determine if is locking asset or native zils

    if (!isNativeAsset(asset)) {
      // not native zils
      // user is transferring zrc2 tokens
      // need approval
      const allowance = await sdk.zil.checkAllowanceZRC2(asset, `0x${zilAddress}`, `0x${lockProxy}`);
      logger("zil zrc2 allowance: ", allowance);

      const approveZRC2Params = {
        token: asset,
        gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
        gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
        zilAddress: zilAddress,
        signer: wallet.provider?.wallet!,
      }
      logger("approve zrc2 token parameters: ", approveZRC2Params);
      toaster(`Approval needed (Zilliqa)`);

      const approve_tx = await sdk.zil.approveZRC2(approveZRC2Params);
      toaster(`Submitted: (Zilliqa - ZRC2 Approval)`, { hash: approve_tx.id! });
      setApprovalHash(approve_tx.id!);

      await approve_tx.confirm(approve_tx.id!)
      logger("transaction confirmed! receipt is: ", approve_tx.getReceipt())

      // token approval success
      if (approve_tx !== undefined && approve_tx.getReceipt()?.success) {
        setTokenApproval(true);
      }
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

    logger("lock deposit params: %o\n", lockDepositParams);
    toaster(`Locking asset (Zilliqa)`);
    const lock_tx = await sdk.zil.lockDeposit(lockDepositParams);

    const walletObservedTx: WalletObservedTx = {
      hash: lock_tx.id!,
      deadline: Number.MAX_SAFE_INTEGER,
      address: wallet.addressInfo.bech32 || "",
      network,
    };
    dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    toaster(`Submitted: (Zilliqa - Lock Asset)`, { hash: lock_tx.id! });

    await lock_tx.confirm(lock_tx.id!);
    logger("transaction confirmed! receipt is: ", lock_tx.getReceipt());

    let isDeposited = false

    if (lock_tx !== undefined && lock_tx.getReceipt()?.success === true) {
      // check deposit on switcheo    
      for (let attempt = 0; attempt < 50; attempt++) {
        logger("checking deposit...");
        const isConfirmed = await isDepositOnSwth(swthAddress, asset, amount)
        if (isConfirmed) {
          isDeposited = true
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (isDeposited) {
      return lock_tx.id;
    }
    return null;
  }

  // deposit address depends on the selection
  // not use at the moment because external wallets are used
  const onConfirm = async (depositAddress: string) => {
    if (!sdk) {
      console.error("TradeHubSDK not initialized")
      return null;
    }

    const transferFlow = bridgeState.formState.transferDirection;
    const asset = sdk.token.tokens[bridgeToken?.denom ?? ""];

    if (!asset) {
      console.error("asset not found for", bridgeToken);
      return null;
    }

    let sourceTxHash;
    if (transferFlow === ChainTransferFlow.ZIL_TO_ETH) {
      // init lock on zil side
      sourceTxHash = await lockAssetOnZil(asset);
    } else {
      // init lock on eth side
      sourceTxHash = await lockAssetOnEth(asset);
    }

    if (sourceTxHash === null) {
      console.error("source txn hash is null!");
      return null;
    }

    const { destAddress, sourceAddress } = bridgeFormState;
    if (!destAddress || !sourceAddress || !bridgeToken) return;

    const isToEth = transferFlow === ChainTransferFlow.ZIL_TO_ETH;
    const srcChain = isToEth ? Blockchain.Zilliqa : Blockchain.Ethereum

    const bridgeTx: BridgeTx = {
      dstAddr: destAddress,
      srcAddr: sourceAddress,
      dstChain: isToEth ? Blockchain.Ethereum : Blockchain.Zilliqa,
      srcChain: srcChain,
      dstToken: bridgeToken.toDenom,
      srcToken: bridgeToken.denom,
      sourceTxHash: sourceTxHash, // TODO: populate source tx hash
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
      {!pendingBridgeTx && (
        <IconButton onClick={() => dispatch(actions.Layout.showTransferConfirmation(false))} className={classes.backButton}>
          <ArrowBack />
        </IconButton>
      )}

      {!pendingBridgeTx && (
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

      {!!pendingBridgeTx && (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Text variant="h2">{!pendingBridgeTx.destinationTxHash ? "Transfer in Progress..." : "Transfer Complete"}</Text>

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
            {pendingBridgeTx?.inputAmount.toString(10) ?? bridgeFormState.transferAmount.toString(10)}
            <CurrencyLogo className={classes.token} currency={fromToken?.symbol} address={fromToken?.address} />
            {fromToken?.symbol}
          </Text>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between" position="relative">
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">From</Text>
            <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
              {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL
                ? <EthereumLogo />
                : <ZilliqaLogo />
              }
            </Box>
            <Text variant="h4">{bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Ethereum Network' : 'Zilliqa Network'}</Text>
            <Text variant="button">{truncate(bridgeState.formState.sourceAddress, 5, 4)}</Text>
          </Box>
          <Box flex={0.2} />
          {complete
            ? <StraightLine className={classes.straightLine} />
            : <WavyLine className={classes.wavyLine} />
          }
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">To</Text>
            <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
              {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL
                ? <ZilliqaLogo />
                : <EthereumLogo />
              }
            </Box>
            <Text variant="h4">{bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Zilliqa Network' : 'Ethereum Network'}</Text>
            <Text variant="button">{truncate(bridgeState.formState.destAddress, 5, 4)}</Text>
          </Box>
        </Box>
      </Box>

      {!pendingBridgeTx && (
        <Box marginTop={3} marginBottom={0.5} px={2}>
          <KeyValueDisplay kkey={<strong>Estimated Total Fees</strong>} mb="8px">~ <span className={classes.textColoured}>$21.75</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Ethereum Txn Fee" mb="8px"><span className={classes.textColoured}>0.01</span> ETH ~<span className={classes.textColoured}>$21.25</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="&nbsp; • &nbsp; Zilliqa Txn Fee" mb="8px"><span className={classes.textColoured}>5</span> ZIL ~<span className={classes.textColoured}>$0.50</span><HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
          <KeyValueDisplay kkey="Estimated Transfer Time" mb="8px"><span className={classes.textColoured}>&lt; 30</span> Minutes<HelpInfo className={classes.helpInfo} placement="top" title="Todo" /></KeyValueDisplay>
        </Box>
      )}

      {pendingBridgeTx && (
        <Box className={classes.box} bgcolor="background.contrast">
          <Text align="center" variant="h6">{!pendingBridgeTx.destinationTxHash ? "Transfer Progress" : "Transfer Complete"}</Text>

          {/* <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={1}>
            <ProgressBar />
            <Box width={1} display="flex" justifyContent="space-evenly">
              <Box display="flex" flexDirection="column" alignItems="center">
                <Text variant="h6">Deposit</Text>
                <Text className={classes.label}>{bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Ethereum' : 'Zilliqa'}</Text>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Text variant="h6">Confirm</Text>
                <Text className={classes.label}>Tradehub</Text>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Text variant="h6">Withdraw</Text>
                <Text className={classes.label}>{bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Zilliqa' : 'Ethereum'}</Text>
              </Box>
            </Box>
          </Box> */}
  
          <KeyValueDisplay kkey="Estimated Time Left" mt="8px" mb="8px" px={2}>
            {!pendingBridgeTx.destinationTxHash ? <span><span className={classes.textColoured}>20</span> Minutes</span> : "-"}
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
                    <strong>Stage 1: {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Ethereum' : 'Zilliqa'} <ArrowRightRoundedIcon className={classes.arrowIcon} /> TradeHub</strong>
                  </Text>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left" marginBottom={0.5}>
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, tokenApproval || pendingBridgeTx.sourceTxHash ? classes.checkIconCompleted : "")} /> Token Approval (ERC20/ZRC2)
                    </Text>
                    <Text className={classes.label}>
                      {approvalHash &&
                        <Link
                          className={classes.link}
                          underline="none"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? `https://etherscan.io/search?q=${approvalHash}` : `https://viewblock.io/zilliqa/tx/${approvalHash}?network=${network.toLowerCase()}`}>
                          View on { bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Etherscan' : 'ViewBlock' } <NewLinkIcon className={classes.linkIcon} />
                        </Link>
                      }
                      {!approvalHash &&
                        <Text className={classes.label}>
                          Approved
                          <HelpInfo className={classes.helpInfo} placement="top" title="Only one approval is required per token. You have previously approved this token and will not need to approve it for this or future transfers." />
                        </Text>
                      }
                    </Text>
                  </Box>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, pendingBridgeTx.sourceTxHash ? classes.checkIconCompleted : "")} /> Deposit to TradeHub Contract
                    </Text>
                    <Text className={classes.label}>
                      { pendingBridgeTx.sourceTxHash
                        ? <Link
                            className={classes.link}
                            underline="none"
                            rel="noopener noreferrer"
                            target="_blank"
                            href={bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? `https://etherscan.io/search?q=${pendingBridgeTx.sourceTxHash}` : `https://viewblock.io/zilliqa/tx/${pendingBridgeTx.sourceTxHash}?network=${network.toLowerCase()}`}>
                            View on { bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Etherscan' : 'ViewBlock' } <NewLinkIcon className={classes.linkIcon} />
                          </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>

                {/* Stage 2 */}
                <Box mb={1}>
                  <Text>
                    <strong>Stage 2: TradeHub Confirmation</strong>
                  </Text>
                  <Box display="flex" mt={0.9}>
                    <Text className={classes.label} flexGrow={1} align="left" marginBottom={0.5}>
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, pendingBridgeTx?.depositTxConfirmedAt ? classes.checkIconCompleted : "")} /> TradeHub Deposit Confirmation
                    </Text>
                    <Text className={classes.label}>
                      { pendingBridgeTx?.depositTxConfirmedAt
                        ? <Link
                            className={classes.link}
                            underline="none"
                            rel="noopener noreferrer"
                            target="_blank"
                            href="/">
                            View on TradeHub <NewLinkIcon className={classes.linkIcon} />
                          </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, pendingBridgeTx.withdrawTxHash ? classes.checkIconCompleted : "")} />
                      {" "}
                      Withdrawal to {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Zilliqa' : 'Ethereum'}
                    </Text>
                    <Text className={classes.label}>
                      { pendingBridgeTx.withdrawTxHash
                        ? <Link
                            className={classes.link}
                            underline="none"
                            rel="noopener noreferrer"
                            target="_blank"
                            href={`https://tradescan.switcheo.org/transaction/${pendingBridgeTx.withdrawTxHash}?net=${network === Network.MainNet ? "main" : "dev"}`}>
                            View on TradeHub <NewLinkIcon className={classes.linkIcon} />
                          </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>

                {/* Stage 3 */}
                <Box>
                  <Text>
                    <strong>Stage 3: TradeHub <ArrowRightRoundedIcon className={classes.arrowIcon} /> {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Zilliqa' : 'Ethereum'}</strong>
                  </Text>
                  <Box display="flex">
                    <Text className={classes.label} flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, pendingBridgeTx.destinationTxHash ? classes.checkIconCompleted : "")} />
                      {" "}
                      Transfer to {bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'Zilliqa' : 'Ethereum'} Wallet
                    </Text>
                    <Text className={classes.label}>
                    { pendingBridgeTx.destinationTxHash
                        ? <Link
                            className={classes.link}
                            underline="none"
                            rel="noopener noreferrer"
                            target="_blank"
                            href={bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? `https://viewblock.io/zilliqa/tx/${pendingBridgeTx.destinationTxHash}?network=${network.toLowerCase()}` : `https://etherscan.io/search?q=${pendingBridgeTx.destinationTxHash}`}>
                            View on { bridgeState.formState.transferDirection === ChainTransferFlow.ETH_TO_ZIL ? 'ViewBlock' : 'Etherscan' } <NewLinkIcon className={classes.linkIcon} />
                          </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {!complete && (
        <FancyButton
          disabled={!!pendingBridgeTx}
          onClick={() => onConfirm(bridgeFormState.sourceAddress!)}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pendingBridgeTx
            ? "Transfer in Progress..."
            : bridgeState.formState.transferDirection === ChainTransferFlow.ZIL_TO_ETH
              ? "Confirm (ZIL -> ETH)"
              : "Confirm (ETH -> ZIL)"
          }
        </FancyButton>
      )}

      {enableCheatyButtons && !complete && (
        <FancyButton
          disabled={!!pendingBridgeTx}
          onClick={() => onWithdraw(bridgeFormState.destAddress!)}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pendingBridgeTx
            ? "Transfer in Progress..."
            : bridgeState.formState.transferDirection === ChainTransferFlow.ZIL_TO_ETH
              ? "Withdraw (SWTH -> ETH)"
              : "Withdraw (SWTH -> ZIL)"
          }
        </FancyButton>
      )}

      {enableCheatyButtons && !complete && (
        <FancyButton
          disabled={!!pendingBridgeTx}
          onClick={() => onWithdraw(bridgeFormState.sourceAddress!)}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {pendingBridgeTx
            ? "Transfer in Progress..."
            : bridgeState.formState.transferDirection === ChainTransferFlow.ZIL_TO_ETH
              ? "Withdraw To Source (SWTH -> ZIL) (FOR TESTING)"
              : "Withdraw To Source (SWTH -> ETH) (FOR TESTING)"
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
