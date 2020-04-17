import React, { useEffect, useState } from "react";
import { ConnectedWallet } from "core/wallet/wallet";
import { makeStyles, Box, DialogContent, OutlinedInput, InputAdornment, Typography, useTheme, ButtonBase } from "@material-ui/core";
import { DialogModal, ContrastBox, CurrencyLogo } from "app/components";
import cls from "classnames";
import { ConnectWallet } from "app/layouts/WalletDialog/components";
import { ReactComponent as SearchIcon } from "./SearchIcon.svg";

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    width: 516,
    [theme.breakpoints.down("xs")]: {
      width: 296
    }
  },
  input: {
    marginBottom: 20,
  },
  inputProps: {
    [theme.breakpoints.down("xs")]: {
      '&::placeholder': {
        fontSize: "11px"
      }
    }
  },
  currencyBox: {
    padding: "8px 12px 10px 12px",
    marginTop: "0px !important",
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  currencyLogo: {
    marginRight: 10
  },
  currencies: {
    maxHeight: 460,
    overflowY: "scroll",
    [theme.breakpoints.down("xs")]: {
      maxHeight: 324,
    }
  },
  buttonBase: {
    width: "100%",
    marginTop: "2px",
    textAlign: "left",
  },
}));

const currencies = [
  { symbol: "SWTH", name: "Switcheo Network", amount: 100 },
  { symbol: "ZIL", name: "Ziliqa", amount: 2688.88 },
  { symbol: "ETH", name: "Ethereum", amount: 0 },
  { symbol: "0xBTC", name: "0xBTC Token", amount: 0 },
  { symbol: "DAI", name: "Dai Stablecoin", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
  { symbol: "SWTH", name: "Switcheo Network", amount: 0 },
];

const CurrencyDialog = (props: any) => {
  const { children, className, showCurrencyDialog, onCloseDialog, onSelect, ...rest } = props;
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const theme = useTheme();

  return (
    <DialogModal header="Select a Token" open={showCurrencyDialog} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <OutlinedInput
          placeholder="Search token name, symbol or address"
          value={search}
          fullWidth
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
          inputProps={{
            className: classes.inputProps
          }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
        <Box className={classes.currencies}>
          {currencies.map((c, index) => (
            <ButtonBase
              className={classes.buttonBase}
              key={index}
              focusRipple
              onClick={() => onSelect(c.symbol)}
            >
              <ContrastBox className={classes.currencyBox}>
                <CurrencyLogo className={classes.currencyLogo} currency={c.symbol} />
                <Box display="flex" flexDirection="column">
                  <Typography variant="h2">{c.symbol}</Typography>
                  <Typography color="textSecondary" variant="body2">{c.name}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography align="right" variant="h6" component="p">{c.amount ? `${c.amount.toLocaleString("en-US", { maximumFractionDigits: 10 })} ${c.symbol}` : "-"}</Typography>
                </Box>
              </ContrastBox>
            </ButtonBase>
          ))}
        </Box>
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog;