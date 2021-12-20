import React, { useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import cls from "classnames";
import Web3Modal from 'web3modal';
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { Box, BoxProps, makeStyles, Typography } from "@material-ui/core";
import { Blockchain, SWTHAddress, } from "tradehub-api-js";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectETHPopper, CurrencyInput, FancyButton, Text } from 'app/components';
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useNetwork, useToaster } from "app/utils";
import { ERC20_TOKENSWAP_CONTRACT, LEGACY_ZIL_CONTRACT } from "app/utils/constants";
import { ConnectButton } from "app/views/main/Bridge/components";
import { providerOptions } from "core/ethereum";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ReactComponent as ArrowDown } from "./arrow-down.svg";
import { ReactComponent as SuccessSVG } from "./check.svg";
import { ReactComponent as SwapSVG } from "./swap.svg";
import tokenswapAbi from "./tokenswap-abi.json";
import legacyZilAbi from "./legacy-zil-abi.json";

interface Props extends BoxProps {
}

const BridgableZil = (props: Props) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const toaster = useToaster();
  const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets.eth);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<BigNumber>(new BigNumber(0));
  const [swthAddrMnemonic, setSwthAddrMnemonic] = useState<string | undefined>();
  // const [runInitTradeHubSDK] = useAsyncTask("initTradeHubSDK");
  const [runGetLegacyContract] = useAsyncTask("getLegacyContract");

  const [runSwapToken, isLoading] = useAsyncTask("swapToken");

  const [legacyContract, setLegacyContract] = useState<ethers.Contract | undefined>();
  const [legacyBalance, setLegacyBalance] = useState<BigNumber>(new BigNumber(0));
  const [legacyDecimal, setLegacyDecimal] = useState<number>(0);
  // eslint-disable-next-line
  const [pendingApproval, setPendingApproval] = useState(false);
  const [swappedTx, setSwappedTx] = useState<any>();
  const [disconnectMenu, setDisconnectMenu] = useState<any>();
  const connectButtonRef = useRef();

  useEffect(() => {
    if (!swthAddrMnemonic)
      setSwthAddrMnemonic(SWTHAddress.newMnemonic());
  }, [swthAddrMnemonic])

  // async function initTradehubSDK(mnemonic: string, network: Network) {
  //   let attempts = 0;
  //   const tradehubNetwork = netZilToTradeHub(network);
  //   while (attempts++ < 10) {
  //     try {
  //       const sdk = new TradeHubSDK({
  //         network: tradehubNetwork,
  //         debugMode: isDebug(),
  //       });
  //       return await sdk.connectWithMnemonic(mnemonic);
  //     } catch (error) {
  //       console.error("init tradehub sdk error");
  //       console.error(error);

  //       // delay <2 ^ attempts> seconds if error occurs
  //       let delay = Math.pow(2, attempts) * 1000;
  //       await new Promise(res => setTimeout(res, delay));
  //     }
  //   }
  //   throw new Error("failed to initialize TradeHubSDK")
  // }

  // useEffect(() => {
  //   if (!swthAddrMnemonic) return;

  //   runInitTradeHubSDK(async () => {
  //     const sdk = await initTradehubSDK(swthAddrMnemonic, network);
  //     await sdk.initialize();
  //     setSdk(sdk);
  //   })

  //   // eslint-disable-next-line
  // }, [swthAddrMnemonic, network])

  const onClickConnectETH = async (bypass?: boolean) => {
    if (!bypass && ethWallet) return setDisconnectMenu(connectButtonRef);

    const web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      network: network === Network.MainNet ? 'mainnet' : 'ropsten',
      providerOptions
    })

    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider)
    const signer = ethersProvider.getSigner();
    const ethAddress = await signer.getAddress();
    const chainId = (await ethersProvider.getNetwork()).chainId;

    dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: { provider: provider, address: ethAddress, chainId: chainId } }));
    dispatch(actions.Token.refetchState());
    setEthAddress(ethAddress);
    await getLegacyContract(ethAddress, ethersProvider);
  }

  const getLegacyContract = (ethAddr: string, provider: any) => {
    runGetLegacyContract(async () => {
      const legacyContr = new ethers.Contract(LEGACY_ZIL_CONTRACT[Network.TestNet], legacyZilAbi, provider);

      setLegacyContract(legacyContr);

      const bal = await legacyContr.balanceOf(ethAddr);
      const decimal = await legacyContr.decimals();
      setLegacyDecimal(parseInt(decimal));
      setLegacyBalance(new BigNumber(bal.toString()).shiftedBy(-decimal));
    })
  }

  const onSelectMax = () => {
    setTransferAmount(legacyBalance);
  }

  const onAmountChange = (rawAmount: string = "0") => {
    setTransferAmount(new BigNumber(rawAmount));
  }

  const checkAllowance = async (ethAddr: string) => {
    const allowance = await legacyContract!.allowance(ethAddr, ERC20_TOKENSWAP_CONTRACT[Network.TestNet]);

    return new BigNumber(allowance.toString()).gte(legacyBalance.shiftedBy(legacyDecimal));
  }

  const getApproval = async () => {
    if (!legacyContract || !ethWallet) return null;

    const approval = await checkAllowance(ethWallet.address);
    if (!approval) {
      try {
        setPendingApproval(true);

        const ethersProvider = new ethers.providers.Web3Provider(ethWallet.provider)
        const signer = ethersProvider.getSigner();

        await legacyContract.connect(signer).approve(legacyContract.address, 100000);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setPendingApproval(false);
      }
    }
  }

  const onDisconnectEthWallet = (clear?: boolean) => {
    let disconnectForm = {};
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      disableInjectedProvider: false,
      network: "ropsten",
      providerOptions
    });
    if (clear) {
      web3Modal.clearCachedProvider();
    }
    setDisconnectMenu(null);
    setEthAddress(null);
    dispatch(actions.Bridge.updateForm(disconnectForm));
    dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: null }));
  }

  async function onSwap() {
    runSwapToken(async () => {
      const ethersProvider = new ethers.providers.Web3Provider(ethWallet?.provider);
      const signer = ethersProvider.getSigner();
      // const ethAddress = await signer.getAddress();
      // const gasPrice = await ethersProvider.getGasPrice();
      // const gasPriceGwei = new BigNumber(ethers.utils.formatUnits(gasPrice, "gwei"));

      await getApproval()
      const ercSwapContract = new ethers.Contract(ERC20_TOKENSWAP_CONTRACT[Network.TestNet], tokenswapAbi);
      const preTx = await ercSwapContract.populateTransaction.swap(100000, { gasLimit: 21000 });
      const signedTx = await signer.sendUncheckedTransaction(preTx)

      const tx = await ethersProvider.send("eth_sendRawTransaction", [signedTx]);
      toaster("Swap completed!")
      setSwappedTx(tx);
    })
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h1" className={classes.headerText}><SwapSVG className={classes.swapIcon} />ERC20 Zil Token Swap</Text>
          <Text className={classes.subHeaderText}>Swap your legacy ERC20 ZIL to a bridgeable ERC20 ZIL below. After swapping, you will need to use the <b>Zil<b className={classes.textColoured}>Bridge</b></b> to bridge your ERC20 ZIL from Ethereum to the Zilliqa network.</Text>
        </Box>
        <Box display="flex" flexDirection="column" textAlign="center" mt={2}>
          <Text><b>Step 1</b>: Connect Wallet</Text>
          <ConnectButton
            buttonRef={connectButtonRef}
            chain={Blockchain.Ethereum}
            address={ethAddress || ""}
            onClick={() => onClickConnectETH()}
          />
        </Box>
        <Box display="flex" flexDirection="column" textAlign="center" mt={2}>
          <Text><b>Step 2</b>: Connect Wallet</Text>
          <Box mt={2} display="flex" flexDirection="column">
            <CurrencyInput
              label="Amount"
              disabled={!legacyBalance}
              tokenList={"bridge-eth"}
              amount={transferAmount.toString()}
              token={null}
              showMaxButton
              onAmountChange={onAmountChange}
              // onCurrencyChange={onCurrencyChange}
              onSelectMax={onSelectMax}
              legacyZil={true}
              fixedToken={true}
              legacyBalance={legacyBalance}
              balanceLabel="Legacy Balance"
            />
            <Box display="flex" justifyContent="center" mt={-.6} mb={-.6}>
              <ArrowDown />
            </Box>
            {/* TODO: GET BRIDGEABLE ZIL TOKEN */}
            <CurrencyInput
              label="Amount"
              disabled={true}
              tokenList={"bridge-eth"}
              amount={transferAmount.toString()}
              token={null}
              fixedToken={true}
              balanceLabel="Bridgeable Balance"
            />
          </Box>
          <FancyButton
            disabled={!ethAddress || !transferAmount || transferAmount.lte(0) || transferAmount.gt(legacyBalance)}
            color="primary"
            variant="contained"
            className={classes.actionButton}
            onClick={() => onSwap()}
            loading={isLoading}
          >
            {(transferAmount.gt(legacyBalance) || (ethWallet && legacyBalance.eq(0))) ? "Insufficient Legacy ZIL Balance" : "Swap"}
          </FancyButton>

          {swappedTx && (
            <Box display="flex" className={classes.successBox}>
              <Box marginRight={1}>
                <SuccessSVG />
              </Box>
              <Box textAlign="left">
                <Typography variant="body1" className={classes.textColoured}>
                  Swap success. Bridge your ZIL back to ZIlliqa via the <b className={classes.unColorText}>Zil<b className={classes.textColoured}>Bridge</b></b> here.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        <ConnectETHPopper
          open={!!disconnectMenu}
          anchorEl={disconnectMenu?.current}
          className={classes.priority}
          onChangeWallet={() => { onDisconnectEthWallet(true); onClickConnectETH(true) }}
          onDisconnectEth={() => onDisconnectEthWallet()}
          onClickaway={() => setDisconnectMenu(undefined)}
        >
        </ConnectETHPopper>
      </Box>
    </Box>
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(8, 6, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 4, 2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(6, 2, 2),
    },
  },
  container: {
    padding: theme.spacing(6, 4),
    maxWidth: 488,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
      padding: theme.spacing(2, 3),
    },
    "& .MuiAccordion-root.Mui-expanded": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`
    },
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
  textColoured: {
    color: theme.palette.primary.dark
  },
  zilLogo: {
    marginRight: "2px"
  },
  swapIcon: {
    height: "30px",
    width: "30px",
    marginRight: theme.spacing(1),
  },
  headerText: {
    fontSize: "30px",
    display: "flex",
    alignItems: "center",
  },
  subHeaderText: {
    alignItems: "center",
    textAlign: "center",
    fontSize: "17px",
    lineHeight: 1.2,
    marginTop: theme.spacing(1),
  },
  actionButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
    height: 46
  },
  successBox: {
    padding: theme.spacing(0, 3)
  },
  unColorText: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : theme.palette.primary.light
  },
  successText: {
    color: theme.palette.primary.dark
  },
  priority: {
    zIndex: 10,
  },
}));

export default BridgableZil;
