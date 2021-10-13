import { Avatar, Box, BoxProps, IconButton, ListItemIcon, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { Cheque } from "app/store/types";
import cls from "classnames";
import dayjs from "dayjs";
import React, { Fragment, useState } from "react";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";
import { truncateAddress } from "app/utils";

// TODO
// format row props
interface Props extends BoxProps {
  bid: Cheque,
  relatedBids?: Cheque[]
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  text: {
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '0.1px',
  },
  bodyCell: {
    extend: 'text',
    padding: "8px 16px",
    maxWidth: 200,
    margin: 0,
    border: "none",
    backgroundColor: "#0A2530",
  },
  actionCell: {
    padding: "8px 0px",
    maxWidth: 200,
    margin: 0,
    border: "none",
    backgroundColor: "#0A2530",
  },
  buttonText: {
    color: "#DEFFFF",
    opacity: "100%",
  },
  iconButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
    marginRight: 8,
  },
  item: {
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  withBorder: {
    '&:not(:last-child)': {
      borderBottom: "1px solid #29475A",
    }
  },
  slideAnimation: {
    animation: `$slideEffect 1000ms linear`,
    padding: 12,
  },
  "@keyframes slideEffect": {
    "100%": { transform: " translateY(0%)" }
  },
  expandCell: {
    height: 10,
    padding: 0,
    textAlign: "center",
    color: "#FFFFFF",
    border: "none",
    backgroundColor: "#0A2530",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  firstCell: {
    borderTopLeftRadius: "12px",
  },
  lastCell: {
    borderTopRightRadius: "12px",
  },
  firstRow: {
    marginTop: theme.spacing(1),
    padding: 12,

  },
  lastRow: {
    marginBottom: theme.spacing(1),
    padding: 12,
  },
  arrowIcon: {
    padding: "4px 24px",
    color: "#DEFFFF",
    borderRadius: "12px",
    marginBottom: "12px"
  },
  green: {
    color: "#00FFB0",
  },
  red: {
    color: "#FF5252",
  }
}));

const Row: React.FC<Props> = (props: Props) => {
  const { bid: baseBid, relatedBids = [] } = props;
  const [expand, setExpand] = useState(false);
  const classes = useStyles();

  return (
    <Fragment>
      <Box mt={1}></Box>
      {
        (expand ? [baseBid].concat(...relatedBids) : [baseBid]).map((bid: Cheque, index: number) => (
          <TableRow className={cls({ [classes.firstRow]: index === 0, [classes.slideAnimation]: index > 0 })}>
            <TableCell align="left" className={cls(classes.bodyCell, classes.firstCell)}>
              {
                index === 0 &&
                <MenuItem className={classes.item} button={false}>
                  <ListItemIcon>
                    <Avatar alt="Remy Sharp" src={bid.token.assetId} />
                  </ListItemIcon>
                  #{bid.token.tokenId}
                </MenuItem>
              }
            </TableCell>
            <TableCell align="right" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>{bid.price.amount} ZIL ($xxx)</TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}></TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>{bid.initiator?.username || truncateAddress(bid.initiatorAddress)}</TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>{dayjs(bid.createdAt).format("D MMM YYYY")}</TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>{dayjs(bid.expiry).format("MMM, DD, YYYY")}</TableCell>
            <TableCell align="center" className={cls(classes.actionCell, classes.lastCell, { [classes.withBorder]: expand })}>
              {bid.cancelTransactionHash === null && bid.matchTransactionHash === null && (
                <>
                  {/* <IconButton onClick={() => bid.actions?.accept.action ? bid.actions?.accept.action(bid) : null} className={classes.iconButton}>
                    <Typography className={classes.buttonText}>{bid.actions?.accept.label}</Typography>
                  </IconButton> */}
                  {/* <IconButton onClick={() => bid.actions?.decline.action ? bid.actions?.decline.action(bid) : null} className={classes.iconButton}>
                    <Typography className={classes.buttonText}>{bid.actions?.decline.label}</Typography>
                  </IconButton> */}
                </>
              )}
              <Typography
                className={cls({
                  [classes.green]: bid.status === 'Active',
                  [classes.red]: bid.status === 'Expired' || bid.status === 'Cancelled'
                })}
              >
                {bid.status}
              </Typography>
            </TableCell>
          </TableRow>
        ))
      }
      <TableRow className={classes.lastRow}>
        <TableCell className={classes.expandCell} colSpan={8}>
          {relatedBids && relatedBids.length > 0 && (
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={() => setExpand(!expand)}
              className={classes.arrowIcon}
            >
              {expand ? <UpArrow /> : <DownArrow />}
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <Box mb={1}></Box>
    </Fragment>
  );
};

export default Row;
