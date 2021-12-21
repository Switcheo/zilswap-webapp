import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, BoxProps, makeStyles, Typography } from "@material-ui/core";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import Web3Modal from 'web3modal';
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectETHPopper, CurrencyInput, FancyButton, Text } from 'app/components';
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, hexToRGBA, useAsyncTask, useNetwork, useToaster } from "app/utils";
import { BIG_ZERO, ERC20_LEGACY_ZIL_CONTRACT, ERC20_ZIL_TOKENSWAP_CONTRACT, ZIL_DECIMALS } from "app/utils/constants";
import { ConnectButton } from "app/views/main/Bridge/components";
import { providerOptions } from "core/ethereum";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ReactComponent as ArrowDown } from "./arrow-down.svg";
import { ReactComponent as SuccessSVG } from "./check.svg";
import legacyZilAbi from "./legacy-zil-abi.json";
import { ReactComponent as SwapSVG } from "./swap.svg";
import tokenswapAbi from "./tokenswap-abi.json";

interface Props extends BoxProps {
}

const GAS_LIMIT = 175000;

const ZilErc20TokenSwap = (props: Props) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const toaster = useToaster();
  const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets.eth);
  const [transferAmount, setTransferAmount] = useState(BIG_ZERO);

  const [runSwapToken, isLoading] = useAsyncTask("swapToken");
  const [runInitializeAddress, isLoadingAddress] = useAsyncTask("initializeAddress");

  const [legacyBalance, setLegacyBalance] = useState(BIG_ZERO);
  const [allowance, setAllowance] = useState(BIG_ZERO);
  // eslint-disable-next-line
  const [pendingApproval, setPendingApproval] = useState(false);
  const [swappedTx, setSwappedTx] = useState<any>();
  const [disconnectMenu, setDisconnectMenu] = useState<any>();
  const connectButtonRef = useRef();

  const {
    legacyZilContract,
    tokenSwapContract,
  } = useMemo(() => {
    const provider = ethWallet?.provider ? new ethers.providers.Web3Provider(ethWallet.provider) : undefined;
    return {
      legacyZilContract: new ethers.Contract(ERC20_LEGACY_ZIL_CONTRACT[network], legacyZilAbi, provider),
      tokenSwapContract: new ethers.Contract(ERC20_ZIL_TOKENSWAP_CONTRACT[network], tokenswapAbi, provider),
    }
  }, [network, ethWallet]);

  useEffect(() => {
    if (!ethWallet?.address) {
      setAllowance(BIG_ZERO);
      setLegacyBalance(BIG_ZERO);
      return;
    };

    runInitializeAddress(async () => {
      const allowance = await legacyZilContract.allowance(ethWallet.address, tokenSwapContract.address);
      setAllowance(bnOrZero(allowance?.toString()));

      const balance = await legacyZilContract.balanceOf(ethWallet.address);
      setLegacyBalance(bnOrZero(balance?.toString()).shiftedBy(-ZIL_DECIMALS))
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyZilContract, tokenSwapContract, ethWallet?.address]);

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
  }

  const onSelectMax = () => {
    setTransferAmount(legacyBalance);
  }

  const onAmountChange = (rawAmount: string = "0") => {
    setTransferAmount(new BigNumber(rawAmount));
  }

  const getApproval = async () => {
    if (!ethWallet) return null;

    const allowance = await legacyZilContract.allowance(ethWallet.address, tokenSwapContract.address);

    if (!allowance) {
      try {
        setPendingApproval(true);

        const ethersProvider = new ethers.providers.Web3Provider(ethWallet.provider)
        const signer = ethersProvider.getSigner();

        await legacyZilContract.connect(signer).approve(ERC20_ZIL_TOKENSWAP_CONTRACT[Network.TestNet], 100000);
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
    dispatch(actions.Bridge.updateForm(disconnectForm));
    dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: null }));
  }

  async function onSwap() {
    runSwapToken(async () => {
      const ethersProvider = new ethers.providers.Web3Provider(ethWallet?.provider);
      const signer = ethersProvider.getSigner();

      await getApproval()
      const ercSwapContract = new ethers.Contract(ERC20_ZIL_TOKENSWAP_CONTRACT[Network.TestNet], tokenswapAbi);
      const tx = await ercSwapContract.connect(signer).swap(10000, { gasLimit: GAS_LIMIT });

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
            address={ethWallet?.address ?? ""}
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
            <CurrencyInput
              label="Amount"
              disabled={true}
              tokenList={"bridge-eth"}
              amount={transferAmount.toString(10)}
              token={null}
              fixedToken={true}
              balanceLabel="Bridgeable Balance"
            />
          </Box>
          <FancyButton
            disabled={!ethWallet?.address || !transferAmount.gt(0) || transferAmount.gt(legacyBalance)}
            color="primary"
            variant="contained"
            className={classes.actionButton}
            onClick={() => onSwap()}
            loading={isLoading || isLoadingAddress}
          >
            {!ethWallet?.address ? (
              "Connect Wallet"
            ) : (
              transferAmount.gt(legacyBalance) ?
                "Insufficient Legacy ZIL Balance"
                : (
                  transferAmount.gt(allowance) ?
                    "Unlock Legacy ZIL"
                    : "Swap"
                )
            )}
          </FancyButton>

          {swappedTx && (
            <Box display="flex" className={classes.successBox}>
              <Box marginRight={1}>
                <SuccessSVG />
              </Box>
              <Box textAlign="left">
                <Typography variant="body1" className={classes.textColoured}>
                  Swap success. Bridge your ZIL back to ZIlliqa via the <b className={classes.unColorText}>Zil<b className={classes.textColoured}>Bridge</b></b> <u >here.</u>
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

export default ZilErc20TokenSwap;
