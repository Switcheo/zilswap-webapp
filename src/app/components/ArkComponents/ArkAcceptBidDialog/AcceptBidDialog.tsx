import React from "react";
import { Avatar, Box, BoxProps, Card, CardContent, Checkbox, FormControlLabel, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { DialogModal, FancyButton } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ReactComponent as Checked } from "../assets/checked.svg";
import { ReactComponent as UnChecked } from "../assets/uncheck.svg";

interface Props extends BoxProps {
  showDialog: boolean;
  onCloseDialog: () => void;
  bid: Cheque;
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
  item: {
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

const AcceptBidDialog: React.FC<Props> = (props: Props) => {
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
            <MenuItem className={classes.item} button={false}>
              <ListItemIcon>
                <Avatar alt="NFT Image" src={bid.token.assetId} />
              </ListItemIcon>
              <Typography>{bid.token.tokenId}</Typography>
            </MenuItem>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Amount</Typography>
              <Typography>{bid.price.amount}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>{isOffer ? "Buyer" : "Seller"}</Typography>
              <Typography>{bid.initiatorAddress}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography className={classes.header}>Expiration</Typography>
              <Typography className={classes.dateText}>{bid.expiry}&nbsp;
                <Typography
                  className={classes.activeGreen}
                >Status</Typography>
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
        {/* <FancyButton
          variant="contained" fullWidth onClick={() => bid.actions?.decline.action ? bid.actions?.decline.action(bid) : null}
          className={cls(classes.button, classes.backButton)}>
          <Typography className={classes.buttonText}>{bid.actions?.decline.label}</Typography>
        </FancyButton> */}
      </Box>
    </DialogModal>
  );
};

export default AcceptBidDialog;
