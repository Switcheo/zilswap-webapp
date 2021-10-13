import React, { useState } from "react";
import { Avatar, Box, Card, CardContent, CardProps, Chip, Collapse, IconButton, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import dayjs from "dayjs";
import { FancyButton } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";

interface Props extends CardProps {
  bid: Cheque,
  relatedBids?: Cheque[],
  isBuyer: boolean,
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
  dateText: {
    display: "flex",
    flexDirection: "row",
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
    opacity: 0.5,
  }
}));

const BidCard: React.FC<Props> = (props: Props) => {
  const { isBuyer, bid, relatedBids, children, className, ...rest } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState(false);

  const getCardContent = (bid: Cheque, isInitial: boolean) => {
    return (
      <CardContent>
        <MenuItem className={classes.item} button={false}>
          <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src={bid.token.assetId} />
            </ListItemIcon>
            {
              isInitial &&
              <Box>
                <Typography>{bid.token.tokenId}</Typography>
                <Typography>{bid.token.collectionAddress}</Typography>
              </Box>
            }
          </Box>
        </MenuItem>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Offer Strength</Typography>
          <Typography></Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>{isBuyer ? "Buyer" : "Seller"}</Typography>
          <Typography>{bid.initiatorAddress}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Expiration</Typography>
          <Typography className={classes.dateText}>{dayjs(bid.expiry).format("DD MMM YYYY, HH:mm:ss")}&nbsp;
            <Typography
              className={(bid.status === 'Expired' || bid.status === 'Cancelled') ? classes.red : classes.green}
            >{bid.status}</Typography>
          </Typography>
        </Box>
        {
          bid.status === 'Expired' || bid.status === 'Cancelled' ?
          <Box mt={1} display="flex" justifyContent="flex-end">
            <Chip
              className={classes.red}
              size="small" label={bid.status} variant="outlined"
            />
          </Box>
          :
          <Box mt={2} display="flex" justifyContent="center">
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
    <Card className={cls(classes.root, className)} {...rest}>
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
