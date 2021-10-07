import { Avatar, Box, BoxProps, IconButton, ListItemIcon, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import dayjs from "dayjs";
import React, { Fragment, useState } from "react";
import { Bids } from "../bidtype";
import { ReactComponent as DownArrow } from "../assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "../assets/up-arrow.svg";

// TODO
// format row props
interface Props extends BoxProps {
  baseRow: Bids,
  extraRows?: Bids[]
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  iconButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
    marginRight: 8,
  },
  buttonText: {
    color: "#DEFFFF",
    opacity: "100%",
  },
  bodyCell: {
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
  bearItem: {
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  withBorder: {
    borderBottom: "1px solid #29475A",
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
  activeGreen: {
    color: "#00FFB0",
  },
  expiredRed: {
    color: "#FF5252",
  }
}));

const isNotLast = (current: number, maxLength: number) => {
  if (current === (maxLength - 1)) return false;

  return true;
}

const ArkCollapsibleRow: React.FC<Props> = (props: Props) => {
  const { baseRow, extraRows } = props;
  const [expand, setExpand] = useState(false);
  const classes = useStyles();

  return (
    <Fragment>
      <Box mt={1}></Box>
      <TableRow className={classes.firstRow}>
        <TableCell align="left" className={cls(classes.bodyCell, classes.firstCell)}>
          <MenuItem className={classes.bearItem} button={false}>
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src={baseRow.nft.asset?.url} />
            </ListItemIcon>
            <Typography>  {baseRow.nft.tokenId}</Typography>
          </MenuItem>
        </TableCell>
        <TableCell align="right" className={cls(classes.bodyCell, expand && classes.withBorder)}>{baseRow.bidCurrency}</TableCell>
        <TableCell align="right" className={cls(classes.bodyCell, expand && classes.withBorder)}>{baseRow.usdPrice.toString()}</TableCell>
        <TableCell align="center" className={cls(classes.bodyCell, expand && classes.withBorder)}>{baseRow.bidAverage}</TableCell>
        <TableCell align="center" className={cls(classes.bodyCell, expand && classes.withBorder)}>{baseRow.user.name}</TableCell>
        <TableCell align="center" className={cls(classes.bodyCell, expand && classes.withBorder)}>{baseRow.bidTime.format("MMM, DD, YYYY")}</TableCell>
        <TableCell align="center" className={cls(classes.bodyCell, expand && classes.withBorder)}>
          <Box>
            <Typography>{dayjs(baseRow.expiration).format("MMM, DD, YYYY")}</Typography>
          </Box>
        </TableCell>
        <TableCell align="center" className={cls(classes.actionCell, classes.lastCell, expand && classes.withBorder)}>
          {baseRow.status === "active" && (
            <>
              {baseRow.actions?.accept.action && (
                <IconButton onClick={() => baseRow.actions?.accept.action ? baseRow.actions?.accept.action(baseRow) : null} className={classes.iconButton}>
                  <Typography className={classes.buttonText}>{baseRow.actions?.accept.label}</Typography>
                </IconButton>
              )}
              {baseRow.actions?.decline.action && (
                <IconButton onClick={() => baseRow.actions?.decline.action ? baseRow.actions?.decline.action(baseRow) : null} className={classes.iconButton}>
                  <Typography className={classes.buttonText}>{baseRow.actions?.decline.label}</Typography>
                </IconButton>
              )}
            </>
          )}
          {(baseRow.status.toLocaleLowerCase() === "expired" || baseRow.status.toLocaleLowerCase() === "rejected") && (
            <Typography className={classes.expiredRed}>{baseRow.status}</Typography>
          )}
          {baseRow.status.toLocaleLowerCase() === "purchased" && (
            <Typography className={classes.activeGreen}>{baseRow.status}</Typography>
          )}
        </TableCell>
      </TableRow>
      {expand && extraRows?.map((row: Bids, index: number) => (
        <TableRow className={classes.slideAnimation}>
          <TableCell align="left" className={classes.bodyCell}>
          </TableCell>
          <TableCell align="right" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>{row.bidCurrency}</TableCell>
          <TableCell align="right" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>{row.usdPrice.toString()}</TableCell>
          <TableCell align="center" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>{row.bidAverage}</TableCell>
          <TableCell align="center" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>{row.user.name}</TableCell>
          <TableCell align="center" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>{row.bidTime.format("MMM, DD, YYYY")}</TableCell>
          <TableCell align="center" className={cls(classes.bodyCell, isNotLast(index, extraRows.length) && classes.withBorder)}>
            <Box>
              <Typography>{dayjs(baseRow.expiration).format("MMM, DD, YYYY")}</Typography>
            </Box>
          </TableCell>
          <TableCell align="center" className={cls(classes.actionCell, isNotLast(index, extraRows.length) && classes.withBorder)}>
            {row.status.toLocaleLowerCase() === "active" && (
              <>
                {row.actions?.accept.action && (
                  <IconButton onClick={() => row.actions?.accept.action ? row.actions?.accept.action(row) : null} className={classes.iconButton}>
                    <Typography className={classes.buttonText}>{row.actions?.accept.label}</Typography>
                  </IconButton>
                )}
                {row.actions?.decline.action && (
                  <IconButton onClick={() => row.actions?.decline.action ? row.actions?.decline.action(row) : null} className={classes.iconButton}>
                    <Typography className={classes.buttonText}>{row.actions?.decline.label}</Typography>
                  </IconButton>
                )}
              </>
            )}
            {(row.status.toLocaleLowerCase() === "expired" || row.status.toLocaleLowerCase() === "rejected") && (
              <Typography className={classes.expiredRed}>{row.status}</Typography>
            )}
            {row.status.toLocaleLowerCase() === "purchased" && (
              <Typography className={classes.activeGreen}>{row.status}</Typography>
            )}
          </TableCell>
        </TableRow>
      ))}
      <TableRow className={classes.lastRow}>
        <TableCell className={classes.expandCell} colSpan={8}>
          {extraRows && extraRows.length > 0 && (
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

export default ArkCollapsibleRow;
