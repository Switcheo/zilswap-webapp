import React, { useEffect, useState } from "react"
import { Box, CircularProgress, DialogContent, DialogProps, IconButton, InputAdornment, OutlinedInput, makeStyles } from "@material-ui/core"
import { toBech32Address } from "@zilliqa-js/zilliqa"
import BigNumber from "bignumber.js"
import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import CloseIcon from "@material-ui/icons/CloseOutlined"
import { Blockchain } from 'carbon-js-sdk/lib'
import { DialogModal } from "app/components"
import { BridgeableChains, BridgeableToken, BridgeState } from "app/store/bridge/types"
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types"
import { hexToRGBA, useTaskSubscriber } from "app/utils"
import { BIG_ZERO, HIDE_SWAP_TOKEN_OVERRIDE, LoadingKeys, ZIL_ADDRESS } from "app/utils/constants"
import { actions } from "app/store"
import { AppTheme } from "app/theme/types"
import { getMarketplace } from "app/saga/selectors"
import { CurrencyList } from "./components"

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: "100%",
    maxWidth: 650,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 520,
    },
    [theme.breakpoints.down("xs")]: {
      maxWidth: '100%',
      padding: '16px',
    },
    "& .MuiPaper-root": {
      width: "100%",
    },
    "& .MuiDialogTitle-root": {
      backgroundColor: theme.palette.type === "dark" ? "#12222C" : "#F6FFFC"
    },
  },
  input: {
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#D4FFF2",
    marginBottom: 20,
    borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
    '&.Mui-focused': {
      borderColor: theme.palette.primary.dark,
      caretColor: theme.palette.primary.dark,
    },
  },
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "16px!important"
    },
    padding: "18.5px 14px!important",
  },
  currenciesContainer: {
    maxHeight: 460,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    '&::-webkit-scrollbar': {
      width: '0.4rem'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: `rgba${hexToRGBA(theme.palette.text!.primary!, 0.1)}`,
      borderRadius: 12
    }
  },
  currenciesHeader: {
    justifyContent: "left",
    borderRadius: 0,
    margin: theme.spacing(1, 0, .5),
  },
  currencies: {
    maxHeight: "1000000px",
  },
  currenciesHidden: {
    maxHeight: "0px",
    overflow: "hidden",
  },
  dialogContent: {
    backgroundColor: theme.palette.type === "dark" ? "#12222C" : "#F6FFFC",
    borderBottom: theme.palette.border,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderRadius: "0 0 12px 12px",
    paddingTop: '24px',
    [theme.breakpoints.down("sm")]: {
      paddingTop: '0px',
    },
  },
  closeIcon: {
    color: theme.palette.primary.main,
  },
}))

export interface CurrencyDialogProps extends DialogProps {
  onSelectCurrency: (token: TokenInfo) => void
  hideZil?: boolean
  hideNoPool?: boolean
  showContribution?: boolean
  zrc2Only?: boolean
  token?: TokenInfo | null
  tokenList: string
  wrapZil?: boolean
};

