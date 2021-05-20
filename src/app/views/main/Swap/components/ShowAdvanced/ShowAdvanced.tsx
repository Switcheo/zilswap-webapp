import { Box, Divider, makeStyles, Typography } from "@material-ui/core";
import { ContrastBox } from "app/components";
import { RootState, SwapFormState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useMoneyFormatter } from "app/utils";
import React from "react";
import { useSelector } from "react-redux";
import { ExpiryField, SlippageField } from "app/components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  showAdvanced: {
    padding: theme.spacing(2.5, 8, 6.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2.5, 2, 6.5),
    },
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  text: {
    fontWeight: 400,
    letterSpacing: 0
  },
}));

const ShowAdvanced = (props: any) => {
  const { showAdvanced } = props;
  const classes = useStyles();
  const { inAmount, outAmount, inToken, outToken, expectedSlippage } = useSelector<RootState, SwapFormState>(store => store.swap);
  const moneyFormat = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 5 });

  if (!showAdvanced) return null;

  return (
    <ContrastBox className={classes.showAdvanced}>
      <Typography className={classes.text} variant="body2">
        You are giving{" "}
        <strong>{moneyFormat(inAmount, { maxFractionDigits: inToken?.decimals, symbol: inToken?.symbol })}</strong>
        {" "}for at least{" "}
        <strong>{moneyFormat(outAmount, { maxFractionDigits: outToken?.decimals, symbol: outToken?.symbol })}</strong>
      </Typography>
      <Typography className={classes.text} variant="body2">
        Expected price slippage <strong>{moneyFormat((expectedSlippage || 0) * 100)}%</strong>
      </Typography>
      <Divider className={classes.divider} />
      <Box display="flex" justifyContent="space-between">
        <SlippageField />
        <ExpiryField />
      </Box>
    </ContrastBox>
  )
}

export default ShowAdvanced;
