import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { Box, makeStyles } from '@material-ui/core'
import { fromBech32Address } from "@zilliqa-js/crypto";
import { CurrencyInputILO, FancyButton, Text } from 'app/components'
import ProgressBar from 'app/components/ProgressBar'
import { actions } from "app/store";
import { RootState, TokenState, WalletObservedTx, WalletState } from "app/store/types"
import { useAsyncTask, useNetwork } from "app/utils"
import { ZIL_TOKEN_NAME } from 'app/utils/constants';
import { ZilswapConnector } from "core/zilswap";
import { ILOData } from 'core/zilo/constants';

import HelpInfo from "../HelpInfo";

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(3),
  },
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  meta: {
    textAlign: "center",
  },
  svg: {
    maxWidth: "100%",
    width: "unset",
    height: "unset",
    flex: 1,
    borderRadius: "12px 12px 0 0"
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  expandButton: {
    background: "none",
    border: "none"
  },
  timer: {
    color: theme.palette.primary.dark
  },
  secondaryText: {
    marginTop: theme.spacing(1)
  },
  input: {
    marginBottom: theme.spacing(1),
  }
}));

interface Props {
  expanded?: boolean
  data: ILOData
};

const initialFormState = {
  zwapAmount: "0",
  zilAmount: "0",
};

const TokenILOCard = (props: Props) => {
  const { data } = props
  const dispatch = useDispatch();
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [expanded, _] = useState<boolean>(props.expanded ?? true)
  const [runCommit, loading, error, clearCommitError] = useAsyncTask("commitILO");
  const [runApproveTx, loadingApproveTx, errorApproveTx, clearApproveError] = useAsyncTask("approveTx");
  const classes = useStyles();

  const zwapToken = Object.values(tokenState.tokens).filter(token => token.isZwap)[0]!
  const zilToken = tokenState.tokens[ZIL_TOKEN_NAME]
  const exchangeRate: BigNumber = zwapToken?.pool?.exchangeRate || new BigNumber(0)
  const contractAddrHex = fromBech32Address(data.contractAddress).toLowerCase();
  const unitlessInAmount = new BigNumber(formState.zwapAmount).shiftedBy(zwapToken.decimals).integerValue();
  const showTxApprove = new BigNumber(zwapToken.allowances![contractAddrHex] || '0').comparedTo(unitlessInAmount) < 0;

  const onZwapChange = (amount: string = "0") => {
    let _amount = new BigNumber(amount);
    let _afterExchangeRate = _amount.times(exchangeRate)
    let _totalValue = _afterExchangeRate.dividedBy(30).times(100)
    let _zilAmount = _totalValue.times(0.7);

    setFormState({
      ...formState,
      zwapAmount: amount,
      zilAmount: _zilAmount.toString()
    });
  };

  // TODO: use proper ratio
  const onZilChange = (amount: string = "0") => {
    let _amount = new BigNumber(amount);
    let _totalValue = _amount.dividedBy(70).times(100)
    let _zwapAmount = _totalValue.times(0.3).dividedBy(exchangeRate);

    setFormState({
      ...formState,
      zwapAmount: _zwapAmount.toString(),
      zilAmount: amount,
    });
  };

  const onApproveTx = () => {
    if (loading) return;

    clearCommitError();

    runApproveTx(async () => {
      const tokenAmount = new BigNumber(formState.zwapAmount);
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: tokenAmount.shiftedBy(zwapToken.decimals),
        tokenID: zwapToken.address,
      });

      if (!observedTx)
        throw new Error("Transfer allowance already sufficient for specified amount");

      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: walletState.wallet!.addressInfo.bech32,
        network,
      };
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  // TODO: check state if can commit
  // TODO: monitor active state

  return (
    <Box className={classes.root}>
      <Box>
        <button className={classes.expandButton}>
          <img
            className={classes.svg}
            src={data.imageURL}
            alt={data.tokenName}
          />
        </button>
      </Box>
      {expanded &&
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta}>
            <Text variant="h1">{data.tokenName} ({data.tokenSymbol})</Text>
            <Text color="textSecondary" marginTop={1}>{data.description}</Text>

            <Text variant="h1" marginTop={2} className={classes.timer}>
              00:59:59
              <HelpInfo placement="top" title="To be changed." />
            </Text>

            <ProgressBar progress={0} marginTop={3} />

            <Box marginTop={1}>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Total Committed</Text>
                <Text color="textSecondary">~$928,636.02 (92%)</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZIL to Raise</Text>
                <Text color="textSecondary">$1,000,000</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZWAP to Burn</Text>
                <Text color="textSecondary">$300,000</Text>
              </Box>
            </Box>

            <Text marginTop={3} marginBottom={0.5}>Commit your tokens in a fixed ratio.</Text>
            <Text color="textSecondary">30% ZWAP - 70% ZIL</Text>

            <Box marginTop={2} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
              <CurrencyInputILO fixedToToken
                label="to Burn:"
                token={zwapToken}
                amount={formState.zwapAmount}
                hideBalance={false}
                disabled={false}
                onAmountChange={onZwapChange}
                className={classes.input}
              />

              <CurrencyInputILO fixedToToken
                label="to Fund Project:"
                token={zilToken}
                amount={formState.zilAmount}
                hideBalance={false}
                disabled={false}
                onAmountChange={onZilChange}
                className={classes.input}
              />
            </Box>
          </Box>

          <FancyButton walletRequired
            className={classes.actionButton}
            showTxApprove={showTxApprove}
            loadingTxApprove={loadingApproveTx}
            onClickTxApprove={onApproveTx}
            variant="contained"
            color="primary"
            // onClick={onCommit}
          >
            Commit
          </FancyButton>
        </Box>
      }

      {!expanded &&
        <Box display="flex" flexDirection="column" className={classes.container} textAlign="center" mb={4}>
          <Text variant="h1">No active listings.</Text>
          <Text className={classes.secondaryText} color="textSecondary">Click here to view past ILOs.</Text>
        </Box>
      }
    </Box>
  )
}

export default TokenILOCard