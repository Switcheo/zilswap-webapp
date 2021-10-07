import { Avatar, Box, BoxProps, Card, CardContent, Checkbox, FormControlLabel, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal, FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { Bids } from "../bidtype";
import { ReactComponent as Checked } from "../assets/checked.svg";
import { ReactComponent as UnChecked } from "../assets/uncheck.svg";

interface Props extends BoxProps {
  showDialog: boolean;
  onCloseDialog: () => void;
  bid: Bids;
  isOffer: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    backgroundColor: "#0D1B24",
    padding: theme.spacing(2),
    minWidth: 320,
  },
  card: {
    background: "rgba(222, 255, 255, 0.1)",
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
  bearItem: {
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  checkboxText: {
    fontSize: 10
  },
  button: {
    borderRadius: "12px",
    display: "flex",
    padding: "18px 32px",
  },
  buttonText: {
    color: "#DEFFFF",
    padding: "8px, 16px",
  },
  backButton: {
    color: "#DEFFFF",
    background: "rgba(222, 255, 255, 0.1)",
    marginTop: theme.spacing(2),
  }
}));

const BidsDialog: React.FC<Props> = (props: Props) => {
  const { bid, isOffer, showDialog, onCloseDialog, children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <DialogModal
      open={showDialog}
      onClose={onCloseDialog}
      header={"Accept Bid"}
      {...rest}
    >
      <Box
        className={cls(classes.root, className)}
      >
        <Card className={classes.card}>
          <CardContent>
            <MenuItem className={classes.bearItem} button={false}>
              <ListItemIcon>
                <Avatar alt="Remy Sharp" src={bid.nft.asset?.url} />
              </ListItemIcon>
              <Typography>  {bid.nft.tokenId}</Typography>
            </MenuItem>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Bid Average</Typography>
              <Typography>{bid.bidAverage}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>{isOffer ? "Buyer" : "Seller"}</Typography>
              <Typography>{bid.user.name}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Expiration</Typography>
              <Typography className={classes.dateText}>{bid.expiration.format("DD MMM YYYY, HH:mm:ss")}&nbsp;
                <Typography
                  className={classes.activeGreen}
                >{bid.status}</Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <FormControlLabel
          label={<Typography className={classes.checkboxText}>By checking this box, I accept ARK’s terms and conditions.</Typography>}
          control={
            <Checkbox
              icon={<UnChecked />} checkedIcon={<Checked />}
            />
          }
        />
        <FancyButton variant="contained" color="primary" className={classes.button}>Accept Bid</FancyButton>
        <FancyButton
          variant="contained" fullWidth onClick={() => bid.actions?.decline.action ? bid.actions?.decline.action(bid) : null}
          className={cls(classes.button, classes.backButton)}>
          <Typography className={classes.buttonText}>{bid.actions?.decline.label}</Typography>
        </FancyButton>
      </Box>
    </DialogModal>
  );
};

export default BidsDialog;
