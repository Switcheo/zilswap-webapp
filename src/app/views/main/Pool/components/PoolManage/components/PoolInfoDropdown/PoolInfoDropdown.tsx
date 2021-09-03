import { Box, BoxProps, Button, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropDownRounded, ArrowDropUpRounded } from "@material-ui/icons";
import { Link } from "react-router-dom";
import cls from "classnames";
import React, { useState } from "react";
import { actions } from "app/store";
import { useDispatch, useSelector } from "react-redux";
import { AmountLabel, ContrastBox, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { PotentialRewards, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import { toHumanNumber } from "app/utils/strings/strings";
import { useValueCalculators, useNetwork } from "app/utils";

interface Props extends BoxProps {
  token: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  buttonWrapper: {
    borderRadius: "12px",
    padding: theme.spacing(1),
  },
  divider: {
    backgroundColor: "rgba(20,155,163,0.3)",
    margin: theme.spacing(1, 0),
  },
  textGreen: {
    marginTop: theme.spacing(0.2),
    color: theme.palette.primary.dark
  },
  arrowIcon: {
    color: theme.palette.label
  }
}));

const PoolInfoDropdown: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const potentialRewardsByPool = useSelector<RootState, PotentialRewards>((state) => state.rewards.potentialRewardsByPool);
  const tokenState = useSelector<RootState, TokenState>((state) => state.token);
  const [active, setActive] = useState<boolean>(false);
  const poolPair: [string, string] = [token.symbol, "ZIL"];

  const onToggleDropdown = () => {
    setActive(!active);
  };

  const poolShare = token.pool?.contributionPercentage.shiftedBy(-2) ?? BIG_ZERO;
  const poolShareLabel = poolShare.shiftedBy(2).decimalPlaces(3).toString(10) ?? "";
  const tokenAmount = poolShare.times(token.pool?.tokenReserve ?? BIG_ZERO);
  const zilAmount = poolShare.times(token.pool?.zilReserve ?? BIG_ZERO);

  const poolValue = valueCalculators.pool(tokenState.prices, token);
  const depositedValue = poolShare.times(poolValue);

  const rawPotentialRewards = potentialRewardsByPool[token.address] ?? [];
  const potentialRewards = rawPotentialRewards.map(item => {
    const rewardToken = tokenState.tokens[item.tokenAddress];
    return {
      rewardToken,
      amount: item.amount,
      value: valueCalculators.amount(tokenState.prices, rewardToken, item.amount),
    }
  })

  const roiPerDay = potentialRewards.reduce((acc, item) => acc.plus(item.value.div(700)), BIG_ZERO) // XXX: assumes a weekly epoch of 7 days
  const roiLabel = roiPerDay.isZero() ? "-" : `${toHumanNumber(roiPerDay, 2)}%`

  const onGotoAdd = () => {
    dispatch(actions.Pool.select({ token, network }));
    dispatch(actions.Layout.showPoolType("add"));
  };

  const onGotoRemove = () => {
    dispatch(actions.Pool.select({ token, network }));
    dispatch(actions.Layout.showPoolType("remove"));
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button variant="text" fullWidth className={classes.buttonWrapper} onClick={onToggleDropdown} disableRipple>
        <Box flex={1} display="flex" alignItems="center">
          <PoolLogo pair={poolPair} tokenAddress={token.address} />
          <Text marginLeft={1}>{poolPair.join(" - ")}</Text>
          <Box flex={1} />
          {active && <ArrowDropUpRounded className={classes.arrowIcon} />}
          {!active && <ArrowDropDownRounded className={classes.arrowIcon} />}
        </Box>
      </Button>
      {active && (
        <ContrastBox>
          <KeyValueDisplay marginBottom={1.5} kkey={`Your Pool Share (${poolShareLabel}%)`} ValueComponent="span">
            <AmountLabel
              iconStyle="small"
              justifyContent="flex-end"
              marginBottom={1}
              marginTop={-0.5}
              currency={token.symbol}
              address={token.address}
              amount={tokenAmount}
              compression={token.decimals} />
            <AmountLabel
              iconStyle="small"
              justifyContent="flex-end"
              currency="ZIL"
              address={ZIL_ADDRESS}
              amount={zilAmount} />
            <Text variant="body2" className={classes.textGreen} align="right">
              ≈ ${toHumanNumber(depositedValue, 2)}
            </Text>
          </KeyValueDisplay>
          {
            potentialRewards.map(reward => (
              [
              <KeyValueDisplay marginBottom={1.5} kkey="Your Potential Rewards" ValueComponent="span">
                <Text color="textPrimary">
                  {toHumanNumber(reward.amount.shiftedBy(-reward.rewardToken.decimals))} {reward.rewardToken.symbol}
                </Text>
                <Text variant="body2" className={classes.textGreen} align="right">
                  ≈ ${toHumanNumber(reward.value, 2)}
                </Text>
              </KeyValueDisplay>,
              <KeyValueDisplay marginBottom={1.5} kkey="ROI" ValueComponent="span">
                <Text color="textPrimary">{roiLabel} / daily</Text>
              </KeyValueDisplay>
              ]
            ))
          }

          <Box display="flex" marginTop={3}>
            <Button
              className={classes.buttonWrapper}
              onClick={onGotoAdd}
              variant="contained"
              color="primary"
              fullWidth>
              Add
            </Button>
            <Box margin={1} />
            <Button
              className={classes.buttonWrapper}
              onClick={onGotoRemove}
              component={Link}
              to="/pool"
              variant="contained"
              color="primary"
              fullWidth>
              Remove
            </Button>
          </Box>
        </ContrastBox>
      )}
      <Divider className={classes.divider} />
    </Box>
  );
};

export default PoolInfoDropdown;
