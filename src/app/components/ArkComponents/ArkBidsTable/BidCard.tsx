import React, { useState } from "react";
import { Avatar, Box, Card, CardContent, CardProps, Collapse, IconButton, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import cls from "classnames";
import BigNumber from "bignumber.js"
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { FancyButton } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { getChequeStatus } from "core/utilities/ark"
import { RootState, TokenState } from "app/store/types";
import { truncateAddress, useValueCalculators } from "app/utils";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";

interface Props extends CardProps {
  showItem: boolean
  bid: Cheque
  relatedBids?: Cheque[]
  blockTime: Dayjs
  currentBlock: number
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    background: "rgba(222, 255, 255, 0.1)",
    marginBottom: theme.spacing(2),
  },
  item: {
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  amount: {
    fontWeight: 800,
  },
  dateText: {
    display: "flex",
    flexDirection: "row",
    color: theme.palette.primary.contrastText,
  },
  actionButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
    display: "flex",
    width: "50%",
    padding: "12px 32px",
  },
  actionArea: {
    display: "flex",
    justifyContent: "center",
  },
  arrowIcon: {
    padding: "4px 24px",
    color: "#DEFFFF",
    borderRadius: "12px",
    marginBottom: "6px"
  },
  topBorder: {
    borderTop: "1px solid #29475A",
  },
  green: {
    color: "#00FFB0",
  },
  red: {
    color: "#FF5252",
  },
  buttonText: {
    color: "#DEFFFF",
    padding: "8px, 16px",
  },
  header: {
    color: theme.palette.primary.contrastText,
    opacity: 0.5,
  },
  text: {
    color: theme.palette.primary.contrastText,
  }
}));

const BidCard: React.FC<Props> = (props: Props) => {
  const { bid, relatedBids, currentBlock, blockTime, showItem } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState(false);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const valueCalculators = useValueCalculators();

  const getCardContent = (bid: Cheque, isInitial: boolean) => {
    const status = getChequeStatus(bid, currentBlock)
    const expiryTime = blockTime.add(15 * (bid.expiry - currentBlock), 'seconds')
    const priceToken = tokenState.tokens[toBech32Address(bid.price.address)]
    if (!priceToken) return null
    const priceAmount = new BigNumber(bid.price.amount).shiftedBy(-priceToken.decimals)
    const usdValue = valueCalculators.amount(tokenState.prices, priceToken, priceAmount)

    return (
      <CardContent>
        {
          showItem &&
          <MenuItem className={classes.item} button={false}>
            <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
              <ListItemIcon>
                <Avatar alt="Remy Sharp" src={bid.token.asset.url} />
              </ListItemIcon>
              {
                isInitial &&
                <Box>
                  <Typography>#{bid.token.tokenId}</Typography>
                </Box>
              }
            </Box>
          </MenuItem>
        }
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Date</Typography>
          <Typography>{dayjs(bid.createdAt).format("D MMM YYYY")}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Amount</Typography>
          <Typography>
            <strong className={classes.amount}>
              {priceAmount.toFormat(priceAmount.gte(1) ? 2 : priceToken.decimals)}
            </strong> {priceToken.symbol} (${usdValue.toFormat(2)})
          </Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Versus Floor</Typography>
          <Typography>NYI</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>{bid.side === 'buy' ? "Buyer" : "Seller"}</Typography>
          <Typography>{bid.initiator?.username || truncateAddress(bid.initiatorAddress)}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Expiration</Typography>
          <Typography className={classes.dateText}>{expiryTime.format("D MMM YYYY HH:mm:ss")}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Status</Typography>
          <Typography className={(status === 'Expired' || status === 'Cancelled') ? classes.red : classes.green}>
            {status}
          </Typography>
        </Box>
        {
          status === 'Active' && <Box mt={2} display="flex" justifyContent="center">
            <Box flexGrow={1}>
              <FancyButton variant="contained" fullWidth onClick={() => null} className={classes.actionButton}>
                <Typography className={classes.buttonText}>Accept</Typography>
              </FancyButton>
            </Box>
          </Box>
        }
      </CardContent>
    )
  }

  return (
    <Card className={cls(classes.root)}>
      {getCardContent(bid, true)}
      <Collapse in={expand}>
        {relatedBids?.map((bids) => (
          <>
            <Box paddingLeft={2} paddingRight={2}>
              <Box className={classes.topBorder}></Box>
            </Box>
            {getCardContent(bids, false)}
          </>
        ))}
      </Collapse>
      {relatedBids?.length && (
        <Box className={classes.actionArea}>
          <IconButton
            aria-label="expand row"
            size="medium"
            onClick={() => setExpand(!expand)}
            className={classes.arrowIcon}
          >
            {expand ? <UpArrow /> : <DownArrow />}
          </IconButton>
        </Box>
      )}
    </Card>
  );
};

export default BidCard;
