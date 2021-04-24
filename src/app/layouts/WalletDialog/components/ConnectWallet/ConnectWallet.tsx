import { Box, DialogContent, Link, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WarningOutlinedIcon from "@material-ui/icons/WarningOutlined";
import { NotificationBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { useSearchParam } from "app/utils";
import cls from "classnames";
import { ConnectOptionType } from "core/wallet";
import React from "react";
import { ConnectWalletOption } from "./components";
import { ReactComponent as PrivateKeyIconDark } from "./private-key-dark.svg";
import { ReactComponent as PrivateKeyIcon } from "./private-key.svg";
import { ReactComponent as ZilPayIcon } from "./zilpay.svg";
import { ReactComponent as ZeevesIcon } from "./zeeves.svg";

export interface ConnectWalletProps {
  onSelectConnectOption: (option: ConnectOptionType) => void;
  loading?: Boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    maxWidth: theme.spacing(82),
  },
  extraSpacious: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    }
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(0, 1),
    color: theme.palette.colors.zilliqa.neutral[theme.palette.type === "light" ? "100" : "200"],
  },
}));

const ConnectWallet: React.FC<ConnectWalletProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { loading, children, className, onSelectConnectOption, ...rest } = props;
  const showPrivateKeyOption = useSearchParam("pkLogin") === "true";
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ConnectWalletOption label="ZilPay" icon={ZilPayIcon} secureLevel={4} buttonText="Connect ZilPay" onSelect={() => onSelectConnectOption("zilpay")} />
        <ConnectWalletOption label="Zeeves" icon={ZeevesIcon} secureLevel={4} buttonText="Connect Zeeves" onSelect={() => onSelectConnectOption("zeeves")} />
        {showPrivateKeyOption && (
          <ConnectWalletOption label="Private Key" icon={theme.palette.type === "dark" ? PrivateKeyIconDark : PrivateKeyIcon} secureLevel={1} buttonText="Enter Private Key" onSelect={() => onSelectConnectOption("privateKey")} />
        )}

        <NotificationBox IconComponent={WarningOutlinedIcon} marginTop={2}>
          <Box>
            <Typography variant="body1" className={classes.notificationMessage}>
              <strong>For the safety of our users, login via private key has been disabled permanently.</strong>
            </Typography>
            <Typography variant="body2" className={classes.notificationMessage}>
              To access your liquidity pools, please connect to ZilSwap via a ZilPay wallet.
              <br />
              Click <Link href="https://docs.zilswap.io/more/help/use-zilpay-on-zilswap" target="_blank">here</Link> to learn more.
            </Typography>
          </Box>
        </NotificationBox>
      </DialogContent>
      <DialogContent className={classes.extraSpacious}>
        <Typography color="textPrimary" variant="body2" align="center">
          No wallet yet?
          <br />
          <br />Download ZilPay{" "}
          <Link rel="noopener noreferrer" target="_blank" href="https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd">here</Link>.
          <br />
          <br />Or try{" "} 
          <Link rel="noopener noreferrer" target="_blank" href="https://t.me/zilliqawalletbot">Zeeves</Link>
          a Telegram-based wallet.
        </Typography>
      </DialogContent>
    </Box>
  );
};

export default ConnectWallet;
