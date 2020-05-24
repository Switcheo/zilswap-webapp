
import { Box, Button, ButtonGroup, InputLabel, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ContrastBox, CurrencyInput, FancyButton } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";
import { ShowAdvanced } from "./components";
import { ReactComponent as MinusSVG } from "./minus_pool.svg";
import { ReactComponent as MinusSVGDark } from "./minus_pool_dark.svg";
import { RootState, TokenInfo } from "app/store/types";
import { useSelector } from "react-redux";

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
  },
  advanceDetails: {
    marginBottom: 26,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: theme.palette.text!.secondary,
    cursor: "pointer"
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
}));
const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const theme = useTheme<AppTheme>();
  return (
    <Box display="flex" flexDirection="column"  {...rest} className={cls(classes.root, className)}>
      <CurrencyInput label="Remove" token={poolToken} amount={0} />
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
      {theme.palette.type === "light" ? <MinusSVG className={classes.svg} /> : <MinusSVGDark className={classes.svg} />}
      <InputLabel>You Receive (Estimate)</InputLabel>
      <ContrastBox className={classes.readOnly}>
        <Typography>0.00</Typography>
      </ContrastBox>
      <FancyButton
        walletRequired
        className={classes.actionButton}
        variant="contained"
        color="primary"
        fullWidth>
        Remove Liquidity
      </FancyButton>

      <Typography
        variant="body2"
        className={cls(classes.advanceDetails, { [classes.primaryColor]: showAdvanced })}
        onClick={() => setShowAdvanced(!showAdvanced)}>
        Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <ShowAdvanced show={showAdvanced} />
    </Box>
  );
};

export default PoolWithdraw;