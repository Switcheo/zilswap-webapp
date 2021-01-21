import { Box, Card, CardContent, CardProps, Divider, IconButton, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MoreVertOutlined } from "@material-ui/icons";
import { AmountLabel, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { actions } from "app/store";
import { PoolSwapVolumeMap, RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
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
  const tokenPrices = useSelector<RootState, { [index: string]: BigNumber }>(state => state.token.prices);
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

  const { totalLiquidity } = React.useMemo(() => {
    if (token.isZil) {
      return { totalLiquidity: BIG_ZERO };
    }

    const totalLiquidity = valueCalculators.pool(tokenPrices, token);

    return {
      totalLiquidity,
    };
  }, [tokenPrices, token, valueCalculators]);


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
            <Text color="textSecondary" variant="subtitle2" marginBottom={1.5}>ZAP Rewards</Text>
            <Box display="flex" alignItems="baseline">
              <Text color="primary" className={classes.rewardValue} marginRight={1} isPlaceholder>281,180 ZAP</Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ next epoch</Text>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" flex={1}>
            <Text color="textSecondary" align="right" variant="subtitle2" marginBottom={1.5}>ROI</Text>
            <Box display="flex" alignItems="baseline" justifyContent="flex-end">
              <Text color="textPrimary" className={classes.rewardValue} marginRight={1} isPlaceholder>1.42%</Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ daily</Text>
            </Box>
          </Box>
        </Box>

        <Box marginY={3.5}>
          <Divider color="primary" />
        </Box>

        <Box display="flex" flexDirection="column">
          <KeyValueDisplay marginBottom={2.25} kkey="Total Liquidity" ValueComponent="span">
            <Text>${totalLiquidity.toFormat(2)}</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="Volume (24hrs)" ValueComponent="span">
            <AmountLabel
              hideIcon
              currency="ZIL"
              amount={swapVolumes[token.address]?.totalZilVolume} />
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
