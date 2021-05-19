import React, { useState } from 'react'
import { Box, makeStyles } from '@material-ui/core'
import { CurrencyInput, FancyButton, Text } from 'app/components'
import ProgressBar from 'app/components/ProgressBar'
import { RootState, TokenState } from "app/store/types";
import { ZIL_TOKEN_NAME } from 'app/utils/constants';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    padding: theme.spacing(4, 8, 0),
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
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  expandButton: {
    background: "none",
    border: "none"
  }
}));

interface Props {
  expanded?: boolean
  canExpand?: boolean
}

const initialFormState = {
  zwapAmount: "0",
  zilAmount: "0",
};

const TokenILOCard = (props: Props) => {
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [expanded, setExpanded] = useState<boolean>(props.expanded ?? false)
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const zwapToken = Object.values(tokenState.tokens).filter(token => token.isZwap)[0]
  const zilToken = tokenState.tokens[ZIL_TOKEN_NAME]
  const exchangeRate: BigNumber = zwapToken?.pool?.exchangeRate || new BigNumber(0)

  const toRaise: BigNumber = new BigNumber(240000)
  const committed: BigNumber = new BigNumber(400000)
  const committedPercentage: BigNumber = committed.dividedBy(toRaise).times(100)
  const zwapToBurn: BigNumber = toRaise.dividedBy(70).times(100).times(0.3)

  const manifest = {
    banner: "https://placehold.co/600x250",
    description: "ZilSteam's premium membership token",
    link: "https://zilstream.com",
    symbol: "STREAM",
    name: "ZilStream"
  };

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

  return (
    <Box>
      <button onClick={() => props.canExpand && setExpanded(!expanded)} className={classes.expandButton}>
        <Box marginTop={3}>
          <img
            className={classes.svg}
            src={manifest.banner}
            alt={`${manifest.name} ILO`}
          />
        </Box>
      </button>
      {expanded &&
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta}>
            <Text variant="h1">{manifest.name} ({manifest.symbol})</Text>
            <Text marginTop={1}>{manifest.description}</Text>

            <Text variant="h1" color="primary" marginTop={3}>00:59:59</Text>

            <ProgressBar progress={committedPercentage} marginTop={3} />

            <Box marginTop={1}>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Total Committed</Text>
                <Text color="textSecondary">${committed.toFormat(0)} ({committedPercentage.toFixed(0)}%)</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Funds to Raise</Text>
                <Text color="textSecondary">${toRaise.toFormat(0)}</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZWAP to Burn</Text>
                <Text color="textSecondary">${zwapToBurn.toFormat(0)}</Text>
              </Box>
            </Box>

            <Text marginTop={3}>Commit your tokens in a fixed ratio.</Text>
            <Text color="textSecondary">30% ZWAP - 70% ZIL</Text>

            <Box marginTop={2}>
              <CurrencyInput fixedToToken
                label=""
                token={zwapToken}
                amount={formState.zwapAmount}
                hideBalance={false}
                disabled={false}
                onAmountChange={onZwapChange} />

              <CurrencyInput fixedToToken
                label=""
                token={zilToken}
                amount={formState.zilAmount}
                hideBalance={false}
                disabled={false}
                onAmountChange={onZilChange} />
            </Box>
          </Box>

          <FancyButton walletRequired
            className={classes.actionButton}
            // showTxApprove={showTxApprove}
            // loadingTxApprove={loadingApproveTx}
            // onClickTxApprove={onApproveTx}
            variant="contained"
            color="primary"
            // disabled={!inToken || !outToken}
            // onClick={onSwap}
          >
            Commit
          </FancyButton>
        </Box>
      }
    </Box>
  )
}

export default TokenILOCard