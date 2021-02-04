import { Box, Card, CardContent, CardProps, Divider, IconButton, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MoreVertOutlined } from "@material-ui/icons";
import { AmountLabel, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { actions } from "app/store";
import { PoolSwapVolumeMap, RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/constants";
import { bnOrZero, toHumanNumber } from "app/utils/strings/strings";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

interface Props extends CardProps {
  token: TokenInfo;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: theme.spacing(.5),
    boxShadow: theme.palette.cardBoxShadow,
  },
  title: {
    backgroundColor: theme.palette.background.contrastAlternate,
    padding: theme.spacing(3, 4)
  },
  poolIcon: {
    marginRight: theme.spacing(2),
  },
  content: {
    padding: theme.spacing(4),
  },
  rewardValue: {
    fontSize: '20px',
    lineHeight: '22px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
      lineHeight: '16px',
    },
  },
  rewardContainer: {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  roiContainer: {
    alignItems: "baseline",
    justifyContent: "flex-end",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-end",
    },
  },
  thinSubtitle: {
    fontWeight: 400,
  },

  dropdown: {
    "& .MuiMenu-list": {
      padding: theme.spacing(.5),
    },
  },
  dropdownItem: {
    borderRadius: theme.spacing(.5),
    minWidth: theme.spacing(15),
  },
}));

const PoolInfoCard: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const swapVolumes = useSelector<RootState, PoolSwapVolumeMap>(state => state.stats.dailySwapVolumes)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const classes = useStyles();

  const onShowActions = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const onCloseActions = () => {
    setMenuAnchor(null);
  };

  const onGotoAddLiquidity = () => {
    const network = ZilswapConnector.network;
    dispatch(actions.Pool.select({ network, token }));
    dispatch(actions.Layout.showPoolType("add"));
    history.push("/pool");
  }
  const { totalLiquidity, totalZilVolumeUSD } = useMemo(() => {
    if (token.isZil) {
      return { totalLiquidity: BIG_ZERO, totalZilVolumeUSD: BIG_ZERO };
    }

    const totalLiquidity = valueCalculators.pool(tokenState.prices, token);
    const totalZilVolume = swapVolumes[token.address]?.totalZilVolume ?? BIG_ZERO;
    const totalZilVolumeUSD = valueCalculators.amount(tokenState.prices, tokenState.tokens[ZIL_TOKEN_NAME], totalZilVolume);

    return {
      totalLiquidity,
      totalZilVolumeUSD,
    };
  }, [tokenState, token, valueCalculators, swapVolumes]);


  const {
    potentialRewards,
    // rewardsValue,
    roiLabel,
  } = React.useMemo(() => {
    if (!ZilswapConnector.network || !rewardsState.epochInfo) return {
      rewardsValue: BIG_ZERO,
      potentialRewards: BIG_ZERO,
      roiLabel: "-",
    };

    const poolRewards = bnOrZero(rewardsState.rewardByPools[token.address]?.weeklyReward);

    const zapContractAddr = ZWAPRewards.TOKEN_CONTRACT[ZilswapConnector.network] ?? "";
    const zapToken = tokenState.tokens[zapContractAddr];

    const rewardsValue = valueCalculators.amount(tokenState.prices, zapToken, poolRewards.shiftedBy(12));
    const roiPerEpoch = rewardsValue.dividedBy(totalLiquidity);
    const epochDuration = rewardsState.epochInfo.raw.epoch_period;
    const secondsInDay = 24 * 3600;
    const roiPerDay = bnOrZero(roiPerEpoch.dividedBy(epochDuration).times(secondsInDay).shiftedBy(2).decimalPlaces(2));

    return {
      potentialRewards: poolRewards,
      rewardsValue,
      roiLabel: roiPerDay.isZero() ? "-" : `${roiPerDay.toFormat()}%`,
    };
  }, [rewardsState.epochInfo, rewardsState.rewardByPools, token, totalLiquidity, tokenState.prices, tokenState.tokens, valueCalculators]);

  if (token.isZil) return null;

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardContent className={classes.title}>
        <Box display="flex" alignItems="center">
          <PoolLogo className={classes.poolIcon} pair={[token.symbol, "ZIL"]} />
          <Text variant="h2">{token.symbol} - ZIL</Text>
          <Box flex={1} />
          <IconButton onClick={onShowActions} size="small">
            <MoreVertOutlined />
          </IconButton>
          <Menu
            className={classes.dropdown}
            anchorEl={menuAnchor}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            open={!!menuAnchor}
            onClose={onCloseActions}>
            <MenuItem
              className={classes.dropdownItem}
              onClick={onGotoAddLiquidity}>
              Add Liquidity
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>
      <CardContent className={classes.content}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flex={1}>
            <Text color="textSecondary" variant="subtitle2" marginBottom={1.5}>ZWAP Rewards</Text>
            <Box display="flex" className={classes.rewardContainer} alignItems="baseline">
              <Text color="primary" className={classes.rewardValue} marginRight={1}>
                {potentialRewards.isZero() ? "-" : potentialRewards.toFormat()} ZWAP
              </Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ next epoch</Text>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" flex={1}>
            <Text color="textSecondary" align="right" variant="subtitle2" marginBottom={1.5}>ROI</Text>
            <Box display="flex" className={classes.roiContainer}>
              <Text color="textPrimary" className={classes.rewardValue} marginRight={1}>
                {roiLabel}
              </Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ daily</Text>
            </Box>
          </Box>
        </Box>

        <Box marginY={3.5}>
          <Divider color="primary" />
        </Box>

        <Box display="flex" flexDirection="column">
          <KeyValueDisplay marginBottom={2.25} kkey="Total Liquidity" ValueComponent="span">
            <Text>${toHumanNumber(totalLiquidity)}</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="Volume (24hrs)" ValueComponent="span">
            <AmountLabel
              hideIcon
              justifyContent="flex-end"
              currency="ZIL"
              amount={swapVolumes[token.address]?.totalZilVolume} />
            <Text align="right" variant="body2" color="textSecondary">
              ${toHumanNumber(totalZilVolumeUSD)}
            </Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="Current Pool Size" ValueComponent="span">
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <AmountLabel
                marginBottom={1}
                currency={token.symbol}
                amount={token.pool?.tokenReserve}
                compression={token.decimals} />
              <AmountLabel
                currency="ZIL"
                amount={token.pool?.zilReserve} />
            </Box>
          </KeyValueDisplay>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PoolInfoCard;
