/* eslint-disable @typescript-eslint/no-unused-vars */
// temp lint override to allow staging deployment for WIP file
import { Box, Button, InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ConfirmTransfer, CurrencyInput, FancyButton, Text } from 'app/components';
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import MainCard from 'app/layouts/MainCard';
import { actions } from "app/store";
import { BridgeFormState, BridgeTx } from 'app/store/bridge/types';
import { LayoutState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useNetwork } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import BigNumber from 'bignumber.js';
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Blockchain } from "tradehub-api-js";


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {},
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
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
    border: `1px solid ${theme.palette.currencyInput}`,
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
    flexDirection: "column",
    border: `1px solid ${theme.palette.type === "dark" ? "#29475A" : "#D2E5DF"}`,
    borderRadius: 12,
    padding: theme.spacing(1)
  },
  dotIcon: {
    marginRight: theme.spacing(1)
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
  },
  selectMenu: {
    "& .MuiListItem-root.Mui-selected": {
        color: "#DEFFFF"
    }
  }
}))

const initialFormState = {
  zilPrivateKey: '',
  swthAddress: '',
  sourceAddress: '',
  destAddress: '',
  transferAmount: '0',
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [fromBlockchain, setFromBlockchain] = useState<Blockchain.Zilliqa | Blockchain.Ethereum>(Blockchain.Ethereum);
  const [toBlockchain, setToBlockchain] = useState<Blockchain.Zilliqa | Blockchain.Ethereum>(Blockchain.Zilliqa);
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet); // zil wallet
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const bridgeFormState: BridgeFormState = useSelector<RootState, BridgeFormState>(store => store.bridge.formState);
  const layoutState = useSelector<RootState, LayoutState>(store => store.layout);

  const tokenList: 'bridge-zil' | 'bridge-eth' = fromBlockchain === Blockchain.Zilliqa ? 'bridge-zil' : 'bridge-eth'

  useEffect(() => {
    // TODO: need a way to determine if updating source / dest address if the "From" is zil wallet
    if (wallet !== null) {
      setFormState({
        ...formState,
        destAddress: wallet.addressInfo.byte20
      })
      dispatch(actions.Bridge.updateForm({
        destAddress: wallet.addressInfo.byte20
      }))
    }
    // eslint-disable-next-line
  }, [wallet]);

  const onFromBlockchainChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    if (e.target.value === Blockchain.Zilliqa) {
      setFromBlockchain(Blockchain.Zilliqa)
      setToBlockchain(Blockchain.Ethereum)
    } else {
      setFromBlockchain(Blockchain.Ethereum)
      setToBlockchain(Blockchain.Zilliqa)
    }
  }

  const onToBlockchainChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    if (e.target.value === Blockchain.Zilliqa) {
      setToBlockchain(Blockchain.Zilliqa)
      setFromBlockchain(Blockchain.Ethereum)
    } else {
      setToBlockchain(Blockchain.Ethereum)
      setFromBlockchain(Blockchain.Zilliqa)
    }
  }

  const onClickConnectETH = async () => {
    try {
      let provider;
      (window as any).ethereum.enable().then(provider = new ethers.providers.Web3Provider((window as any).ethereum));
      const signer = provider.getSigner();
      const ethAddress = await signer.getAddress();

      setFormState({
        ...formState,
        sourceAddress: ethAddress
      })
      dispatch(actions.Bridge.updateForm({ sourceAddress: ethAddress }))
      dispatch(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, address: ethAddress}))
      dispatch(actions.Token.refetchState())
    } catch (error) {
      console.error(error);
    }
  };

  const onClickConnectZIL = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  const onTransferAmountChange = (amount: string = "0") => {
    let transferAmount = new BigNumber(amount);
    if (transferAmount.isNaN() || transferAmount.isNegative() || !transferAmount.isFinite()) transferAmount = BIG_ZERO;

    setFormState({
      ...formState,
      transferAmount: transferAmount.toString()
    })

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      token: tokenState.tokens[ZIL_ADDRESS],
      transferAmount,
    }));
  }

  const onCurrencyChange = (token: TokenInfo) => {
    if (bridgeFormState.token === token) return;

    dispatch(actions.Bridge.updateForm({
      forNetwork: network,
      token
    }));
  };

  const showTransfer = () => {
    dispatch(actions.Layout.showTransferConfirmation(!layoutState.showTransferConfirmation))
  }

  const getConnectEthWallet = () => {
    return <Button
      onClick={onClickConnectETH}
      className={cls(classes.connectWalletButton, formState.sourceAddress ? classes.connectedWalletButton : "")}
      variant="contained"
      color="primary">
      {!formState.sourceAddress
        ? "Connect Wallet"
        : <Box display="flex" flexDirection="column">
          <Text variant="button">{truncate(formState.sourceAddress, 5, 4)}</Text>
          <Text color="textSecondary"><DotIcon className={classes.dotIcon} />Connected</Text>
        </Box>
      }
    </Button>
  }

  const getConnectZilWallet = () => {
    return <FancyButton walletRequired
      className={cls(classes.connectWalletButton, !!wallet ? classes.connectedWalletButton : "")}
      variant="contained"
      color="primary"
      onClick={onClickConnectZIL}>
      <Box display="flex" flexDirection="column">
        <Text variant="button">{truncate(wallet?.addressInfo.bech32, 5, 4)}</Text>
        <Text color="textSecondary"><DotIcon className={classes.dotIcon} />Connected</Text>
      </Box>
    </FancyButton>
  }

  const onTransfer = () => {
    const { destAddress, sourceAddress } = bridgeFormState;

    if (!destAddress || !sourceAddress) return;

    // TODO: implement load initiated bridge tx into redux
    // const bridgeTx: BridgeTx = {
    //     dstAddr: destAddress,
    //     srcAddr: sourceAddress,
    //     dstChain: ,
    //     srcChain: ,
    //     dstToken: ,
    //     srcToken: ,
    //     inputAmount: ,
    //     interimAddrMnemonics: ,
    // }
    // dispatch(actions.Bridge.addBridgeTx(bridgeTx))
  }

  return (
    <MainCard {...rest} className={cls(classes.root, className)}>
      {!layoutState.showTransferConfirmation && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Text variant="h2" align="center" marginTop={2}>
            ZilSwap<span className={classes.textColoured}>Bridge</span>
          </Text>
          <Text margin={1} align="center" color="textSecondary" className={classes.textSpacing}>Powered by Switcheo TradeHub</Text>
          <Box mt={2} mb={2} display="flex" justifyContent="space-between">
            <Box className={classes.box} flex={1} bgcolor="background.contrast">
              <Text variant="h4" align="center">From</Text>
              <Box display="flex" justifyContent="center">
                <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                    MenuProps={{ classes: { paper: classes.selectMenu} }}
                    value={fromBlockchain}
                    onChange={onFromBlockchainChange}
                    label=""
                    >
                    <MenuItem value={Blockchain.Zilliqa}>Zilliqa</MenuItem>
                    <MenuItem value={Blockchain.Ethereum}>Ethereum</MenuItem>
                    </Select>
                </FormControl>
              </Box>
              {fromBlockchain === Blockchain.Ethereum ? getConnectEthWallet() : getConnectZilWallet()}
            </Box>
            <Box flex={0.2}></Box>
            <Box className={classes.box} flex={1} bgcolor="background.contrast">
              <Text variant="h4" align="center">To</Text>
              <Box display="flex" justifyContent="center">
                <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                    MenuProps={{ classes: { paper: classes.selectMenu} }}
                    value={toBlockchain}
                    onChange={onToBlockchainChange}
                    label=""
                    >
                    <MenuItem value={Blockchain.Ethereum}>Ethereum</MenuItem>
                    <MenuItem value={Blockchain.Zilliqa}>Zilliqa</MenuItem>
                    </Select>
                </FormControl>
              </Box>
              {toBlockchain === Blockchain.Ethereum ? getConnectEthWallet() : getConnectZilWallet()}
            </Box>
          </Box>

          <CurrencyInput
            label="Transfer Amount"
            disabled={!wallet || !formState.sourceAddress}
            token={tokenState.tokens[ZIL_ADDRESS]}
            amount={formState.transferAmount}
            onAmountChange={onTransferAmountChange}
            onCurrencyChange={onCurrencyChange}
            tokenList={tokenList}
          />
          <Button
            onClick={showTransfer}
            disabled={!wallet || !formState.sourceAddress || formState.transferAmount === "0" || formState.transferAmount === ""}
            className={classes.actionButton}
            color="primary"
            variant="contained">
            {!wallet && !formState.sourceAddress
              ? "Connect Wallet"
              : formState.transferAmount === "0" || formState.transferAmount === ""
                ? "Enter Amount"
                : "Head to Confirmation"
            }
          </Button>
        </Box>
      )}
      <ConfirmTransfer showTransfer={layoutState.showTransferConfirmation} />
    </MainCard>
  )
}

export default BridgeView
