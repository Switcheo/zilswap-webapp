import React from "react";
import {
  Box,
  DialogContent,
  Link,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WarningOutlinedIcon from "@material-ui/icons/WarningOutlined";
import cls from "classnames";
import { ConnectOptionType } from "core/wallet";
import { NotificationBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { useSearchParam } from "app/utils";
import { ReactComponent as BoltXIcon } from "./boltx.svg";
import { ConnectWalletOption } from "./components";
import { ReactComponent as PrivateKeyIconDark } from "./private-key-dark.svg";
import { ReactComponent as PrivateKeyIcon } from "./private-key.svg";
import { ReactComponent as ZeevesIcon } from "./zeeves.svg";
import { ReactComponent as ZilPayIcon } from "./zilpay.svg";
import { ReactComponent as Z3WalletIcon } from "./z3wallet.svg";

export interface ConnectWalletProps {
  onSelectConnectOption: (option: ConnectOptionType) => void;
  loading?: Boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    maxWidth: theme.spacing(82),
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px",
  },
  extraSpacious: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(0, 1),
    color:
      theme.palette.colors.zilliqa.neutral[
        theme.palette.type === "light" ? "200" : "100"
      ],
  },
  link: {
    color: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
  },
  rounded: {
    borderRadius: "12px",
    borderBottom: "none",
    backgroundColor:
      theme.palette.type === "dark"
        ? "#00161C"
        : theme.palette.background.readOnly!,
    "&:not(:first-child)": {
      borderRadius: "12px 12px 12px 12px",
    },
  },
}));

const ConnectWallet: React.FC<
  ConnectWalletProps & React.HTMLAttributes<HTMLDivElement>
> = (props: any) => {
  const { loading, children, className, onSelectConnectOption, ...rest } =
    props;

  const showPrivateKeyOption = useSearchParam("pkLogin") === "true";
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ConnectWalletOption
          label="ZilPay"
          icon={ZilPayIcon}
          secureLevel={4}
          buttonText="Connect ZilPay"
          onSelect={() => onSelectConnectOption("zilpay")}
        />
        <ConnectWalletOption
          label="BoltX"
          icon={BoltXIcon}
          secureLevel={4}
          buttonText="Connect BoltX"
          onSelect={() => onSelectConnectOption("boltX")}
        />
        <ConnectWalletOption
          label="Zeeves"
          icon={ZeevesIcon}
          secureLevel={4}
          buttonText="Connect Zeeves"
          onSelect={() => onSelectConnectOption("zeeves")}
        />
        <ConnectWalletOption
          label="Z3Wallet"
          icon={Z3WalletIcon}
          secureLevel={4}
          buttonText="Connect Z3Wallet"
          onSelect={() => onSelectConnectOption("z3wallet")}
        />
        {showPrivateKeyOption && (
          <ConnectWalletOption
            label="Private Key"
            icon={
              theme.palette.type === "dark"
                ? PrivateKeyIconDark
                : PrivateKeyIcon
            }
            secureLevel={1}
            buttonText="Enter Private Key"
            onSelect={() => onSelectConnectOption("privateKey")}
          />
        )}

        <NotificationBox
          className={classes.rounded}
          IconComponent={WarningOutlinedIcon}
          marginTop={2}
        >
          <Box>
            <Typography variant="body1" className={classes.notificationMessage}>
              <strong>
                For the safety of our users, login via private key has been
                disabled permanently.
              </strong>
            </Typography>
            <Typography variant="body2" className={classes.notificationMessage}>
              To access your liquidity pools, please connect to ZilSwap via a
              ZilPay wallet.
              <br />
              Click{" "}
              <Link
                style={{
                  color: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
                }}
                href="https://docs.zilswap.io/more/help/use-zilpay-on-zilswap"
                target="_blank"
              >
                here
              </Link>{" "}
              to learn more.
            </Typography>
          </Box>
        </NotificationBox>
      </DialogContent>
      <DialogContent className={classes.extraSpacious}>
        <Typography color="textPrimary" variant="body2" align="center">
          No wallet yet?
          <br />
          <br />
          Download ZilPay{" "}
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href="https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd"
          >
            here
          </Link>
          .
          <br />
          <br />
          Or try{" "}
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href="https://t.me/zilliqawalletbot"
          >
            Zeeves
          </Link>
          , a Telegram-based wallet.
        </Typography>
      </DialogContent>
    </Box>
  );
};

export default ConnectWallet;
