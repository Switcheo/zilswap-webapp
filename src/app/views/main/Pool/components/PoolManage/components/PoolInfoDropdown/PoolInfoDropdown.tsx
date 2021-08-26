import { Box, BoxProps, Button, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropDownRounded, ArrowDropUpRounded } from "@material-ui/icons";
import { BigNumber } from "bignumber.js"
import { Link } from "react-router-dom";
import cls from "classnames";
import React, { useState } from "react";
import { actions } from "app/store";
import { useDispatch, useSelector } from "react-redux";
import { AmountLabel, ContrastBox, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
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
  const rewardsState = useSelector<RootState, RewardsState>((state) => state.rewards);
  const tokenState = useSelector<RootState, TokenState>((state) => state.token);
  const [active, setActive] = useState<boolean>(false);
  const poolPair: [string, string] = [token.symbol, "ZIL"];

  const onToggleDropdown = () => {
    setActive(!active);
  };

  const poolShare = token.pool?.contributionPercentage.shiftedBy(-2) ?? BIG_ZERO;
  const poolShareLabel = poolShare.shiftedBy(2).decimalPlaces(3).toString(10) ?? ""
  const tokenAmount = poolShare.times(token.pool?.tokenReserve ?? BIG_ZERO);
  const zilAmount = poolShare.times(token.pool?.zilReserve ?? BIG_ZERO);

  const poolValue = valueCalculators.pool(tokenState.prices, token);
  const depositedValue = poolShare.times(poolValue);

  const potentialRewards = rewardsState.potentialRewardsByPool[token.address].map(item => {
    const rewardToken = tokenState.tokens[item.token_address];
    return {
      rewardToken,
      amount: item.amount,
      value: valueCalculators.amount(tokenState.prices, rewardToken, item.amount),
    }
  })

  const roiPerDay = potentialRewards.reduce((acc, item) => acc.plus(item.value.div(7)), new BigNumber(0)) // TODO: fixme, use actual epoch instead of 7 days
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
          <KeyValueDisplay kkey={`Your Pool Share ${poolShareLabel}%`} ValueComponent="span">
            <AmountLabel
              justifyContent="flex-end"
              marginBottom={1}
              currency={token.symbol}
              address={token.address}
              amount={tokenAmount}
              compression={token.decimals} />
            <AmountLabel
              justifyContent="flex-end"
              currency="ZIL"
              address=""
              amount={zilAmount} />
            <Text variant="body2" className={classes.textGreen} align="right">
              ≈ ${toHumanNumber(depositedValue, 2)}
            </Text>
          </KeyValueDisplay>

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
