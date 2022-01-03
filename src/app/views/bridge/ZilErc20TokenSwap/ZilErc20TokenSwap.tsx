import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, BoxProps, makeStyles, Typography, Link } from "@material-ui/core";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import Web3Modal from 'web3modal';
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectETHPopper, CurrencyInput, FancyButton, Text } from 'app/components';
import { actions } from "app/store";
import { RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { bnOrZero, hexToRGBA, useAsyncTask, useToaster } from "app/utils";
import { BIG_ZERO, ERC20_LEGACY_ZIL_CONTRACT, ERC20_ZIL_TOKENSWAP_CONTRACT, ZIL_DECIMALS, ERC20_BRIDGEABLE_ZIL_CONTRACT } from "app/utils/constants";
import { ConnectButton } from "app/views/main/Bridge/components";
import { providerOptions } from "core/ethereum";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { ReactComponent as ArrowDown } from "./arrow-down.svg";
import { ReactComponent as SuccessSVG } from "./check.svg";
import bridgeableZilAbi from "./bridgeable-zil-abi.json";
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
  const toaster = useToaster();
  const ethWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets.eth);
  const { tokens } = useSelector<RootState, TokenState>(state => state.token);
  const [rawTransferAmount, setRawTransferAmount] = useState("0");
  const [transferAmount, setTransferAmount] = useState(BIG_ZERO);

  const [runSwapToken, isLoading] = useAsyncTask("swapToken");
  const [runInitializeAddress, isLoadingAddress] = useAsyncTask("initializeAddress");

  // legacy = interim
  // bridgeable = bridged
  const [legacyBalance, setLegacyBalance] = useState(BIG_ZERO);
  const [bridgeableBalance, setBridgeableBalance] = useState(BIG_ZERO);
  const [allowance, setAllowance] = useState(BIG_ZERO);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [swappedTx, setSwappedTx] = useState<any>();
  const [disconnectMenu, setDisconnectMenu] = useState<any>();
  const connectButtonRef = useRef();

  const chainId = bnOrZero(ethWallet?.chainId).toNumber()
  const network = (!ethWallet || chainId === 1) ? Network.MainNet : Network.TestNet;

  const {
    legacyZilContract,
    bridgeableZilContract,
    tokenSwapContract,
  } = useMemo(() => {
    const provider = ethWallet?.provider ? new ethers.providers.Web3Provider(ethWallet.provider) : undefined;
    return {
      legacyZilContract: new ethers.Contract(ERC20_LEGACY_ZIL_CONTRACT[network], legacyZilAbi, provider),
      bridgeableZilContract: new ethers.Contract(ERC20_BRIDGEABLE_ZIL_CONTRACT[network], bridgeableZilAbi, provider),
      tokenSwapContract: new ethers.Contract(ERC20_ZIL_TOKENSWAP_CONTRACT[network], tokenswapAbi, provider),
    }
  }, [network, ethWallet]);

  const bridgeZil = useMemo(() => {
    if (!tokens) return null;

    return tokens[ERC20_BRIDGEABLE_ZIL_CONTRACT[network]?.toLowerCase()] || null;
  }, [network, tokens])

  const reloadBalance = async () => {
    if (!ethWallet?.address) {
      setAllowance(BIG_ZERO);
      setLegacyBalance(BIG_ZERO);
      setBridgeableBalance(BIG_ZERO);
      return;
    };

    runInitializeAddress(async () => {
      const allowance = await legacyZilContract.allowance(ethWallet.address, tokenSwapContract.address);
      setAllowance(bnOrZero(allowance?.toString()));

      const balance = await legacyZilContract.balanceOf(ethWallet.address);
      setLegacyBalance(bnOrZero(balance?.toString()).shiftedBy(-ZIL_DECIMALS));

      const bridgeableBalance = await bridgeableZilContract.balanceOf(ethWallet.address);
      setBridgeableBalance(bnOrZero(bridgeableBalance?.toString()).shiftedBy(-ZIL_DECIMALS));
    });
  };

  useEffect(() => {
    reloadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyZilContract, tokenSwapContract, ethWallet?.address, swappedTx]);

  const onClickConnectETH = async (bypass?: boolean) => {
    if (!bypass && ethWallet) return setDisconnectMenu(connectButtonRef);

    const web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      network: network === Network.MainNet ? 'mainnet' : 'rinkeby',
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

  const onAmountChange = (rawAmount: string = "0") => {
    setRawTransferAmount(rawAmount);
    setTransferAmount(bnOrZero(rawAmount));
  };

  const onSelectMax = () => {
    onAmountChange(legacyBalance.toString(10));
  };

  const onEndEditing = () => {
    setRawTransferAmount(transferAmount.toString(10));
  };

  const approveIfNecessary = async () => {
    if (!ethWallet) return null;

    const allowance = await legacyZilContract.allowance(ethWallet.address, tokenSwapContract.address);

    if (!bnOrZero(allowance.toString()).shiftedBy(-ZIL_DECIMALS).gte(transferAmount)) {
      try {
        setPendingApproval(true);

        const ethersProvider = new ethers.providers.Web3Provider(ethWallet.provider)
        const signer = ethersProvider.getSigner();

        const increaseAllowance = new BigNumber(2).pow(128).minus(1).minus(bnOrZero(allowance.toString()))

        const tx = await legacyZilContract.connect(signer).approve(tokenSwapContract.address, increaseAllowance.toString());
        toaster(`Submitted: ERC-20 Approval`, { hash: tx.hash.replace(/^0x/i, ""), sourceBlockchain: "eth" });
        await ethersProvider.waitForTransaction(tx.hash);
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

      await approveIfNecessary()
      const tx = await tokenSwapContract.connect(signer).swap(transferAmount.shiftedBy(ZIL_DECIMALS).toString(), { gasLimit: GAS_LIMIT });

      toaster(`Submitted: Token Swap`, { hash: tx.hash.replace(/^0x/i, ""), sourceBlockchain: "eth" });
      await ethersProvider.waitForTransaction(tx.hash);

      setSwappedTx(tx);

      reloadBalance();
    })
  }

  const getExplorerLink = (hash: string) => {
    if (network === Network.MainNet) {
      return `https://etherscan.io/address/${hash}`
    } else {
      return `https://rinkeby.etherscan.io/address/${hash}`
    }
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h1" className={classes.headerText}><SwapSVG className={classes.swapIcon} />ERC-20 Zil Token Swap</Text>
          <Text className={classes.subHeaderText}>
            Swap your Interim ERC-20 ZIL ($ZIL) to a Bridged ERC-20 ZIL ($eZIL) below. After swapping, you will need to use the
            <Link
              className={classes.here}
              rel="ZilBridge"
              href={`/bridge`}>
              <b className={classes.unColorText}>Zil<span className={classes.textColoured}>Bridge</span></b>
            </Link>
            {" "}
            to bridge $eZIL from Ethereum to the Zilliqa network.
          </Text>
        </Box>
        <Box display="flex" flexDirection="column" textAlign="center" mt={3}>
          <Text className={classes.stepText}><b>Step 1</b>: Connect Wallet</Text>
          <ConnectButton
            buttonRef={connectButtonRef}
            chain={Blockchain.Ethereum}
            address={ethWallet?.address ?? ""}
            onClick={() => onClickConnectETH()}
          />
        </Box>
        <Box display="flex" flexDirection="column" textAlign="center" mt={3}>
          <Box className={classes.stepBox}>
            <Text className={classes.stepText}><b>Step 2</b>: Swap
              <Link
                className={classes.link}
                underline="hover"
                rel="noopener noreferrer"
                target="_blank"
                href={getExplorerLink(ERC20_LEGACY_ZIL_CONTRACT[network])}>
                Interim ERC-20 $ZIL <OpenInNewIcon className={classes.linkIcon} />
              </Link>
            </Text>
            <Text className={cls(classes.stepText, classes.noGap)}>
              to
              <Link
                className={classes.link}
                underline="hover"
                rel="noopener noreferrer"
                target="_blank"
                href={getExplorerLink(ERC20_BRIDGEABLE_ZIL_CONTRACT[network])}>
                Bridged ERC-20 $eZIL <OpenInNewIcon className={classes.linkIcon} />
              </Link>
            </Text>
          </Box>
          <Box mt={1.5} display="flex" flexDirection="column">
            <CurrencyInput
              label="Amount"
              disabled={!legacyBalance}
              tokenList={"bridge-eth"}
              amount={rawTransferAmount}
              token={null}
              showMaxButton
              onBlur={onEndEditing}
              onAmountChange={onAmountChange}
              onSelectMax={onSelectMax}
              legacyZil
              fixedToken
              overrideBalance={legacyBalance}
              balanceLabel="Interim $ZIL"
            />
            <Box display="flex" justifyContent="center" mt={-.6} mb={-.6}>
              <ArrowDown />
            </Box>
            <CurrencyInput
              label="Amount"
              disabled={true}
              tokenList={"bridge-eth"}
              amount={rawTransferAmount}
              token={bridgeZil}
              fixedToken
              overrideBalance={bridgeableBalance}
              balanceLabel="Bridged $eZIL"
            />
          </Box>
          <FancyButton
            disabled={!ethWallet?.address || !transferAmount.gt(0) || transferAmount.gt(legacyBalance) || isLoading}
            color="primary"
            variant="contained"
            className={classes.actionButton}
            onClick={onSwap}
            loading={isLoading || isLoadingAddress}
            loadingText={pendingApproval ? "Confirming ERC-20 Approval" : (isLoading ? "Swap in progress" : undefined)}
          >
            {!ethWallet?.address ? (
              "Connect Wallet"
            ) : (
              transferAmount.gt(legacyBalance) ?
                "Insufficient Interim $ZIL Balance"
                : (
                  transferAmount.gt(allowance) ?
                    "Unlock and Swap"
                    : "Swap"
                )
            )}
          </FancyButton>

          {!!swappedTx && (
            <Box display="flex" className={classes.successBox}>
              <Box marginRight={1}>
                <SuccessSVG />
              </Box>
              <Box textAlign="left">
                <Typography variant="body1" className={classes.textColoured}>
                  Swap success! Bridge your $eZIL back to the Zilliqa network via the
                  <Link
                    className={classes.here}
                    rel="ZilBridge"
                    href={`/bridge`}>
                    <b className={classes.unColorText}>Zil<span className={classes.textColoured}>Bridge</span></b>
                  </Link>.
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
    [theme.breakpoints.down("sm")]: {
      fontSize: "24px",
    }
  },
  subHeaderText: {
    alignItems: "center",
    textAlign: "center",
    fontSize: "17px",
    lineHeight: 1.2,
    marginTop: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
      lineHeight: 1.1,
    },
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
  stepText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    lineHeight: 1.2,
    [theme.breakpoints.down("xs")]: {
      lineHeight: 1.1,
    },
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    width: "12px",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
  link: {
    margin: theme.spacing(0, .5),
    color: theme.palette.primary.dark,
    display: 'flex',
    alignItems: 'center',
  },
  here: {
    textDecoration: "underline",
    marginLeft: theme.spacing(0.5),
  },
  stepBox: {
    display: 'flex',
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  noGap: {
    [theme.breakpoints.down("xs")]: {
      transform: "translateY(-8px)",
      marginBottom: "-8px",
    },
  }
}));

export default ZilErc20TokenSwap;
