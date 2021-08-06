import { Box, Button, FormControl, MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { ConfirmTransfer, CurrencyInput, Text } from 'app/components';
import FailedBridgeTxWarning from "app/components/FailedBridgeTxWarning";
import NetworkSwitchDialog from "app/components/NetworkSwitchDialog";
import BridgeCard from "app/layouts/BridgeCard";
import { actions } from "app/store";
import { BridgeFormState, BridgeState } from 'app/store/bridge/types';
import { LayoutState, RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, strings, useAsyncTask, useNetwork, useTokenFinder } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import BigNumber from 'bignumber.js';
import cls from "classnames";
import { providerOptions } from "core/ethereum";
import { ConnectedWallet } from "core/wallet";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ethers } from "ethers";
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Blockchain, RestModels, TradeHubSDK } from "tradehub-api-js";
import Web3Modal from 'web3modal';
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectButton } from "./components";
import { BridgeParamConstants } from "./components/constants";
import { ReactComponent as EthereumLogo } from "./ethereum-logo.svg";
import { ReactComponent as WavyLine } from "./wavy-line.svg";
import { ReactComponent as ZilliqaLogo } from "./zilliqa-logo.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    maxWidth: 488,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
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
  connectWalletButton: {
    marginTop: theme.spacing(2),
    height: 46,
  },
  connectedWalletButton: {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`,
    "&:hover": {
      backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.2)}`
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
    padding: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    display: "contents",
    "& .MuiSelect-select:focus": {
      borderRadius: 12
    },
    "& .MuiOutlinedInput-root": {
      border: "none"
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
    }
  },
  selectMenu: {
    backgroundColor: theme.palette.background.default,
    "& .MuiListItem-root": {
      borderRadius: "12px",
      padding: theme.spacing(1.5),
      justifyContent: "center"
    },
    "& .MuiListItem-root.Mui-focusVisible": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.08)}` : "rgba(0, 0, 0, 0.04)",
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
  }
}))

const initialFormState = {
  sourceAddress: '',
  destAddress: '',
  transferAmount: '0',
}

const CHAIN_NAMES : any = {
  zil: Blockchain.Zilliqa,
  eth: Blockchain.Ethereum,
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const tokenFinder = useTokenFinder();
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
  const [sdk, setSdk] = useState<TradeHubSDK | null>(null);
  const [runInitTradeHubSDK] = useAsyncTask("initTradeHubSDK");

  useEffect(() => {
    runInitTradeHubSDK(async () => {
      const sdk = new TradeHubSDK({ network: TradeHubSDK.Network.DevNet });
      await sdk.token.reloadTokens();
      setSdk(sdk);
    })

    // eslint-disable-next-line
  }, []);

  const isCorrectChain = useMemo(() => {
    return network === Network.TestNet && Number(bridgeWallet?.chainId) === 3;
  }, [bridgeWallet, network]);

  const tokenList: 'bridge-zil' | 'bridge-eth' = bridgeFormState.fromBlockchain === Blockchain.Zilliqa ? 'bridge-zil' : 'bridge-eth';

  const { token: bridgeToken, fromBlockchain, toBlockchain } = bridgeFormState;

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
      cacheProvider: true,
      disableInjectedProvider: false,
      network: "ropsten",
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
    let transferAmount = new BigNumber(rawAmount);
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
  };

  const showTransfer = () => {
    dispatch(actions.Layout.showTransferConfirmation(!layoutState.showTransferConfirmation))
  }

  const onConnectSrcWallet = () => {
    if (fromBlockchain === Blockchain.Zilliqa) {
      return onClickConnectZIL();
    } else {
      return onClickConnectETH();
    }
  };

  const onConnectDstWallet = () => {
    if (toBlockchain === Blockchain.Zilliqa) {
      return onClickConnectZIL();
    } else {
      return onClickConnectETH();
    }
  };

  const isSubmitEnabled = useMemo(() => {
    if (!isCorrectChain || !formState.sourceAddress || !formState.destAddress)
      return false;
    if (bridgeFormState.transferAmount.isZero())
      return false;
    if (fromToken && bridgeFormState.transferAmount.isGreaterThan(strings.bnOrZero(fromToken.balance).shiftedBy(-fromToken.decimals)))
      return false;

    return true
  }, [isCorrectChain, formState, bridgeFormState.transferAmount, fromToken])

  // returns true if asset is native coin, false otherwise
  const isNativeAsset = (asset: RestModels.Token) => {
    const zeroAddress = "0000000000000000000000000000000000000000";
    return (asset.asset_id === zeroAddress)
  }

  const adjustedForGas = async (balance: BigNumber, blockchain: Blockchain, sdk: TradeHubSDK) => {
    if (blockchain === Blockchain.Zilliqa) {
      const gasPrice = new BigNumber(`${BridgeParamConstants.ZIL_GAS_PRICE}`);
      const gasLimit = new BigNumber(`${BridgeParamConstants.ZIL_GAS_LIMIT}`);

      return balance.minus(gasPrice.multipliedBy(gasLimit));
    } else {
      const gasPrice = await sdk.eth.getProvider().getGasPrice();
      const gasPriceGwei = new BigNumber(ethers.utils.formatUnits(gasPrice, "gwei"));
      const gasLimit = new BigNumber(`${BridgeParamConstants.ETH_GAS_LIMIT}`);

      return balance.minus(gasPriceGwei.multipliedBy(gasLimit));
    }
  }

  const onSelectMax = async () => {
    if (!fromToken || !sdk) return;

    let balance = strings.bnOrZero(fromToken.balance);
    const asset = sdk.token.tokens[bridgeToken?.denom ?? ""];

    if (!asset) return;

    // Check if gas fees need to be deducted
    if (isNativeAsset(asset) && CHAIN_NAMES[fromToken.blockchain] === fromBlockchain) {
      balance = await adjustedForGas(balance, fromToken.blockchain, sdk);
    } 

    setFormState({
      ...formState,
      transferAmount: balance.shiftedBy(-fromToken.decimals).toString(),
    })

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      transferAmount: balance.shiftedBy(-fromToken.decimals),
    }))
  }

  return (
    <BridgeCard {...rest} className={cls(classes.root, className)}>
      {!layoutState.showTransferConfirmation && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Text variant="h2" align="center" marginTop={2}>
            Zil<span className={classes.textColoured}>Bridge</span>
          </Text>
          <Text margin={1} align="center" color="textSecondary" className={classes.textSpacing}>Powered by Switcheo TradeHub</Text>
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
                chain={toBlockchain}
                address={bridgeFormState.destAddress || ''}
                onClick={onConnectDstWallet}
              />
            </Box>
          </Box>

          <CurrencyInput
            label="Transfer Amount"
            disabled={!formState.sourceAddress || !formState.destAddress}
            token={fromToken ?? null}
            amount={formState.transferAmount}
            onEditorBlur={onEndEditTransferAmount}
            onAmountChange={onTransferAmountChange}
            onCurrencyChange={onCurrencyChange}
            tokenList={tokenList}
            onSelectMax={onSelectMax}
            showMaxButton={true}
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
                : "Head to Confirmation"
            }
          </Button>
        </Box>
      )}
      <NetworkSwitchDialog />
      <FailedBridgeTxWarning />
      <ConfirmTransfer showTransfer={layoutState.showTransferConfirmation} />
    </BridgeCard>
  )
}

export default BridgeView
