import React, { useMemo } from "react";
import { Box, Button, ButtonProps, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Blockchain } from "carbon-js-sdk";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Network } from 'zilswap-sdk/lib/constants'
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { FancyButton, Text } from "app/components";
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, truncateAddress } from "app/utils";
import { getEvmChainIDs } from 'app/utils/bridge'

interface Props extends ButtonProps {
  address: string;
  chain: Blockchain | null;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(2),
    height: 46,
  },
  connected: {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : "#D2E5DF"}`,
    "&:hover": {
      backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.2)}`
    }
  },
  dotIcon: {
    marginRight: theme.spacing(1)
  },
  altnetRibbon: {
    width: "41px",
    height: "41px",
    overflow: "hidden",
    position: "absolute",
    top: "-1px",
    left: "-1px",
    // pointerEvents: "none",
    "&>span": {
      top: "10px",
      left: "-15px",
      width: "62px",
      display: "block",
      padding: "0 10px",
      textOverflow: "ellipsis",
      overflow: "hidden",
      position: "relative",
      transform: "rotate(-45deg)",
      fontSize: "9px",
      textAlign: "center",
      boxShadow: "0px 0px 3px rgba(0,0,0,0.3)",
      ...theme.palette.type === "dark" && {
        color: "black",
        backgroundColor: "#fff",
      },
      ...theme.palette.type === "light" && {
        color: "white",
        backgroundColor: "#333",
      },
    },
  },
  vertIcon: {
    color: theme.palette.text?.secondary,
    overflow: "hidden",
    position: "absolute",
    right: "1px",
  },
}));

const ConnectButton: React.FC<Props> = (props: Props) => {
  const { chain, children, className, address, ...rest } = props;
  const classes = useStyles();
  const bridgeWallet = useSelector<RootState, ConnectedBridgeWallet | null>(state => state.wallet.bridgeWallets[Blockchain.Ethereum]);
  const isTestNet = useMemo(() => bridgeWallet && !(Array.from(getEvmChainIDs(Network.MainNet).values()).includes(Number(bridgeWallet.chainId))), [bridgeWallet]);

  const getFormattedAddress = () => {
    try {
      if (!address) return "";
      switch (chain) {
        case Blockchain.Zilliqa:
          return truncateAddress(address);
        default:
          return truncate(address, 5, 4);
      }
    } catch (e) {
      console.error(address)
      console.error(e)
      return "";
    }
  }

  return chain === Blockchain.Zilliqa ? (
    <FancyButton walletRequired
      className={cls(classes.root, className, { [classes.connected]: !!address })}
      variant="contained"
      color="primary"
      {...rest}
    >
      <Box display="flex" flexDirection="column">
        <Text variant="button">{getFormattedAddress()}</Text>
        <Text color="textSecondary"><DotIcon className={classes.dotIcon} />Connected</Text>
      </Box>
    </FancyButton>
  ) : (
    <Button
      className={cls(classes.root, className, { [classes.connected]: !!address })}
      variant="contained"
      color="primary"
      {...rest}
    >
      {isTestNet && (
        <Tooltip placement="top-start" title={`You have selected TestNet. Switch to MainNet for actual trade.`}>
          <Box className={classes.altnetRibbon}>
            <Typography component="span">TestNet</Typography>
          </Box>
        </Tooltip>
      )}
      {!address
        ? "Connect Wallet"
        : <Box display="flex" flexDirection="column">
          <Text variant="button">{getFormattedAddress()}</Text>
          <Text color="textSecondary"><DotIcon className={classes.dotIcon} />Connected</Text>
        </Box>
      }
      {address ? <MoreVertIcon className={classes.vertIcon} /> : null}
    </Button>
  );
};

export default ConnectButton;
