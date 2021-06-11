import { Box, BoxProps, Button, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ContrastBox, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PoolInfoDropdown } from "./components";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    padding: theme.spacing(2, 4, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  viewPoolsButton: {
    "& svg": {
      marginLeft: theme.spacing(1),
    },
  },
  actionButton: {
    height: 46
  },
  newLinkIcon: {
    "& path": {
      fill: theme.palette.icon
    }
  }
}));

const PoolManage: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const {
    tokens,
  } = React.useMemo(() => {

    const tokens = Object.values(tokenState.tokens).reduce((accum, token) => {
      if (token.pool?.contributionPercentage.gt(0))
        accum.push(token);
      return accum;
    }, [] as TokenInfo[])

    return {
      tokens,
    };
  }, [tokenState]);

  const onGotoAdd = () => {
    dispatch(actions.Layout.showPoolType("add"));
  };

  const onConnectWallet = () => {
    if (loadingConnectWallet) return;

    dispatch(actions.Layout.toggleShowWallet("open"));
  };

  return (
    <Box display="flex" flexDirection="column" {...rest} className={cls(classes.root, className)}>
      <Text variant="h4">Your Pools</Text>

      {!loadingConnectWallet && (
        <Box marginTop={2} marginBottom={5}>
          {tokens.map((token) => (
            <PoolInfoDropdown key={token.address} token={token} />
          ))}
          {!tokens.length && !!walletState.wallet && (
            <ContrastBox display="flex" flexDirection="column" alignItems="center">
              <Text marginBottom={2}>You don't have shares in any liquidity pool yet.</Text>
              <Button variant="contained" color="primary" onClick={onGotoAdd}>Add Liquidity Now</Button>
            </ContrastBox>
          )}
          {!walletState.wallet && (
            <Button
              onClick={onConnectWallet}
              className={classes.actionButton}
              fullWidth
              variant="contained"
              color="primary">
              Connect Wallet
            </Button>
          )}
        </Box>
      )}
      {loadingConnectWallet && (
        <ContrastBox padding={3} marginY={2} justifyContent="center" display="flex">
          <CircularProgress color="primary" />
        </ContrastBox>
      )}

      <Box display="flex" justifyContent="center" marginBottom={5}>
        <Button component={Link} variant="text" to="/pools" size="small" className={classes.viewPoolsButton}>
          <Box display="flex" alignItems="center">
            <Text color="inherit">View All Pools</Text>
            <NewLinkIcon className={classes.newLinkIcon}/>
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default PoolManage;
