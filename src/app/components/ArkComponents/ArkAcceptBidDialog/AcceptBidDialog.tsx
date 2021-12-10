import React, { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import { useSelector } from "react-redux";
import cls from "classnames";
import dayjs from "dayjs";
import { Avatar, Box, BoxProps, Card, CardContent, CircularProgress, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { ArkCheckbox, CurrencyLogo, DialogModal, FancyButton } from "app/components";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { Cheque, RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { toSignificantNumber, valueCalculators } from "app/utils";

interface Props extends BoxProps {
  showDialog: boolean;
  onCloseDialog: () => void;
  bid: Cheque | null;
  isOffer: boolean;
  onAcceptBid: (bid: Cheque) => void;
  loading: boolean;
  blocktime: dayjs.Dayjs;
  currentBlock: number;
  awaitApproval: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF",
    padding: theme.spacing(2),
    maxWidth: 450,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px",
  },
  card: {
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF11" : "#6BE1FF33",
  },
  header: {
    opacity: 0.5,
  },
  dateText: {
    display: "flex",
    flexDirection: "row",
  },
  activeGreen: {
    color: "#00FFB0",
  },
  item: {
    padding: "0",
    width: "100%",
    margin: 0
  },
  checkboxText: {
    fontSize: 10
  },
  button: {
    borderRadius: "12px",
    display: "flex",
    padding: "18px 32px",
    backgroundColor: theme.palette.type === "dark" ? "#003340" : "#6BE1FF",
    color: theme.palette.text?.primary,
    alignItems: "center"
  },
  buttonText: {
    padding: "8px, 16px",
  },
  backButton: {
    color: theme.palette.text?.primary,
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#6BE1FF88",
    marginTop: theme.spacing(2),
    "&:hover": {
      opacity: 0.5
    }
  },
  doubleInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& > span:last-child': {
      fontSize: 10,
      opacity: 0.6,
      '&.large': {
        fontSize: 12,
      }
    }
  },
  amount: {
    fontWeight: 700,
    fontSize: 18,
  },
  tokenIcon: {
    width: 20,
    height: 20,
  },
  titleClass: {
    padding: `${theme.spacing(2, 3)}!important`,
  },
  headerClass: {
    fontSize: 12,
    fontWeight: 600,
    margin: theme.spacing(2, 0),
  },
  loadingIcon: {
    color: "rgba(255,255,255,.8)",
    marginLeft: 12,
  }
}));

const AcceptBidDialog: React.FC<Props> = (props: Props) => {
  const { awaitApproval, blocktime, currentBlock, onAcceptBid, loading, bid, isOffer, showDialog, onCloseDialog, children, className, ...rest } = props;
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  const bidRecord = useMemo(() => {
    if (!bid) return null;
    const expiry = blocktime.add((bid.expiry - currentBlock) * BLOCKS_PER_MINUTE, 'minutes')
    const priceToken = tokenState.tokens[toBech32Address(bid.price.address)]

    if (!priceToken) return null
    const priceAmount = new BigNumber(bid.price.amount).shiftedBy(-priceToken.decimals)
    const usdValue = valueCalculators.amount(tokenState.prices, priceToken, new BigNumber(bid.price.amount));
    return { priceAmount, usdValue, expiry, priceToken };
  }, [bid, blocktime, currentBlock, tokenState])

  if (!bid) return null;

  const acceptBid = () => {
    if (typeof onAcceptBid === "function") {
      onAcceptBid(bid);
    }
  }

  const getButtonText = () => {
    if (!loading) return "Accept Bid";
    if (awaitApproval) return "Await Tx Approval";
    return "Processing"
  }

  return (
    <DialogModal
      open={showDialog}
      onClose={!loading ? onCloseDialog : () => { }}
      header={"Accept Bid"}
      titlePadding={true}
      titleClassname={classes.titleClass}
      {...rest}
    >
      <Box
        className={cls(classes.root, className)}
      >
        <Box mb={2} textAlign="center">
          <Typography variant="body1">Please review the bid before accepting it. Once accepted, the sale is final and cannot be undone.</Typography>
        </Box>
        <Card className={classes.card}>
          <CardContent>
            <MenuItem className={classes.item} button={false}>
              <Box width="100%" display="flex" alignItems="center">
                <Box display="flex" alignItems="center">
                  <ListItemIcon>
                    <Avatar alt="NFT Image" src={bid.token.asset.sourceUrl} />
                  </ListItemIcon>
                  <Box>
                    <Typography>{bid.token.tokenId}</Typography>
                    <Typography>{bid.token.collection.name}</Typography>
                  </Box>
                </Box>
                <Box flexGrow={1} />
                <Box>
                  <Box className={classes.doubleInfo}>
                    {bidRecord?.priceAmount && (
                      <Box display="flex" alignItems="center" component="span">
                        <strong className={classes.amount}>
                          {toSignificantNumber(bidRecord.priceAmount)}
                        </strong> <CurrencyLogo className={classes.tokenIcon} currency={bidRecord.priceToken.symbol} address={bidRecord.priceToken.address} />
                      </Box>
                    )}
                    {bidRecord?.usdValue && (
                      <Box className="large" component="span">${bidRecord.usdValue.toFormat(2)}</Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </MenuItem>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>From</Typography>
              <Typography>{bid.initiator?.username ?? bid.initiator?.email ?? bid.initiatorAddress}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Received on</Typography>
              <Typography>{dayjs(bid.createdAt).format("DD MMM YYYY, HH:mm:ss")}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Expiration</Typography>
              {bidRecord?.expiry && <Typography className={cls(classes.dateText, classes.activeGreen)}>{dayjs(bidRecord.expiry).fromNow()}</Typography>}
            </Box>
          </CardContent>
        </Card>

        <ArkCheckbox
          lineHeader="By checking this box, I accept ARKY’s terms and conditions."
          isChecked={checked}
          onChecked={setChecked}
          headerClass={classes.headerClass}
        />
        <FancyButton
          onClick={() => acceptBid()}
          disabled={loading || !checked}
          variant="contained" color="primary"
          className={classes.button}
        >
          {getButtonText()}{loading && (<CircularProgress size={24} className={classes.loadingIcon} />)}
        </FancyButton>
        <FancyButton
          disabled={loading}
          variant="contained" fullWidth onClick={() => onCloseDialog()}
          className={cls(classes.button, classes.backButton)}>
          Back
        </FancyButton>
      </Box>
    </DialogModal>
  );
};

export default AcceptBidDialog;
