import { Box, BoxProps, Button, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropDownOutlined, ArrowDropUpOutlined } from "@material-ui/icons";
import { AmountLabel, ContrastBox, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/contants";
import { Link } from "react-router-dom";
import cls from "classnames";
import React, { useState } from "react";
import { actions } from "app/store";
import { useDispatch } from "react-redux";
import { ZilswapConnector } from "core/zilswap";

interface Props extends BoxProps {
  token: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  buttonWrapper: {
    borderRadius: theme.spacing(.5),
    padding: theme.spacing(1),
  },
  divider: {
    backgroundColor: "rgba(20,155,163,0.3)",
    margin: theme.spacing(1, 0),
  },
  removeButton: {
    borderRadius: theme.spacing(.5),
  },
}));

const PoolInfoDropdown: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [active, setActive] = useState<boolean>(false);
  const poolPair: [string, string] = [token.symbol, "ZIL"];

  const onToggleDropdown = () => {
    setActive(!active);
  };

  const {
    poolShare,
    tokenAmount,
    zilAmount,
  } = React.useMemo(() => {
    const userPoolPercent = token.pool?.contributionPercentage.shiftedBy(-2);
    const tokenAmount = userPoolPercent?.times(token.pool?.tokenReserve ?? BIG_ZERO);
    const zilAmount = userPoolPercent?.times(token.pool?.zilReserve ?? BIG_ZERO);

    return {
      poolShare: userPoolPercent?.decimalPlaces(3).toString(10) ?? "",
      tokenAmount,
      zilAmount,
    }
  }, [token]);

  const onGotoAdd = () => {
    const network = ZilswapConnector.network;
    dispatch(actions.Pool.select({ token, network }));
    dispatch(actions.Layout.showPoolType("add"));
  };

  const onGotoRemove = () => {
    const network = ZilswapConnector.network;
    dispatch(actions.Pool.select({ token, network }));
    dispatch(actions.Layout.showPoolType("remove"));
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button variant="text" fullWidth className={classes.buttonWrapper} onClick={onToggleDropdown}>
        <Box flex={1} display="flex" alignItems="center">
          <PoolLogo pair={poolPair} />
          <Text marginLeft={1}>{poolPair.join(" - ")}</Text>
          <Box flex={1} />
          {active && <ArrowDropUpOutlined color="primary" />}
          {!active && <ArrowDropDownOutlined color="primary" />}
        </Box>
      </Button>
      {active && (
        <ContrastBox>
          <KeyValueDisplay marginBottom={1.5} kkey="Your Potential Rewards" ValueComponent="span">
            <Text color="primary">421 ZAP</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={1.5} kkey="ROI" ValueComponent="span">
            <Text color="textPrimary">1.42% / daily</Text>
          </KeyValueDisplay>
          <KeyValueDisplay kkey={`Your Pool Share ${poolShare}%`} ValueComponent="span">
            <AmountLabel
              justifyContent="flex-end"
              marginBottom={1}
              currency={token.symbol}
              amount={tokenAmount}
              compression={token.decimals} />
            <AmountLabel
              justifyContent="flex-end"
              currency="ZIL"
              amount={zilAmount} />
          </KeyValueDisplay>

          <Box display="flex" marginTop={3}>
            <Button
              onClick={onGotoAdd}
              variant="contained"
              color="primary"
              fullWidth>
              Add
            </Button>
            <Box margin={1} />
            <Button
              onClick={onGotoRemove}
              className={classes.removeButton}
              component={Link}
              to="/pool"
              variant="outlined"
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
