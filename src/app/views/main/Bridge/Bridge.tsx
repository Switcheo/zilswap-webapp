import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Tooltip, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import BigNumber from 'bignumber.js';
import cls from "classnames";
import { ethers } from "ethers";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from "react-router-dom";
import { Blockchain, Models, CarbonSDK } from "carbon-js-sdk";
import Web3Modal from 'web3modal';
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ConnectedWallet } from "core/wallet";
import { providerOptions } from "core/ethereum";
import { ConfirmTransfer, ConnectETHPopper, CurrencyInput, Text } from 'app/components';
import FailedBridgeTxWarning from "app/components/FailedBridgeTxWarning";
import NetworkSwitchDialog from "app/components/NetworkSwitchDialog";
import BridgeCard from "app/layouts/BridgeCard";
import { actions } from "app/store";
import { BridgeFormState, BridgeState } from 'app/store/bridge/types';
import { LayoutState, RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, hexToRGBA, netZilToCarbon, useAsyncTask, useNetwork, useTokenFinder } from "app/utils";
import { BIG_ZERO, BRIDGE_DISABLED } from "app/utils/constants";
import { ReactComponent as WarningIcon } from "app/views/ark/NftView/components/assets/warning.svg";
import { ConnectButton } from "./components";
import { BridgeParamConstants } from "./components/constants";
import { ReactComponent as EthereumLogo } from "./ethereum-logo.svg";
import { ReactComponent as WavyLine } from "./wavy-line.svg";
import { ReactComponent as ZilliqaLogo } from "./zilliqa-logo.svg";

const initialFormState = {
  sourceAddress: '',
  destAddress: '',
  transferAmount: '0',
}

