import { Box, BoxProps, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { KeyValueDisplay, LoadableArea } from "app/components";
import { PlaceholderStrings } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { zilParamsToMap } from "core/utilities";
import { Contract, getBalancesMap, toBech32Address, ZilliqaValidate, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";


const useStyles = makeStyles(theme => ({
  root: {
  },
  input: {
    marginBottom: 20,
  },
  inputError: {
    border: `1px solid ${theme.palette.error.main}`
  },
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px!important"
    },
    padding: "18.5px 14px!important"
  },
  preview: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  error: {
    float: "right",
  },
  floatLeft: {
    float: "left",
  },
}));

export interface AddressInputProps extends React.HTMLAttributes<HTMLFormElement> {
  label: string;
  placeholder: string;
  address: string;

  onAddressChange?: (value: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = (props: any) => {
  const { children, className, label, placeholder, address, onAddressChange, ...rest } = props;
  const classes = useStyles();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onAddressChange === "function") {
      onAddressChange(event.target.value);
    }
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel className={classes.floatLeft}>{label}</InputLabel>
      <OutlinedInput
        placeholder={placeholder}
        value={address}
        fullWidth
        className={cls(classes.input)}
        onChange={onChange}
        classes={{ input: classes.inputText }}
      />
    </Box>
  );
};

export default AddressInput;
