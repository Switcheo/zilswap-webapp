import { Box, Button, ButtonGroup, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import CurrencyInput from "../CurrencyInput";
import { ReactComponent as PlusSVG } from "./plus_pool.svg";
import { ReactComponent as PlusSVGDark } from "./plus_pool_dark.svg";

const useStyles = makeStyles(theme => ({
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
    alignSelf: "center"
  },
}));
const PoolDeposit: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <CurrencyInput
        fixed
        label="Deposit"
        name="deposit"
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
            <Typography variant="button">100%</Typography>
          </Button>
        </ButtonGroup>
      </CurrencyInput>
      {theme.palette.type === "light" ? <PlusSVG className={classes.svg} /> : <PlusSVGDark className={classes.svg} />}
      <CurrencyInput
        label="Deposit"
        name="deposit1"
        className={classes.input}
      />
    </Box>
  );
};

export default PoolDeposit;