const CHAIN_NAMES: any = {
  zil: Blockchain.Zilliqa,
  eth: Blockchain.Ethereum,
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const tokenFinder = useTokenFinder();
  const history = useHistory();
  const location = useLocation();
  const [ethConnectedAddress, setEthConnectedAddress] = useState('');
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet); // zil wallet
  const bridgeWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets[Blockchain.Ethereum]); // eth wallet
  const bridgeState = useSelector<RootState, BridgeState>(store => store.bridge);
  const bridgeFormState: BridgeFormState = useSelector<RootState, BridgeFormState>(store => store.bridge.formState);
  const [formState, setFormState] = useState<typeof initialFormState>({
    sourceAddress: bridgeFormState.sourceAddress || "",
    destAddress: bridgeFormState.destAddress || "",
    transferAmount: bridgeFormState.transferAmount.toString() || "0"
  });
  const layoutState = useSelector<RootState, LayoutState>(store => store.layout);
  const [sdk, setSdk] = useState<CarbonSDK | null>(null);
  const [runInitCarbonSDK] = useAsyncTask("initCarbonSDK");
  const [runLoadGasPrice] = useAsyncTask("loadGasPrice");
  const [disconnectMenu, setDisconnectMenu] = useState<any>();
  const [gasPrice, setGasPrice] = useState<BigNumber | undefined>();
  const disconnectSrcButtonRef = useRef();
  const disconnectDestButtonRef = useRef();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  const queryParams = new URLSearchParams(location.search);

  const tokenList: 'bridge-zil' | 'bridge-eth' = bridgeFormState.fromBlockchain === Blockchain.Zilliqa ? 'bridge-zil' : 'bridge-eth';

  const { token: bridgeToken, fromBlockchain, toBlockchain } = bridgeFormState;

  // update state from param
  useEffect(() => {
    let queryTokenAddress = queryParams.get("token");

    if (!queryTokenAddress || !bridgeState.tokens) return;

    let queryToken;

    if (queryTokenAddress.startsWith("zil")) {
      try {
        queryTokenAddress = fromBech32Address(queryTokenAddress).toLowerCase();
      } catch {
        return;
      }
    }
    queryTokenAddress = queryTokenAddress.replace(/^0x/, '');

    bridgeState.tokens[fromBlockchain].forEach(token => {
      if (token.tokenAddress === queryTokenAddress) {
        queryToken = token;
        return;
      } else if (token.toTokenAddress === queryTokenAddress) {
        queryToken = bridgeState.tokens[toBlockchain].find(token => token.tokenAddress === queryTokenAddress);
        swapBridgeChains();
        return;
      }
    })

    if (queryToken) {
      dispatch(actions.Bridge.updateForm({
        token: queryToken
      }));
    }

    // eslint-disable-next-line
  }, [bridgeState.tokens]);

  // update param from state
  useEffect(() => {
    if (!bridgeToken) {
      return;
    }

    let tokenAddress = "0x" + bridgeToken.tokenAddress;

    if (fromBlockchain === Blockchain.Zilliqa) {
      tokenAddress = toBech32Address(tokenAddress).toLowerCase();
    }

    queryParams.set("token", tokenAddress);
    history.replace({ search: queryParams.toString() });

    // eslint-disable-next-line
  }, [bridgeToken]);

  // redirect to transfer history on mobile
  useEffect(() => {
    if (isMobile) {
      history.push("/history");
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (gasPrice?.gt(0) || !sdk) return;

    runLoadGasPrice(async () => {
      const gasPrice = await sdk?.eth.getProvider().getGasPrice();
      setGasPrice(new BigNumber(gasPrice.toString()));
    })

    // eslint-disable-next-line
  }, [sdk, gasPrice]);

  useEffect(() => {
    runInitCarbonSDK(async () => {
      const carbonNetwork = netZilToCarbon(network)
      const sdk = await CarbonSDK.instance({ network: carbonNetwork });
      await sdk.token.reloadTokens();
      setSdk(sdk);
    })

    // eslint-disable-next-line
  }, [network]);

  const { fromToken } = useMemo(() => {
    if (!bridgeToken) return {};
    return {
      fromToken: tokenFinder(bridgeToken.tokenAddress, bridgeToken.blockchain),
      toToken: tokenFinder(bridgeToken.toTokenAddress, bridgeToken.toBlockchain),
    }
  }, [tokenFinder, bridgeToken])

  useEffect(() => {
    const bridgeTx = bridgeState.activeBridgeTx;

    if (bridgeTx) {
      if (!layoutState.showTransferConfirmation) {
        dispatch(actions.Layout.showTransferConfirmation());
      }

      const bridgeTokens = bridgeState.tokens[bridgeTx.srcChain as Blockchain.Ethereum | Blockchain.Zilliqa];
      const bridgeToken = bridgeTokens.find(token => token.denom === bridgeTx.srcToken);

      dispatch(actions.Bridge.updateForm({
        destAddress: bridgeTx.dstAddr,
        sourceAddress: bridgeTx.srcAddr,
        fromBlockchain: bridgeTx.srcChain,
        toBlockchain: bridgeTx.dstChain,
        forNetwork: network,
        token: bridgeToken,
      }))
    }
  }, [bridgeState.activeBridgeTx, bridgeState.tokens, layoutState, network, dispatch])

  useEffect(() => {
    if (wallet !== null) {
      if (bridgeFormState.fromBlockchain === Blockchain.Zilliqa) {
        setSourceAddress(wallet.addressInfo.byte20!)
      } else {
        setDestAddress(wallet.addressInfo.byte20!)
      }
    } else {
      if (bridgeFormState.fromBlockchain === Blockchain.Zilliqa) {
        setSourceAddress('')
      } else {
        setDestAddress('')
      }
    }

    // eslint-disable-next-line
  }, [wallet, bridgeFormState.fromBlockchain])

  const setSourceAddress = (address: string) => {

    setFormState(prevState => ({
      ...prevState,
      sourceAddress: address
    }))
    dispatch(actions.Bridge.updateForm({
      sourceAddress: address
    }))
  }

  const setDestAddress = (address: string) => {
    setFormState(prevState => ({
      ...prevState,
      destAddress: address
    }))
    dispatch(actions.Bridge.updateForm({
      destAddress: address
    }))
  }

  const onFromBlockchainChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    if (e.target.value === Blockchain.Zilliqa) {
      setSourceAddress(wallet?.addressInfo.byte20!)
      setDestAddress(ethConnectedAddress)

      dispatch(actions.Bridge.updateForm({
        fromBlockchain: Blockchain.Zilliqa,
        toBlockchain: Blockchain.Ethereum,
      }))
    } else {
      setSourceAddress(ethConnectedAddress)
      setDestAddress(wallet?.addressInfo.byte20!)

      dispatch(actions.Bridge.updateForm({
        fromBlockchain: Blockchain.Ethereum,
        toBlockchain: Blockchain.Zilliqa,
      }))
    }
  }

  const onToBlockchainChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    if (e.target.value === Blockchain.Zilliqa) {
      setDestAddress(wallet?.addressInfo.byte20!)
      setSourceAddress(ethConnectedAddress)

      dispatch(actions.Bridge.updateForm({
        fromBlockchain: Blockchain.Ethereum,
        toBlockchain: Blockchain.Zilliqa,
      }))
    } else {
      setDestAddress(ethConnectedAddress)
      setSourceAddress(wallet?.addressInfo.byte20!)

      dispatch(actions.Bridge.updateForm({
        fromBlockchain: Blockchain.Zilliqa,
        toBlockchain: Blockchain.Ethereum,
      }))
    }
  }

  const onClickConnectETH = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      network: network === Network.MainNet ? 'mainnet' : 'goerli',
      providerOptions
    });

    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider)
    const signer = ethersProvider.getSigner();
    const ethAddress = await signer.getAddress();
    const chainId = (await ethersProvider.getNetwork()).chainId;

    if (bridgeFormState.fromBlockchain === Blockchain.Ethereum) {
      setSourceAddress(ethAddress);
    }

    if (bridgeFormState.toBlockchain === Blockchain.Ethereum) {
      setDestAddress(ethAddress);
    }

    setEthConnectedAddress(ethAddress);

    dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: { provider: provider, address: ethAddress, chainId: chainId } }));
    dispatch(actions.Token.refetchState());
  };

  const onClickConnectZIL = () => {
    dispatch(actions.Layout.toggleShowWallet());

    if (wallet !== null && bridgeFormState.fromBlockchain === Blockchain.Zilliqa) {
      setSourceAddress(wallet.addressInfo.byte20);
    }

    if (wallet !== null && bridgeFormState.toBlockchain === Blockchain.Zilliqa) {
      setDestAddress(wallet.addressInfo.byte20);
    }
  };

  const onTransferAmountChange = (rawAmount: string = "0") => {
    let transferAmount = new BigNumber(rawAmount).decimalPlaces(fromToken?.decimals ?? 0);
    if (transferAmount.isNaN() || transferAmount.isNegative() || !transferAmount.isFinite()) transferAmount = BIG_ZERO;

    setFormState({
      ...formState,
      transferAmount: rawAmount,
    })

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      transferAmount,
    }));
  }

  const onEndEditTransferAmount = () => {
    setFormState({
      ...formState,
      transferAmount: bridgeFormState.transferAmount.toString(10),
    })
  };

  const onCurrencyChange = (token: TokenInfo) => {
    let tokenAddress: string | undefined;
    if (fromBlockchain === Blockchain.Ethereum) {
      tokenAddress = token.address.toLowerCase();
    } else {
      tokenAddress = fromBech32Address(token.address).toLowerCase();
    }
    tokenAddress = tokenAddress.replace(/^0x/, '');

    const bridgeToken = bridgeState.tokens[fromBlockchain].find(bridgeToken => bridgeToken.tokenAddress === tokenAddress);

    if (bridgeFormState.token && bridgeFormState.token === bridgeToken) return;

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      token: bridgeToken
    }));
  };

  const swapBridgeChains = () => {
    const isZilToEth = fromBlockchain === Blockchain.Zilliqa;
    setFormState({
      ...formState,
      destAddress: formState.sourceAddress,
      sourceAddress: formState.destAddress,
    })

    dispatch(actions.Bridge.updateForm({
      fromBlockchain: isZilToEth ? Blockchain.Ethereum : Blockchain.Zilliqa,
      toBlockchain: isZilToEth ? Blockchain.Zilliqa : Blockchain.Ethereum,

      sourceAddress: formState.destAddress,
      destAddress: formState.sourceAddress,

      token: undefined,
    }))

    // clear query param
    history.replace({ search: "" });
  };

  const showTransfer = () => {
    if (!(
      (Number(bridgeWallet?.chainId) === 1 && wallet?.network === Network.MainNet) ||
      (Number(bridgeWallet?.chainId) === 5 && wallet?.network === Network.TestNet)
    )) {
      dispatch(actions.Layout.toggleShowNetworkSwitch("open"))
      return
    }

    dispatch(actions.Layout.showTransferConfirmation(!layoutState.showTransferConfirmation))
  }

  const onConnectSrcWallet = () => {
    if (fromBlockchain === Blockchain.Zilliqa) {
      return onClickConnectZIL();
    } else {
      // if connected, open menu
      if (bridgeFormState.sourceAddress && bridgeWallet) {
        setDisconnectMenu(disconnectSrcButtonRef)
      } else {
        return onClickConnectETH();
      }
    }
  };

  const onConnectDstWallet = () => {
    if (toBlockchain === Blockchain.Zilliqa) {
      return onClickConnectZIL();
    } else {
      // if connected, open menu
      if (bridgeFormState.sourceAddress && bridgeWallet) {
        setDisconnectMenu(disconnectDestButtonRef)
      } else {
        return onClickConnectETH();
      }
    }
  };

  const onDisconnectEthWallet = (clear?: boolean) => {
    let disconnectForm = {};
    if (toBlockchain === Blockchain.Zilliqa) {
      disconnectForm = {
        sourceAddress: undefined,
        token: undefined,
      }
    } else {
      disconnectForm = {
        destAddress: undefined,
        token: undefined,
      }
    }
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      disableInjectedProvider: false,
      network: "goerli",
      providerOptions
    });
    if (clear) {
      web3Modal.clearCachedProvider();
    }
    setDisconnectMenu(null)
    dispatch(actions.Bridge.updateForm(disconnectForm));
    dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: null }));
  }

  const isSubmitEnabled = useMemo(() => {
    if (!formState.sourceAddress || !formState.destAddress)
      return false;
    if (bridgeFormState.transferAmount.isZero())
      return false;
    if (!fromToken)
      return false
    if (fromToken && bridgeFormState.transferAmount.isGreaterThan(bnOrZero(fromToken.balance).shiftedBy(-fromToken.decimals)))
      return false;
    if (isMobile)
      return false;

    return true
  }, [formState, bridgeFormState.transferAmount, fromToken, isMobile])

  // returns true if asset is native coin, false otherwise
  const isNativeAsset = (asset: Models.Token) => {
    const zeroAddress = "0000000000000000000000000000000000000000";
    return (asset.tokenAddress === zeroAddress)
  }

  const adjustedForGas = (balance: BigNumber, blockchain: Blockchain) => {
    if (blockchain === Blockchain.Zilliqa) {
      const gasPrice = new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`);
      const gasLimit = new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`);

      return balance.minus(gasPrice.multipliedBy(gasLimit));
    } else {
      const gasPriceGwei = new BigNumber(ethers.utils.formatUnits((gasPrice ?? new BigNumber(65)).toString(10), "gwei"));
      const gasLimit = new BigNumber(`${BridgeParamConstants.ETH_GAS_LIMIT}`);

      return balance.minus(gasPriceGwei.multipliedBy(gasLimit));
    }
  }

  const onSelectMax = async () => {
    if (!fromToken || !sdk) return;

    let balance = bnOrZero(fromToken.balance);
    const asset = sdk.token.tokens[bridgeToken?.denom ?? ""];

    if (!asset) return;

    // Check if gas fees need to be deducted
    if (isNativeAsset(asset) && CHAIN_NAMES[fromToken.blockchain] === fromBlockchain) {
      balance = adjustedForGas(balance, fromToken.blockchain);
    }

    setFormState({
      ...formState,
      transferAmount: balance.decimalPlaces(0).shiftedBy(-fromToken.decimals).toString(),
    })

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      transferAmount: balance.decimalPlaces(0).shiftedBy(-fromToken.decimals),
    }))
  }

  const onEnterKeyPress = () => {
    if (isSubmitEnabled) {
      showTransfer();
    }
  }

  return (
    <BridgeCard {...rest} className={cls(classes.root, className)}>
      {!layoutState.showTransferConfirmation && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Text variant="h2" align="center" marginTop={2}>
            Zil<span className={classes.textColoured}>Bridge</span>
          </Text>
          <Text margin={1} align="center" color="textSecondary" className={classes.textSpacing}>
            <Tooltip placement="bottom" arrow title="TradeHub has been renamed Carbon!">
              <span>
                Powered by
                {" "}
                <a href="https://carbon.network" target="_blank" rel="noreferrer">Carbon</a>
              </span>
            </Tooltip>
          </Text>

          {BRIDGE_DISABLED && (
            <Box className={classes.errorBox}>
              <WarningIcon className={classes.warningIcon} />
              <Text>
                ZilBridge is disabled temporarily due to The Merge. The bridge will resume shortly after upgrade.
                Follow us on <a href="https://twitter.com/ZilSwap" target="_blank" rel="noreferrer">twitter</a> for updates.
              </Text>
            </Box>
          )}

          <Box mt={2} mb={2} display="flex" justifyContent="space-between" position="relative">
            <Box className={classes.box} bgcolor="background.contrast">
              <Text variant="h4" align="center">From</Text>
              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                {fromBlockchain === Blockchain.Ethereum
                  ? <EthereumLogo />
                  : <ZilliqaLogo />
                }
              </Box>
              <Box display="flex" justifyContent="center">
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    MenuProps={{ classes: { paper: classes.selectMenu } }}
                    value={fromBlockchain}
                    onChange={onFromBlockchainChange}
                    label=""
                  >
                    <MenuItem value={Blockchain.Zilliqa}>Zilliqa</MenuItem>
                    <MenuItem value={Blockchain.Ethereum}>Ethereum</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <ConnectButton
                className={classes.connectButton}
                buttonRef={disconnectSrcButtonRef}
                chain={fromBlockchain}
                address={bridgeFormState.sourceAddress || ''}
                onClick={onConnectSrcWallet}
              />
            </Box>
            <Box flex={0.3} />
            <WavyLine className={classes.wavyLine} onClick={swapBridgeChains} />
            <Box className={classes.box} bgcolor="background.contrast">

              <Text variant="h4" align="center">To</Text>

              <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
                {toBlockchain === Blockchain.Zilliqa
                  ? <ZilliqaLogo />
                  : <EthereumLogo />
                }
              </Box>
              <Box display="flex" justifyContent="center">
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    MenuProps={{ classes: { paper: classes.selectMenu } }}
                    value={toBlockchain}
                    onChange={onToBlockchainChange}
                    label=""
                  >
                    <MenuItem value={Blockchain.Ethereum}>Ethereum</MenuItem>
                    <MenuItem value={Blockchain.Zilliqa}>Zilliqa</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ConnectButton
                className={classes.connectButton}
                buttonRef={disconnectDestButtonRef}
                chain={toBlockchain}
                address={bridgeFormState.destAddress || ''}
                onClick={onConnectDstWallet}
              />
            </Box>
          </Box>

          <CurrencyInput
            label="Transfer Amount"
            disabled={!bridgeFormState.sourceAddress || !bridgeFormState.destAddress}
            token={fromToken ?? null}
            amount={formState.transferAmount}
            onEditorBlur={onEndEditTransferAmount}
            onAmountChange={onTransferAmountChange}
            onCurrencyChange={onCurrencyChange}
            tokenList={tokenList}
            onSelectMax={onSelectMax}
            showMaxButton={true}
            onEnterKeyPress={onEnterKeyPress}
          />

          <Button
            onClick={showTransfer}
            disabled={!isSubmitEnabled}
            className={classes.actionButton}
            color="primary"
            variant="contained">
            {!(formState.sourceAddress && formState.destAddress)
              ? "Connect Wallet"
              : bridgeFormState.transferAmount.isZero()
                ? "Enter Amount"
                : !fromToken
                  ? "Select Token"
                  : "Head to Confirmation"
            }
          </Button>
        </Box>
      )}
      <NetworkSwitchDialog />
      <FailedBridgeTxWarning />
      <ConfirmTransfer showTransfer={layoutState.showTransferConfirmation} />
      <ConnectETHPopper
        open={!!disconnectMenu}
        anchorEl={disconnectMenu?.current}
        className={classes.priority}
        onChangeWallet={() => { onDisconnectEthWallet(true); onClickConnectETH() }}
        onDisconnectEth={() => onDisconnectEthWallet()}
        onClickaway={() => setDisconnectMenu(undefined)}
      >
      </ConnectETHPopper>

    </BridgeCard >
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    maxWidth: 488,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
      padding: theme.spacing(2, 2, 0),
    },
    padding: theme.spacing(4, 4, 0),
    marginBottom: 12
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  connectButton: {
    marginTop: theme.spacing(1),
  },
  connectedWalletButton: {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`,
    "&:hover": {
      backgroundColor: theme.palette.label
    }
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  textSpacing: {
    letterSpacing: "0.5px"
  },
  box: {
    display: "flex",
    flex: "1 1 0",
    flexDirection: "column",
    border: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "#D2E5DF"}`,
    borderRadius: 12,
    padding: theme.spacing(2, 1)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    display: "contents",
    "& .MuiSelect-select:focus": {
      backgroundColor: "transparent"
    },
    "& .MuiSelect-root": {
      borderRadius: 12,
      "&:hover": {
        backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
      }
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      fontWeight: "bold",
      fontSize: "16px"
    },
    "& .MuiSelect-icon": {
      top: "calc(50% - 14px)",
      fill: theme.palette.label
    },
    "& .MuiSelect-selectMenu": {
      minHeight: 0
    },
  },
  selectMenu: {
    backgroundColor: theme.palette.background.default,
    "& .MuiListItem-root": {
      borderRadius: "12px",
      padding: theme.spacing(1.5),
      justifyContent: "center",
    },
    "& .MuiListItem-root.Mui-focusVisible": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
    },
    "& .MuiListItem-root.Mui-selected": {
      backgroundColor: theme.palette.label,
      color: theme.palette.primary.contrastText,
    },
    "& .MuiList-padding": {
      padding: "2px"
    }
  },
  wavyLine: {
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-80px",
    marginTop: "-80px",
    width: "160px",
    [theme.breakpoints.down("xs")]: {
      width: "110px",
      marginLeft: "-55px",
    },
  },
  closeIcon: {
    float: "right",
    right: 0,
    position: "absolute",
    padding: 5,
  },
  priority: {
    zIndex: 10,
  },
  extraPadding: {
    padding: theme.spacing(1)
  },
  warningText: {
    color: theme.palette.warning.main,
  },
  warningIcon: {
    height: 24,
    width: 24,
    flex: "none",
    color: theme.palette.warning.main,
    marginRight: theme.spacing(1),
    "& path": {
      stroke: theme.palette.warning.main,
    },
  },
  errorBox: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: `rgba${hexToRGBA(theme.palette.warning.light!, 0.2)}`,
    borderRadius: 12,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& .MuiTypography-root": {
      color: theme.palette.warning.main,
      fontSize: "14px",
      lineHeight: "17px",
      [theme.breakpoints.down("xs")]: {
        fontSize: "12px",
        lineHeight: "14px",
      }
    }
  },
}))

export default BridgeView