const CurrencyDialog: React.FC<CurrencyDialogProps> = (props: CurrencyDialogProps) => {
  const { className, onSelectCurrency, hideZil, hideNoPool, showContribution, zrc2Only = false, open, token, onClose, wrapZil } = props
  var { tokenList } = props
  const classes = useStyles()
  const [search, setSearch] = useState("")
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet)
  const dispatch = useDispatch()

  const tokenState = useSelector<RootState, TokenState>(state => state.token)
  const walletState = useSelector<RootState, WalletState>(state => state.wallet)
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge)
  const { toBlockchain, fromBlockchain } = bridgeState.formState
  const { exchangeInfo } = useSelector(getMarketplace)
  var bridgeChain: BridgeableChains = Blockchain.Zilliqa

  /*
  if tokenList starts with "bridge-", isolate the chain by using the substring after. 
  Use the chain name for filtering the bridge tokens list later
  */
  const bridgeRegex = new RegExp(`bridge-` + fromBlockchain)
  if (tokenList.match(bridgeRegex)) {
    bridgeChain = tokenList.replace("bridge-", "") as BridgeableChains
    tokenList = "bridge"
  }

  useEffect(() => {
    if (!tokenState.tokens) return setTokens([])
    const sortFn = (lhs: TokenInfo, rhs: TokenInfo) => {
      if (!walletState.wallet) return 0
      if (lhs.isZil) return -1
      if (rhs.isZil) return 1
      if (showContribution) {
        // sort first by contribution
        const difference = (rhs.pool?.userContribution || BIG_ZERO)
          .comparedTo(lhs.pool?.userContribution || BIG_ZERO)
        // then lexicographically by symbol
        return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol)
      }
      const difference = new BigNumber(rhs.balance?.toString() || 0).comparedTo(lhs.balance?.toString() || 0)
      return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol)
    }
    let tokens = Object.values(tokenState.tokens)
    let bridgeTokens: BridgeableToken[]
    switch (tokenList) {
      case 'zil':
        tokens = tokens.filter(t => t.blockchain === Blockchain.Zilliqa)
        break
      case 'ark-zil':
        const exchangeDenoms = exchangeInfo?.denoms
        tokens = tokens.filter(t => t.blockchain === Blockchain.Zilliqa && exchangeDenoms && exchangeDenoms.includes(t.address))
        break
      case 'bridge':
        switch (bridgeChain!) {
          case Blockchain.Zilliqa:
            bridgeTokens = bridgeState.tokens.filter(token => token.blockchain === Blockchain.Zilliqa && token.chains[toBlockchain])
            tokens = tokens.filter(t => t.blockchain === Blockchain.Zilliqa && bridgeTokens.filter(token => toBech32Address(token.tokenAddress) === t.address).length > 0)
            break
          default:
            bridgeTokens = bridgeState.tokens.filter(token => token.blockchain === bridgeChain && token.chains[toBlockchain])
            tokens = tokens.filter(t => t.blockchain === bridgeChain && bridgeTokens.filter(token => token.tokenAddress === t.address.slice(2)).length > 0)
            break
        }
    }

    if (zrc2Only) {
      tokens = tokens.filter(t => t.address !== ZIL_ADDRESS)
    }  
    setTokens(tokens.sort(sortFn))

    if (wrapZil) {
      tokens = tokens.filter(t => t.isZil || t.isWzil)
      setTokens(tokens)
    }

    if (token && !tokens.find(t => t.address === token.address) && tokens.length > 0)
      onSelectCurrency(tokens[0])
  }, [tokenState.tokens, walletState.wallet, bridgeState.tokens, showContribution, toBlockchain, tokenList, bridgeChain, exchangeInfo?.denoms, zrc2Only, wrapZil, token, onSelectCurrency])

  const filterSearch = (token: TokenInfo): boolean => {
    const searchTerm = search.toLowerCase().trim()
    if (token.isZil && hideZil) return false
    if (!token.isZil && !token.pool && hideNoPool && !token.isWzil) return false
    if (searchTerm === "" && !token.registered && !tokenState.userSavedTokens.includes(token.address)) return false
    if (HIDE_SWAP_TOKEN_OVERRIDE.includes(token.address)) return false

    if (!token.registered && !tokenState.userSavedTokens.includes(token.address)) {
      return token.address.toLowerCase() === searchTerm
    }

    return token.address.toLowerCase() === searchTerm ||
      (typeof token.name === "string" && token.name?.toLowerCase().includes(searchTerm)) ||
      token.symbol.toLowerCase().includes(searchTerm)
  }

  const onToggleUserToken = (token: TokenInfo) => {
    if (!tokenState.userSavedTokens.includes(token.address)) setSearch("")
    dispatch(actions.Token.updateUserSavedTokens(token.address))
  }

  const filteredTokens = tokens.filter(filterSearch)

  return (
    <DialogModal header="Select Token" open={open} onClose={onClose} className={clsx(classes.root, className)}>
      <DialogContent className={classes.dialogContent}>
        {!loadingConnectWallet && (
          <OutlinedInput
            placeholder="Search name or enter address"
            value={search}
            fullWidth
            classes={{ input: classes.inputText }}
            className={classes.input}
            onChange={(e) => setSearch(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <CloseIcon className={classes.closeIcon} />
                </IconButton>
              </InputAdornment>
            }
          />
        )}
        {(loadingConnectWallet || !tokenState.initialized) && (
          <Box display="flex" justifyContent="center">
            <CircularProgress color="primary" />
          </Box>
        )}

        <Box className={classes.currenciesContainer}>
          <CurrencyList
            tokens={filteredTokens}
            search={search}
            emptyStateLabel="No token found."
            showContribution={showContribution}
            userTokens={tokenState.userSavedTokens}
            onToggleUserToken={onToggleUserToken}
            onSelectCurrency={onSelectCurrency}
            className={clsx(classes.currencies)} />
        </Box>
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog
