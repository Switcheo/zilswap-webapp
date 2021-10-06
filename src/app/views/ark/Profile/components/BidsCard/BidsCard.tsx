import { Avatar, Box, CardProps, Card, CardContent, Chip, Collapse, IconButton, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import { snakeToTitle } from "app/utils";
import cls from "classnames";
import dayjs from "dayjs";
import React, { useState } from "react";
import { SimpleMap } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { ReactComponent as DownArrow } from "../assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "../assets/up-arrow.svg";
import { Bids, RowAction } from "../bidtype";

interface Props extends CardProps {
  baseCard: Bids,
  extraCards: Bids[],
  isBuyer: boolean,
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    background: "rgba(222, 255, 255, 0.1)",
    marginBottom: theme.spacing(2),
  },
  bearItem: {
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
  activeGreen: {
    color: "#00FFB0",
  },
  expiredRed: {
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

const BidsCard: React.FC<Props> = (props: Props) => {
  const { isBuyer, baseCard, extraCards, children, className, ...rest } = props;
  const classes = useStyles();
  const [expand, setExpand] = useState(false);

  const getBidAverage = (bidAverage: string) => {
    return <Box mt={1} display="flex" justifyContent="space-between">
      <Typography className={classes.header}>Bid Average</Typography>
      <Typography>{bidAverage}</Typography>
    </Box>
  }

  const getUserText = (name: string) => {
    return <Box mt={1} display="flex" justifyContent="space-between">
      <Typography className={classes.header}>{isBuyer ? "Buyer" : "Seller"}</Typography>
      <Typography>{name}</Typography>
    </Box>
  }

  const getExpiration = (date: dayjs.Dayjs, status: string) => {
    return <Box mt={1} display="flex" justifyContent="space-between">
      <Typography className={classes.header}>Expiration</Typography>
      <Typography className={classes.dateText}>{date.format("DD MMM YYYY, HH:mm:ss")}&nbsp;
        <Typography
          className={
            (status.toLocaleLowerCase() === "rejected" || status.toLocaleLowerCase() === "expired")
              ? classes.expiredRed
              : classes.activeGreen
          }
        >{status}</Typography>
      </Typography>
    </Box>
  }

  const getAction = (card: Bids, actions?: SimpleMap<RowAction>,) => {
    if (!actions) return (
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Chip
          className={(card.status.toLocaleLowerCase() === "expired" || card.status.toLocaleLowerCase() === "rejected") ? classes.expiredRed : classes.activeGreen}
          size="small" label={snakeToTitle(card.status)} variant="outlined"
        />
      </Box>
    )

    return (
      <Box mt={2} display="flex" justifyContent="center">
        {actions.accept && (
          <Box flexGrow={1} marginRight={actions.decline ? .5 : 0}>
            <FancyButton variant="contained" fullWidth onClick={() => actions?.accept.action ? actions?.accept.action(card) : null} className={classes.actionButton}>
              <Typography className={classes.buttonText}>{actions?.accept.label}</Typography>
            </FancyButton>
          </Box>
        )}
        {actions.decline && (
          <Box flexGrow={1} marginLeft={actions.accept ? .5 : 0}>
            <FancyButton variant="contained" fullWidth onClick={() => actions?.decline.action ? actions?.decline.action(card) : null} className={classes.actionButton}>
              <Typography className={classes.buttonText}>{actions?.decline.label}</Typography>
            </FancyButton>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Card className={cls(classes.root, className)} {...rest}>
      <CardContent>
        <MenuItem className={classes.bearItem} button={false}>
          <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src={baseCard.nft.asset?.url} />
            </ListItemIcon>
            <Box>
              <Typography>  {baseCard.nft.token_id}</Typography>
              <Typography>  {baseCard.nft.name}</Typography>
            </Box>
          </Box>
        </MenuItem>
        {getBidAverage(baseCard.bidAverage)}
        {getUserText(baseCard.user.name)}
        {getExpiration(baseCard.expiration, baseCard.status)}
        {getAction(baseCard, baseCard.actions)}
      </CardContent>
      <Collapse in={expand}>
        {extraCards.map((extra) => (
          <>
            <Box paddingLeft={2} paddingRight={2}>
              <Box className={classes.topBorder}></Box>
            </Box>
            <CardContent>
              <MenuItem className={classes.bearItem} button={false}>
                <ListItemIcon>
                  <Avatar alt="Remy Sharp" src={extra.nft.asset?.url} />
                </ListItemIcon>
                <Typography>  {extra.nft.token_id}</Typography>
              </MenuItem>
              {getBidAverage(extra.bidAverage)}
              {getUserText(extra.user.name)}
              {getExpiration(extra.expiration, extra.status)}
              {getAction(extra, extra.actions)}
            </CardContent>
          </>
        ))}
      </Collapse>
      {extraCards && extraCards.length > 0 && (
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

export default BidsCard;
