import { Box, CircularProgress, IconButton, makeStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { Transaction } from '@zilliqa-js/account';
import { HTTPProvider } from '@zilliqa-js/core';
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { actions } from "app/store";
import { BridgeableToken, BridgeFormState, BridgeState, BridgeTx } from "app/store/bridge/types";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useAsyncTask, useToaster, useTokenFinder } from "app/utils";
import TransactionDetail from "app/views/bridge/TransactionDetail";
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { isDebug, logger } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { History } from "history";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Blockchain, ConnectedTradeHubSDK, RestModels, SWTHAddress, TradeHubSDK } from "tradehub-api-js";
import { BN_ONE } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { ReactComponent as EthereumLogo } from "../../views/main/Bridge/ethereum-logo.svg";
import { ReactComponent as WavyLine } from "../../views/main/Bridge/wavy-line.svg";
import { ReactComponent as ZilliqaLogo } from "../../views/main/Bridge/zilliqa-logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiAccordionSummary-root": {
      display: "inline-flex"
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "48px"
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
    maxWidth: 488,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
      padding: theme.spacing(2, 2, 0),
    }
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
    padding: theme.spacing(1),
    overflow: "auto",
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
  approvedHelpInfo: {
    verticalAlign: "top!important",
  },
  textWarning: {
    color: theme.palette.warning.main
  },
  textSuccess: {
    color: theme.palette.primary.dark
  },
  successIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.7)
  },
  dropDownIcon: {
    color: theme.palette.primary.light
  },
  accordion: {
    borderRadius: "12px",
    boxShadow: "none",
    border: "none",
    backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
    "& .MuiIconButton-root": {
      padding: 0,
      marginRight: 0
    }
  },
  checkIcon: {
    fontSize: "1rem",
    verticalAlign: "sub",
    color: theme.palette.primary.light,
  },
  wavyLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-70px",
    marginTop: "-40px",
    width: "140px",
    [theme.breakpoints.down("xs")]: {
      width: "100px",
      marginLeft: "-50px",
    },
  },
  chainName: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px"
    },
  },
  walletAddress: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px"
    },
  },
  progress: {
    color: "rgba(255,255,255,.5)",
    marginRight: theme.spacing(1)
  },
}));

