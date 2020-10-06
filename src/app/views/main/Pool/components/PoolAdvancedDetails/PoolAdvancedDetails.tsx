import { Box, makeStyles } from "@material-ui/core";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { ExpiryField, SlippageField } from "app/components";
import React from "react";


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {

  },
  showAdvanced: {
    padding: theme.spacing(4.5, 8, 6.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2.5, 2, 6.5),
    },
  },
}));

const PoolAdvancedDetails = (props: any) => {
  const { show } = props;
  const classes = useStyles();

  if (!show) return null;

  return (
    <ContrastBox className={classes.showAdvanced}>
      <Box display="flex" justifyContent="space-between">
        <SlippageField label="Set Limit Transaction Slippage" />
        <ExpiryField />
      </Box>
    </ContrastBox>
  )
}

export default PoolAdvancedDetails;
