
import { Box, ButtonGroup, Button, Typography, InputLabel, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import CurrencyInput from "../CurrencyInput";
import { ReactComponent as MinusSVG } from "./minus_pool.svg";
import { ReactComponent as MinusSVGDark } from "./minus_pool_dark.svg";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  percentageButton: {
    borderRadius: 4,
    color: theme.palette.text?.secondary,
    paddingTop: 10,
    paddingBottom: 10
  },
  percentageGroup: {
    marginTop: 12,
    marginBottom: 20
  },
  input: {
    marginTop: 12,
    marginBottom: 20
  },
  svg: {
    alignSelf: "center",
    marginBottom: 12
  },
  actionButton: {
    marginTop: 45,
    height: 46
  },
  readOnly: {
    backgroundColor: theme.palette.background.readOnly,
    textAlign: "right",
    color: theme.palette.text?.secondary,
    marginBottom: 20
  }
}));
const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme<AppTheme>();
  return (
    <Box display="flex" flexDirection="column"  {...rest} className={cls(classes.root, className)}>
      <CurrencyInput
        label="Remove"
        name="withdraw"
      >
        <ButtonGroup fullWidth color="primary" className={classes.percentageGroup}>
          <Button className={classes.percentageButton}>
            <Typography variant="button">25%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">50%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">75%</Typography>
          </Button>
          <Button className={classes.percentageButton}>
            <Typography variant="button">100%</Typography
            ></Button>
        </ButtonGroup>
      </CurrencyInput>
      {theme.palette.type === "light" ? <MinusSVG className={classes.svg} /> : <MinusSVGDark className={classes.svg} />}
      <InputLabel>You Receive (Estimate)</InputLabel>
      <ContrastBox className={classes.readOnly}>
        <Typography>0.00</Typography>
      </ContrastBox>
    </Box>
  );
};

export default PoolWithdraw;