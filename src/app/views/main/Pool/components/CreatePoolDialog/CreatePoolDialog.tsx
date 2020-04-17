import { Button, DialogContent, InputLabel, makeStyles, OutlinedInput } from "@material-ui/core";
import { DialogModal, KeyValueDisplay } from "app/components";
import cls from "classnames";
import React, { useState } from "react";

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    width: 516,
    [theme.breakpoints.down("xs")]: {
      width: 296
    }
  },
  input: {
    marginBottom: 20,
  },
  inputProps: {
    [theme.breakpoints.down("xs")]: {
      '&::placeholder': {
        fontSize: "11px"
      }
    }
  },
  currencyBox: {
    padding: "8px 12px 10px 12px",
    marginTop: "0px !important",
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  currencyLogo: {
    marginRight: 10
  },
  currencies: {
    maxHeight: 460,
    overflowY: "scroll",
    [theme.breakpoints.down("xs")]: {
      maxHeight: 324,
    }
  },
  buttonBase: {
    width: "100%",
    marginTop: "2px",
    textAlign: "left",
  },
  actionButton: {
    height: 46,
    marginTop: 46,
    marginBottom: 48
  },
}));

const CreatePoolDialog = (props: any) => {
  const { children, className, open, onCloseDialog, onSelect, ...rest } = props;
  const classes = useStyles();
  const [address, setAddress] = useState("");

  return (
    <DialogModal header="Create Pool" open={open} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <InputLabel>Token Address</InputLabel>
        <OutlinedInput
          placeholder="Token Address"
          value={address}
          fullWidth
          className={classes.input}
          onChange={(e) => setAddress(e.target.value)}
          inputProps={{
            className: classes.inputProps
          }}
        />
        <KeyValueDisplay kkey={"Name"} value={"Zilliqua"} mb="8px" />
        <KeyValueDisplay kkey={"Symbol"} value={"ZIL"} mb="8px" />
        <KeyValueDisplay kkey={"Decimals"} value={"12"} mb="8px" />
        <Button
          className={classes.actionButton}
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => { }}
        >Create Pool</Button>
      </DialogContent>
    </DialogModal>
  )
}

export default CreatePoolDialog;