// initialize a tradehub sdk client
// @param mnemonic initialize the sdk with an account
async function initTradehubSDK(mnemonic: string) {
  let attempts = 0;
  while (attempts++ < 10) {
    try {
      const sdk = new TradeHubSDK({
        network: TradeHubSDK.Network.DevNet,
        debugMode: isDebug(),
      });
      return await sdk.connectWithMnemonic(mnemonic);
    } catch (error) {
      console.error("init tradehub sdk error");
      console.error(error);

      // delay <2 ^ attempts> seconds if error occurs
      let delay = Math.pow(2, attempts) * 1000;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("failed to initialize TradeHubSDK")
}

const clearNavigationHook = (history: History<unknown>) => {
  history.block(true);
  window.onbeforeunload = null;
}

const addNavigationHook = (history: History<unknown>) => {
  clearNavigationHook(history);
  history.block("Do not close this window until your transfer has completed to prevent loss of tokens.");
  window.onbeforeunload = (event: BeforeUnloadEvent) => {
    const e = event || window.event;
    e.preventDefault();
    if (e) { e.returnValue = ''; }
    return ''; // Legacy method for cross browser support
  };
}

const CHAIN_NAMES = {
  [Blockchain.Zilliqa]: "Zilliqa",
  [Blockchain.Ethereum]: "Ethereum",
  [Blockchain.Neo]: "Neo",
  [Blockchain.BinanceSmartChain]: "Binance Smart Chain",
}

const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const history = useHistory();
  const tokenFinder = useTokenFinder();

  const [sdk, setSdk] = useState<ConnectedTradeHubSDK | null>(null);
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets.eth);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge.formState);
  const bridgeToken = useSelector<RootState, BridgeableToken | undefined>(state => state.bridge.formState.token);
  const [runInitTradeHubSDK] = useAsyncTask("initTradeHubSDK")

  const [tokenApproval, setTokenApproval] = useState<boolean>(false);
  const [approvalHash, setApprovalHash] = useState<string>("");
  const [swthAddrMnemonic, setSwthAddrMnemonic] = useState<string | undefined>();

  const pendingBridgeTx = bridgeState.activeBridgeTx;

  const [runConfirmTransfer, loadingConfirm] = useAsyncTask("confirmTransfer", (error) => toaster(error.message, { overridePersist: false }));

  const { toBlockchain, fromBlockchain, withdrawFee } = bridgeFormState;

  const canNavigateBack = useMemo(() => !pendingBridgeTx || !!pendingBridgeTx.withdrawTxHash, [pendingBridgeTx]);

  useEffect(() => {
    if (!swthAddrMnemonic)
      setSwthAddrMnemonic(SWTHAddress.newMnemonic());
  }, [swthAddrMnemonic])

  useEffect(() => {
    if (canNavigateBack) {
      clearNavigationHook(history)
    }
    // eslint-disable-next-line
  }, [canNavigateBack])

  useEffect(() => {
    return () => {
      clearNavigationHook(history)
    }
    // eslint-disable-next-line
  }, [])

  const { fromToken } = useMemo(() => {
    if (!bridgeToken) return {};
    return {
      fromToken: tokenFinder(bridgeToken.tokenAddress, bridgeToken.blockchain),
      toToken: tokenFinder(bridgeToken.toTokenAddress, bridgeToken.toBlockchain),
    }
  }, [bridgeToken, tokenFinder]);

  const { fromChainName, toChainName } = useMemo(() => {
    return {
      fromChainName: CHAIN_NAMES[bridgeFormState.fromBlockchain],
      toChainName: CHAIN_NAMES[bridgeFormState.toBlockchain],
    }
  }, [bridgeFormState.fromBlockchain, bridgeFormState.toBlockchain]);

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

    const ethersProvider = new ethers.providers.Web3Provider(ethWallet?.provider);
    const signer = ethersProvider.getSigner();

    const amount = bridgeFormState.transferAmount;
    const ethAddress = await signer.getAddress();
    const gasPrice = await sdk.eth.getProvider().getGasPrice();
    const gasPriceGwei = new BigNumber(ethers.utils.formatUnits(gasPrice, "gwei"));
    const depositAmt = amount.shiftedBy(asset.decimals);

    // approve token
    const approvalRequired = await isApprovalRequired(asset, depositAmt);
    if (approvalRequired) {

      const allowance = await sdk.eth.checkAllowanceERC20(asset, ethAddress, `0x${lockProxy}`);
      if (allowance.lt(depositAmt)) {
        toaster(`Approval needed (Ethereum)`, { overridePersist: false });
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

    toaster(`Locking asset (Ethereum)`, { overridePersist: false });

    const swthAddressBytes = SWTHAddress.getAddressBytes(swthAddress, sdk.network);
    const lock_tx = await sdk.eth.lockDeposit({
      token: asset,
      address: swthAddressBytes,
      ethAddress: ethAddress.toLowerCase(),
      gasLimit: new BigNumber(`${BridgeParamConstants.ETH_GAS_LIMIT}`),
      gasPriceGwei: gasPriceGwei,
      amount: depositAmt,
      signer: signer,
    });

    await lock_tx.wait();

    toaster(`Submitted: (Ethereum - Lock Asset)`, { sourceBlockchain: "eth", hash: lock_tx.hash! });
    logger("lock tx", lock_tx.hash!);

    return lock_tx.hash!;
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
    const depositAmt = amount.shiftedBy(asset.decimals)

    if (!isNativeAsset(asset)) {
      // not native zils
      // user is transferring zrc2 tokens
      // need approval
      const allowance = await sdk.zil.checkAllowanceZRC2(asset, `0x${zilAddress}`, `0x${lockProxy}`);
      logger("zil zrc2 allowance: ", allowance);

      if (allowance.lt(depositAmt)) {
        const approveZRC2Params = {
          token: asset,
          gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
          gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
          zilAddress: zilAddress,
          signer: wallet.provider! as any,
        }
        logger("approve zrc2 token parameters: ", approveZRC2Params);
        toaster(`Approval needed (Zilliqa)`, { overridePersist: false });

        const approve_tx = await sdk.zil.approveZRC2(approveZRC2Params);
        toaster(`Submitted: (Zilliqa - ZRC2 Approval)`, { hash: approve_tx.id! });
        setApprovalHash(approve_tx.id!);

        const toAddr = toBech32Address(approve_tx.txParams.toAddr)
        const emptyTx = new Transaction({ ...approve_tx.txParams, toAddr: toAddr }, new HTTPProvider(sdk.zil.getProviderUrl()));
        const confirmedTxn = await emptyTx.confirm(approve_tx.id!);
        logger("transaction confirmed! receipt is: ", confirmedTxn.getReceipt())

        // token approval success
        if (confirmedTxn !== undefined && confirmedTxn.getReceipt()?.success) {
          setTokenApproval(true);
        }
      } else {
        // approved before
        setTokenApproval(true);
      }
    }

    const lockDepositParams = {
      address: swthAddressBytes,
      amount: depositAmt,
      token: asset,
      gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
      gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
      zilAddress: zilAddress,
      signer: wallet.provider! as any,
    }

    logger("lock deposit params: %o\n", lockDepositParams);
    toaster(`Locking asset (Zilliqa)`, { overridePersist: false });
    const lock_tx = await sdk.zil.lockDeposit(lockDepositParams);

    toaster(`Submitted: (Zilliqa - Lock Asset)`, { hash: lock_tx.id! });
    logger("lock tx", lock_tx.id!);

    return lock_tx.id;
  }

  const onConfirm = async () => {
    if (!sdk) {
      console.error("TradeHubSDK not initialized")
      return null;
    }

    const asset = sdk.token.tokens[bridgeToken?.denom ?? ""];

    if (!asset) {
      console.error("asset not found for", bridgeToken);
      return null;
    }

    runConfirmTransfer(async () => {
      // TODO: uncomment when fees fixed.
      // if (!withdrawFee)
      //   throw new Error("withdraw fee not loaded");

      if (withdrawFee?.amount.gte(bridgeFormState.transferAmount)) {
        throw new Error("Transfer amount too low");
      }

      let sourceTxHash;
      if (fromBlockchain === Blockchain.Zilliqa) {
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
      if (!destAddress || !sourceAddress || !bridgeToken || !fromToken) return;

      const bridgeTx: BridgeTx = {
        dstAddr: destAddress,
        srcAddr: sourceAddress,
        dstChain: toBlockchain,
        srcChain: fromBlockchain,
        dstToken: bridgeToken.toDenom,
        srcToken: bridgeToken.denom,
        sourceTxHash: sourceTxHash,
        inputAmount: bridgeFormState.transferAmount,
        interimAddrMnemonics: swthAddrMnemonic!,
        withdrawFee: withdrawFee?.amount ?? BN_ONE.shiftedBy(3 - fromToken.decimals), // 1000 sat bypass withdraw fee check,
        depositDispatchedAt: dayjs(),
      }
      dispatch(actions.Bridge.addBridgeTx([bridgeTx]));

      addNavigationHook(history);
    })
  }

  const conductAnotherTransfer = () => {
    if (pendingBridgeTx)
      dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx));
    setSwthAddrMnemonic(SWTHAddress.newMnemonic());
    dispatch(actions.Layout.showTransferConfirmation(false));
  }

  const navigateBack = () => {
    if (pendingBridgeTx)
      dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx));
    dispatch(actions.Layout.showTransferConfirmation(false));
    setSwthAddrMnemonic(SWTHAddress.newMnemonic());
  }

  const formatAddress = (address: string | undefined | null, chain: Blockchain) => {
    if (!address) return "";
    switch (chain) {
      case Blockchain.Zilliqa:
        return truncate(toBech32Address(address), 5, 4);
      default:
        return truncate(address, 5, 4);
    }
  }

  if (!pendingBridgeTx) {
    return (
      <Box className={cls(classes.root, classes.container)}>
        {canNavigateBack && (
          <IconButton onClick={() => navigateBack()} className={classes.backButton}>
            <ArrowBack />
          </IconButton>
        )}

        <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h2">Confirm Transfer</Text>

          <Text variant="h4" margin={0.5} align="center">
            Please review your transaction carefully.
          </Text>

          <Text color="textSecondary" align="center">
            Transactions are non-reversible once they are processed.
          </Text>
        </Box>

        <Box className={classes.box} bgcolor="background.contrast">
          <Box className={classes.transferBox}>
            <Text>Transferring</Text>
            <Text variant="h2" className={classes.amount}>
              {bridgeFormState.transferAmount.toString(10)}
              <CurrencyLogo className={classes.token} currency={fromToken?.symbol} address={fromToken?.address} blockchain={fromToken?.blockchain} />
              {fromToken?.symbol}
            </Text>
          </Box>

          <Box mt={2} display="flex" justifyContent="space-between" position="relative">
            <Box className={classes.networkBox} flex={1}>
              <Text variant="h4" color="textSecondary">From</Text>
              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                {bridgeState.formState.fromBlockchain === Blockchain.Ethereum
                  ? <EthereumLogo />
                  : <ZilliqaLogo />
                }
              </Box>
              <Text variant="h4" className={classes.chainName}>{fromChainName} Network</Text>
              <Text variant="button" className={classes.walletAddress}>{formatAddress(bridgeState.formState.sourceAddress, fromBlockchain)}</Text>
            </Box>
            <Box flex={0.2} />
            <WavyLine className={classes.wavyLine} />
            <Box className={classes.networkBox} flex={1}>
              <Text variant="h4" color="textSecondary">To</Text>
              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                {bridgeState.formState.toBlockchain === Blockchain.Zilliqa
                  ? <ZilliqaLogo />
                  : <EthereumLogo />
                }
              </Box>
              <Text variant="h4" className={classes.chainName}>{toChainName} Network</Text>
              <Text variant="button" className={classes.walletAddress}>{formatAddress(bridgeState.formState.destAddress, toBlockchain)}</Text>
            </Box>
          </Box>
        </Box>

        <Box marginTop={3} marginBottom={0.5} px={2}>
          <KeyValueDisplay kkey={<strong>Estimated Total Fees</strong>} mb="8px">
            ~ <span className={classes.textColoured}>${withdrawFee?.value.toFixed(2) || 0}</span>
            <HelpInfo className={classes.helpInfo} placement="top" title="Estimated total fees to be incurred for this transfer (in USD). Please note that the fees will be deducted from the amount that is being transferred out of the network and you will receive less tokens as a result." />
          </KeyValueDisplay>
          <KeyValueDisplay kkey={<span>&nbsp; • &nbsp;{fromChainName} Txn Fee</span>} mb="8px">
            <span className={classes.textColoured}>{withdrawFee?.amount.toFixed(2)}</span>
            {" "}
            {fromToken?.symbol}
            {" "}
            ~<span className={classes.textColoured}>${withdrawFee?.value.toFixed(2) || 0}</span>
            <HelpInfo className={classes.helpInfo} placement="top" title="Estimated network fees incurred to pay the relayer." />
          </KeyValueDisplay>
          <KeyValueDisplay kkey="Estimated Transfer Time" mb="8px"><span className={classes.textColoured}>&lt; 30</span> Minutes<HelpInfo className={classes.helpInfo} placement="top" title="Estimated time for the completion of this transfer." /></KeyValueDisplay>
        </Box>

        <FancyButton
          disabled={loadingConfirm || !!pendingBridgeTx}
          onClick={onConfirm}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {loadingConfirm &&
            <CircularProgress size={20} className={classes.progress} />
          }
          {bridgeState.formState.fromBlockchain === Blockchain.Zilliqa
            ? "Confirm (ZIL -> ETH)"
            : "Confirm (ETH -> ZIL)"
          }
        </FancyButton>
      </Box>
    )
  } else {
    return (
      <TransactionDetail onBack={canNavigateBack ? navigateBack : undefined} onNewTransfer={conductAnotherTransfer} currentTx={pendingBridgeTx} approvalHash={approvalHash} tokenApproval={tokenApproval} />
    )
  }
}

export default ConfirmTransfer;
