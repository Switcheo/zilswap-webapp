import React, { useState } from 'react'
import { Box, makeStyles } from '@material-ui/core'
import { CurrencyInput, FancyButton, Text } from 'app/components'
import ProgressBar from 'app/components/ProgressBar'
import { TokenState } from "app/store/types";
import { ZIL_TOKEN_NAME } from 'app/utils/constants';

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
  tokenState: TokenState
  expanded?: boolean
}

const initialFormState = {
  zwapAmount: "0",
  zilAmount: "0",
};

const TokenILOCard = (props: Props) => {
  const [formState] = useState<typeof initialFormState>(initialFormState);
  const [expanded, setExpanded] = useState<boolean>(props.expanded ?? false)
  const classes = useStyles();

  return (
    <Box>
      <button onClick={() => setExpanded(!expanded)} className={classes.expandButton}>
        <Box marginTop={3}>
          <img
            className={classes.svg}
            src={`https://placehold.co/600x250`}
            alt={`ILOs header`}
          />
        </Box>
      </button>
      {expanded &&
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta}>
            <Text variant="h1">ZilStream (STREAM)</Text>
            <Text marginTop={1}>ZilSteam's premium membership token</Text>

            <Text variant="h1" color="primary" marginTop={3}>00:59:59</Text>

            <ProgressBar progress={92} marginTop={3} />

            <Box marginTop={1}>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Total Committed</Text>
                <Text color="textSecondary">$928,636.02 (92%)</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Funds to Raise</Text>
                <Text color="textSecondary">$1,000,000</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZWAP to Burn</Text>
                <Text color="textSecondary">$300,000</Text>
              </Box>
            </Box>

            <Text marginTop={3}>Commit your tokens in a fixed ratio.</Text>
            <Text color="textSecondary">30% ZWAP - 70% ZIL</Text>

            <Box marginTop={2}>
              <CurrencyInput fixedToToken
                label=""
                token={props.tokenState.tokens['zil1p5suryq6q647usxczale29cu3336hhp376c627']}
                amount={formState.zwapAmount}
                hideBalance={true}
                disabled={true} />

              <CurrencyInput fixedToToken
                label=""
                token={props.tokenState.tokens[ZIL_TOKEN_NAME]}
                amount={formState.zilAmount}
                hideBalance={true}
                disabled={true} />
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