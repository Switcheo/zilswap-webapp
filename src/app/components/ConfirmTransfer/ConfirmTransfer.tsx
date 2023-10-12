import React, { useEffect, useMemo, useState } from "react"
import { Box, CircularProgress, IconButton, Tooltip, makeStyles } from "@material-ui/core"
import { ArrowBack } from "@material-ui/icons"
import { Transaction } from '@zilliqa-js/account'
import { HTTPProvider } from '@zilliqa-js/core'
import { toBech32Address } from "@zilliqa-js/zilliqa"
import BigNumber from "bignumber.js"
import cls from "classnames"
import dayjs from "dayjs"
import { ethers } from "ethers"
import { History } from "history"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router"
import { Blockchain, AddressUtils, Models, CarbonSDK } from "carbon-js-sdk"
import { Network } from "zilswap-sdk/lib/constants"
import { ZilBridgeParams } from 'carbon-js-sdk/lib/clients/ZILClient'
import ETHClient, { BridgeParams } from 'carbon-js-sdk/lib/clients/ETHClient'
import { BN_ZERO } from 'carbon-js-sdk/lib/util/number'
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet"
import { ConnectedWallet } from "core/wallet"
import { logger } from "core/utilities"
import { BridgeParamConstants } from "app/views/main/Bridge/components/constants"
import TransactionDetail from "app/views/bridge/TransactionDetail"
import { BIG_ONE, BRIDGE_DISABLED, SimpleMap, truncateAddress } from "app/utils"
import { hexToRGBA, netZilToCarbon, trimValue, truncate, useAsyncTask, useNetwork, useToaster, useTokenFinder } from "app/utils"
import { AppTheme } from "app/theme/types"
import { RootState } from "app/store/types"
import { BridgeFormState, BridgeState, BridgeTx, BridgeableToken } from "app/store/bridge/types"
import { actions } from "app/store"
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, Text } from "app/components"
import { getETHClient, getEvmGasLimit, getRecoveryAddress } from 'app/utils/bridge'
import ChainLogo from 'app/views/main/Bridge/components/ChainLogo/ChainLogo'
import { ReactComponent as WavyLine } from "../../views/main/Bridge/wavy-line.svg"


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
    border: theme.palette.border,
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
}))

const clearNavigationHook = (history: History<unknown>) => {
  history.block(true)
  window.onbeforeunload = null
}

const addNavigationHook = (history: History<unknown>) => {
  clearNavigationHook(history)
  history.block("Do not close this window until your transfer has completed to prevent loss of tokens.")
  window.onbeforeunload = (event: BeforeUnloadEvent) => {
    const e = event || window.event
    e.preventDefault()
    if (e) { e.returnValue = '' }
    return '' // Legacy method for cross browser support
  }
}

const getChainName = (blockchain: Blockchain) => {
  switch (blockchain) {
    case Blockchain.Zilliqa: return "Zilliqa"
    case Blockchain.Ethereum: return "Ethereum"
    case Blockchain.Neo: return "Neo"
    case Blockchain.BinanceSmartChain: return "Binance Smart Chain"
    case Blockchain.Native: return "Carbon"
    case Blockchain.Btc: return "Bitcoin"

    case Blockchain.Carbon: return "Carbon"
    case Blockchain.Switcheo: return "Switcheo"
    case Blockchain.TradeHub: return "TradeHub"
    case Blockchain.PolyNetwork: return "PolyNetwork"
    case Blockchain.Neo3: return "Neo N3"
    case Blockchain.Osmosis: return "Osmosis"
    case Blockchain.Ibc: return "IBC"
    case Blockchain.Juno: return "Juno"
    case Blockchain.CosmosHub: return "Cosmos"
    case Blockchain.Terra: return "Terra"
    case Blockchain.Evmos: return "Evmos"
    default: blockchain?.toString?.()
  }
}

