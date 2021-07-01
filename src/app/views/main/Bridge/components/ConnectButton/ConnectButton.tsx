import { Box, Button, ButtonProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { FancyButton, Text } from "app/components";
import { ReactComponent as DotIcon } from "app/components/ConnectWalletButton/dot.svg";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate } from "app/utils";
import cls from "classnames";
import React from "react";
import { Blockchain } from "tradehub-api-js";

interface Props extends ButtonProps {
  address: string;
  chain: Blockchain;
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
}));

const ConnectButton: React.FC<Props> = (props: Props) => {
  const { chain, children, className, address, ...rest } = props;
  const classes = useStyles();

  const getFormattedAddress = () => {
    try {
      if (!address) return "";
      switch (chain) {
        case Blockchain.Zilliqa:
          return truncate(toBech32Address(address), 5, 4);
        default:
          return truncate(address, 5, 4);
      }
    } catch (e) {
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
      {!address
        ? "Connect Wallet"
        : <Box display="flex" flexDirection="column">
          <Text variant="button">{getFormattedAddress()}</Text>
          <Text color="textSecondary"><DotIcon className={classes.dotIcon} />Connected</Text>
        </Box>
      }
    </Button>
  );
};

export default ConnectButton;
