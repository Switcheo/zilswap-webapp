import { Box, Button, Typography, Divider, IconButton, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as CheckEmptyIcon } from "./check_empty.svg";
import { ReactComponent as CheckCompleteIcon } from "./check_complete.svg";
import { hexToRGBA, truncate } from "app/utils";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
  },
  icon: {
    height: 40,
    width: 40,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
  label: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  info: {
    marginTop: 8
  },
  copy: {
    marginLeft: 10
  },
  newLink: {
    marginLeft: 4
  },
  newLinkTransaction: {
    marginLeft: 6,
    height: 10
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  rowHeader: {
    marginTop: 2
  },
  checkbox: {
    marginRight: 6
  },
  logout: {
    cursor: "pointer"
  }

}));
const ConnectedWalletBox = (props: any) => {
  const { children, className, secureLevel, icon: Icon, buttonText, onSelect, ...rest } = props;
  const classes = useStyles();
  const { wallet } = useSelector<RootState, WalletState>(state => state.wallet);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const theme = useTheme();
  const is_xs_media = useMediaQuery(theme.breakpoints.down("xs"));

  let address = "";

  useEffect(() => {
    if (wallet) {
      if (typeof wallet.reload === "function") wallet.reload();
    }

    console.log({ wallet });
  }, [])

  address = wallet.account[0] ? wallet.account[0].address : wallet.account.address;
  return (
    <Box display="flex" flexDirection="column">
      <ContrastBox className={cls(classes.root, className)}>
        <Icon className={classes.icon} />
        <Box className={classes.label}>
          <Typography variant="h3">{wallet.type ? "Private Key" : "Moonlet"}</Typography>
          <Box mt={"8px"} display="flex" flexDirection="row" alignItems="center">
            <Typography color="textSecondary" variant="body1">{is_xs_media ? truncate(address, 10, 10) : address}</Typography>
            <IconButton target="_blank" href={`https://viewblock.io/zilliqa/address/${address}?network=testnet`} className={classes.newLink} size="small"><NewLinkIcon /></IconButton>
            <IconButton onClick={() => navigator.clipboard.writeText(address)} className={classes.copy} size="small"><CopyIcon /></IconButton>
          </Box>
          <Typography className={cls(classes.info, classes.logout)} onClick={() => { wallet && wallet.logout() }} color="primary" variant="body1">Log Out</Typography>
        </Box>
      </ContrastBox>
      <Box mt={"36px"}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Typography variant="h3">Transaction History</Typography>
          <Box display="flex" flexDirection="row" alignItems="center">
            {includeCompleted && (<IconButton size="small" className={classes.checkbox} onClick={() => setIncludeCompleted(false)}><CheckCompleteIcon /></IconButton>)}
            {!includeCompleted && (<IconButton size="small" className={classes.checkbox} onClick={() => setIncludeCompleted(true)}><CheckEmptyIcon /></IconButton>)}
            <Typography color="textSecondary" variant="body2">
              Include Completed
            </Typography>
          </Box>
        </Box>
        <Box mt={"28px"}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography color="textSecondary" variant="body2">Transaction ID</Typography>
            <Typography color="textSecondary" variant="body2">Status</Typography>
          </Box>
          <Divider className={cls(classes.divider, classes.rowHeader)} />
        </Box>
        {wallet && wallet && wallet.transactions && wallet.transactions.filter((t: any) => includeCompleted ? true : !t.receiptSuccess).map((transaction: any) => (
          <Box key={transaction.hash}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Box display="flex" flexDirection="row" alignItems="center">
                <Typography variant="body2">{truncate(transaction.hash, 10, 10)}</Typography>
                <IconButton target="_blank" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=testnet`} className={classes.newLinkTransaction} size="small"><NewLinkIcon /></IconButton>
                <IconButton onClick={() => navigator.clipboard.writeText(transaction.hash)} className={classes.copy} size="small"><CopyIcon /></IconButton>
              </Box>
              <Typography variant="body2">{transaction.receiptSuccess ? "Completed" : "Cancelled"}</Typography>
            </Box>
            <Divider className={cls(classes.divider)} />
          </Box>

        ))}
      </Box>
    </Box>
  );
};

export default ConnectedWalletBox;