const ConfirmTransfer = (props: any) => {
  const { showTransfer } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const toaster = useToaster()
  const history = useHistory()
  const tokenFinder = useTokenFinder()
  const network = useNetwork()

  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet)
  const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets.eth)
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge)
  const bridgeFormState = useSelector<RootState, BridgeFormState>(state => state.bridge.formState)
  const bridgeToken = useSelector<RootState, BridgeableToken | undefined>(state => state.bridge.formState.token)
  const sdk = useSelector<RootState, SimpleMap<CarbonSDK>>(state => state.carbonSDK.sdkCache)[network]

  const [tokenApproval, setTokenApproval] = useState<boolean>(false)
  const [approvalHash, setApprovalHash] = useState<string>("")
  const [swthAddrMnemonic, setSwthAddrMnemonic] = useState<string | undefined>()

  const pendingBridgeTx = bridgeState.activeBridgeTx

  const [runConfirmTransfer, loadingConfirm] = useAsyncTask("confirmTransfer", (error) => toaster(error.message, { overridePersist: false }))

  const { toBlockchain, fromBlockchain, withdrawFee } = bridgeFormState

  const canNavigateBack = useMemo(() => !pendingBridgeTx || !!pendingBridgeTx.withdrawTxHash, [pendingBridgeTx])

  const destToken = useMemo(() => {
    return Object.values(bridgeState.tokens).find(token => token.denom === bridgeToken?.chains[toBlockchain])
  }, [bridgeState.tokens, bridgeToken, toBlockchain])

  useEffect(() => {
    if (!swthAddrMnemonic)
      setSwthAddrMnemonic(AddressUtils.SWTHAddress.newMnemonic())
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

  const fromToken = useMemo(() => {
    if (!bridgeToken) return
    return tokenFinder(bridgeToken.tokenAddress, bridgeToken.blockchain)
  }, [bridgeToken, tokenFinder])

  const { fromChainName, toChainName } = useMemo(() => {
    return {
      fromChainName: getChainName(bridgeFormState.fromBlockchain),
      toChainName: getChainName(bridgeFormState.toBlockchain),
    }
  }, [bridgeFormState.fromBlockchain, bridgeFormState.toBlockchain])

  if (!showTransfer) return null

  // returns true if asset is native coin, false otherwise
  const isNativeAsset = (asset: Models.Carbon.Coin.Token) => {
    const zeroAddress = "0000000000000000000000000000000000000000"
    return (asset.tokenAddress === zeroAddress)
  }

  // remove 0x and lowercase
  const santizedAddress = (address: string) => {
    return address.replace("0x", "").toLowerCase()
  }

  const isApprovalRequired = async (asset: Models.Carbon.Coin.Token, amount: BigNumber) => {
    return !isNativeAsset(asset)
  }

  /**
    * Bridge the asset from Ethereum chain
    * returns the txn hash if bridge txn is successful, otherwise return null
    * @param asset         details of the asset being bridged; retrieved from carbon
    */
  async function bridgeAssetFromEth(asset: Models.Carbon.Coin.Token) {
    if (!fromToken || !sdk || !bridgeFormState.sourceAddress || !bridgeFormState.destAddress || (!withdrawFee?.amount && network === Network.MainNet)) {
      return
    }

    const ethClient: ETHClient = getETHClient(sdk, fromBlockchain, netZilToCarbon(network))

    const bridgeEntranceAddr = ethClient.getConfig().bridgeEntranceAddr

    const ethersProvider = new ethers.providers.Web3Provider(ethWallet?.provider)
    const signer: ethers.Signer = ethersProvider.getSigner()

    const amount = bridgeFormState.transferAmount
    const ethAddress = await signer.getAddress()
    const gasPrice = await ethClient.getProvider().getGasPrice()
    const gasPriceGwei = new BigNumber(ethers.utils.formatUnits(gasPrice, "gwei"))
    const depositAmt = amount.shiftedBy(asset.decimals.toInt())

    // approve token
    const approvalRequired = await isApprovalRequired(asset, depositAmt)
    if (approvalRequired) {
      const allowance = await ethClient.checkAllowanceERC20(asset, ethAddress, bridgeEntranceAddr)
      if (allowance.lt(depositAmt)) {
        toaster(`Approval needed (${fromBlockchain.toUpperCase()})`, { overridePersist: false })
        const approve_tx = await ethClient.approveERC20({
          token: asset,
          ethAddress,
          gasLimit: new BigNumber(100000),
          gasPriceGwei: gasPriceGwei,
          signer: signer,
          spenderAddress: ethClient.getBridgeEntranceAddr(),
        })

        logger("approve tx", approve_tx.hash)
        toaster(`Submitted: (${fromBlockchain.toUpperCase()} - ERC20 Approval)`, { hash: approve_tx.hash!.replace(/^0x/i, ""), sourceBlockchain: fromBlockchain })
        setApprovalHash(approve_tx.hash!)
        const txReceipt = await ethClient.getProvider().waitForTransaction(approve_tx.hash!)

        // token approval success
        if (approve_tx !== undefined && txReceipt?.status === 1) {
          setTokenApproval(true)
        } else {
          setTokenApproval(false)
        }
      }
    } else {
      setTokenApproval(true)
    }

    toaster(`Bridging asset (${fromBlockchain.toUpperCase()})`, { overridePersist: false })

    const toToken = Object.values(sdk.token.tokens).find(token => token.denom === bridgeToken?.chains[toBlockchain])


    if (!toToken) {
      toaster("Selected token is not available on Zilliqa")
      return
    }


    const bridgeDepositParams: BridgeParams = {
      fromToken: asset,
      toToken,
      amount: depositAmt,
      fromAddress: ethAddress,
      recoveryAddress: getRecoveryAddress(sdk.network),
      toAddress: bridgeFormState.destAddress,
      feeAmount: network === Network.MainNet ? withdrawFee!.amount.shiftedBy(toToken.decimals.toNumber()) : BN_ZERO,
      gasPriceGwei,
      gasLimit: new BigNumber(getEvmGasLimit(fromBlockchain)),
      signer,
    }

    const bridge_tx = await ethClient.bridgeTokens(bridgeDepositParams)
    //TOCHECK: remove is unnecessary
    if (!bridge_tx) {
      return
    }

    logger("bridge deposit params: %o\n", bridgeDepositParams)
    toaster(`Submitted: (${fromBlockchain.toUpperCase()} - Bridge Asset)`, { sourceBlockchain: fromBlockchain, hash: bridge_tx.hash!.replace(/^0x/i, "") })
    logger("bridge tx", bridge_tx.hash!)

    return bridge_tx.hash
  }

  /**
    * Bridge the asset from Zilliqa chain
    * returns the txn hash if bridge txn is successful, otherwise return null
    * @param asset         details of the asset being bridged; retrieved from carbon
    */
  async function bridgeAssetFromZil(asset: Models.Carbon.Coin.Token, carbonMnemonics: string) {
    if (!fromToken || !sdk || !bridgeFormState.sourceAddress || !bridgeFormState.destAddress || (!withdrawFee?.amount && network === Network.MainNet)) {
      return
    }

    if (wallet === null) {
      console.error("Zilliqa wallet not connected")
      return null
    }
    if (!sdk) {
      console.error("CarbonSDK not initialized")
      return null
    }

    const lockProxy = sdk.networkConfig.zil.bridgeEntranceAddr
    const amount = bridgeFormState.transferAmount
    const zilAddress = santizedAddress(wallet.addressInfo.byte20)
    const depositAmt = amount.shiftedBy(asset.decimals.toInt())

    if (!isNativeAsset(asset)) {
      // not native zils
      // user is transferring zrc2 tokens
      // need approval
      const allowance = await sdk.zil.checkAllowanceZRC2(asset, `0x${zilAddress}`, lockProxy)
      logger("zil zrc2 allowance: ", allowance.toNumber())

      if (allowance.lt(depositAmt)) {
        const approveZRC2Params = {
          token: asset,
          gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
          gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
          zilAddress: zilAddress,
          signer: wallet.provider! as any,
          spenderAddress: lockProxy
        }
        logger("approve zrc2 token parameters: ", approveZRC2Params)
        toaster(`Approval needed (Zilliqa)`, { overridePersist: false })

        const approve_tx = await sdk.zil.approveZRC2(approveZRC2Params)
        toaster(`Submitted: (Zilliqa - ZRC2 Approval)`, { hash: approve_tx.id! })
        setApprovalHash(approve_tx.id!)

        const toAddr = toBech32Address(approve_tx.txParams.toAddr)
        const emptyTx = new Transaction({ ...approve_tx.txParams, toAddr: toAddr }, new HTTPProvider(sdk.zil.getProviderUrl()))
        const confirmedTxn = await emptyTx.confirm(approve_tx.id!)
        logger("transaction confirmed! receipt is: ", confirmedTxn.getReceipt())

        // token approval success
        if (confirmedTxn !== undefined && confirmedTxn.getReceipt()?.success) {
          setTokenApproval(true)
        } else {
          toaster("Approval not successful. Please try again.")
          return null
        }
      } else {
        // approved before
        setTokenApproval(true)
      }
    }

    const toToken = Object.values(sdk.token.tokens).find(token => token.denom === bridgeToken?.chains[toBlockchain])

    if (!toToken) {
      toaster("Selected token is not available on Ethereum")
      return null
    }

    const bridgeDepositParams: ZilBridgeParams = {
      fromToken: asset,
      toToken,
      amount: depositAmt,
      fromAddress: wallet.addressInfo.bech32,
      recoveryAddress: getRecoveryAddress(sdk.network),
      toAddress: bridgeFormState.destAddress,
      feeAmount: network === Network.MainNet ? withdrawFee!.amount.shiftedBy(toToken.decimals.toNumber()) : BN_ZERO,
      gasPrice: new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`),
      gasLimit: new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`),
      signer: wallet.provider! as any,
    }

    logger("bridge deposit params: %o\n", bridgeDepositParams)
    toaster(`Bridging asset (Zilliqa)`, { overridePersist: false })
    const bridge_tx = await sdk.zil.bridgeTokens(bridgeDepositParams)

    toaster(`Submitted: (Zilliqa - Bridge Asset)`, { hash: bridge_tx.id! })
    logger("bridge tx", bridge_tx.id!)

    return bridge_tx.id
  }

  const onConfirm = async () => {
    if (!localStorage) {
      console.error("localStorage not available")
      return null
    }

    if (!sdk) {
      console.error("CarbonSDK not initialized")
      return null
    }

    const asset = Object.values(sdk.token.tokens).find(token => token.denom === bridgeToken?.denom)

    if (!asset) {
      console.error("asset not found for", bridgeToken)
      return null
    }

    if (!swthAddrMnemonic) {
      console.error("carbon mnemonic not initialized")
      return null
    }

    if (!withdrawFee && network === Network.MainNet) {
      toaster("Transfer fee not loaded", { overridePersist: false })
      return null
    }

    if (withdrawFee?.amount.gte(bridgeFormState.transferAmount)) {
      toaster("Transfer amount too low", { overridePersist: false })
      return null
    }

    runConfirmTransfer(async () => {
      let sourceTxHash
      if (fromBlockchain === Blockchain.Zilliqa) {
        // init lock on zil side
        sourceTxHash = await bridgeAssetFromZil(asset, swthAddrMnemonic)
      } else {
        // init lock on eth side
        sourceTxHash = await bridgeAssetFromEth(asset)
      }

      if (sourceTxHash === null) {
        console.error("source txn hash is null!")
        return null
      }

      const { destAddress, sourceAddress } = bridgeFormState
      if (!destAddress || !sourceAddress || !bridgeToken || !fromToken) return

      const bridgeTx: BridgeTx = {
        dstAddr: destAddress,
        srcAddr: sourceAddress,
        dstChain: toBlockchain,
        srcChain: fromBlockchain,
        network: network,
        srcTokenId: bridgeToken.tokenId,
        dstToken: destToken?.denom ?? "",
        dstTokenId: destToken?.tokenId ?? "",
        srcToken: bridgeToken.denom,
        sourceTxHash: sourceTxHash,
        inputAmount: bridgeFormState.transferAmount,
        interimAddrMnemonics: swthAddrMnemonic!,
        withdrawFee: withdrawFee?.amount ?? BIG_ONE.shiftedBy(3 - fromToken.decimals), // 1000 sat bypass withdraw fee check,
        depositDispatchedAt: dayjs(),
      }
      dispatch(actions.Bridge.addBridgeTx([bridgeTx]))

      addNavigationHook(history)
    })
  }

  const conductAnotherTransfer = () => {
    if (pendingBridgeTx)
      dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx))
    setSwthAddrMnemonic(AddressUtils.SWTHAddress.newMnemonic())
    dispatch(actions.Layout.showTransferConfirmation(false))
  }

  const navigateBack = () => {
    if (pendingBridgeTx)
      dispatch(actions.Bridge.dismissBridgeTx(pendingBridgeTx))
    dispatch(actions.Layout.showTransferConfirmation(false))
    setSwthAddrMnemonic(AddressUtils.SWTHAddress.newMnemonic())
  }

  const formatAddress = (address: string | undefined | null, chain: Blockchain) => {
    if (!address) return ""
    switch (chain) {
      case Blockchain.Zilliqa:
        return truncateAddress(address)
      default:
        return truncate(address, 5, 4)
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
          <Tooltip title={bridgeFormState.transferAmount.toString()}>
            <Box className={classes.transferBox}>
              <Text>Transferring</Text>
              <Text variant="h2" className={classes.amount}>
                {trimValue(bridgeFormState.transferAmount.toString(10))}
                <CurrencyLogo className={classes.token} currency={fromToken?.symbol} address={fromToken?.address} blockchain={fromToken?.blockchain} />
                {fromToken?.symbol}
              </Text>
            </Box>
          </Tooltip>

          <Box mt={2} display="flex" justifyContent="space-between" position="relative">
            <Box className={classes.networkBox} flex={1}>
              <Text variant="h4" color="textSecondary">From</Text>
              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                <ChainLogo chain={bridgeState.formState.fromBlockchain} />
              </Box>
              <Text variant="h4" className={classes.chainName}>{fromChainName} Network</Text>
              <Text variant="button" className={classes.walletAddress}>{formatAddress(bridgeState.formState.sourceAddress, fromBlockchain)}</Text>
            </Box>
            <Box flex={0.2} />
            <WavyLine className={classes.wavyLine} />
            <Box className={classes.networkBox} flex={1}>
              <Text variant="h4" color="textSecondary">To</Text>
              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                <ChainLogo chain={bridgeState.formState.toBlockchain} />
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
          <KeyValueDisplay kkey={<span>&nbsp; • &nbsp;{toChainName} Txn Fee</span>} mb="8px">
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
          disabled={BRIDGE_DISABLED || loadingConfirm || !!pendingBridgeTx}
          onClick={onConfirm}
          variant="contained"
          color="primary"
          className={classes.actionButton}>
          {loadingConfirm &&
            <CircularProgress size={20} className={classes.progress} />
          }
          {bridgeState.formState.fromBlockchain === Blockchain.Zilliqa
            ? `Confirm (ZIL -> ${bridgeState.formState.toBlockchain.toUpperCase()})`
            : `Confirm (${bridgeState.formState.fromBlockchain.toUpperCase()} -> ZIL)`
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

export default ConfirmTransfer
