import { Box, BoxProps, Button, Card, CircularProgress, Popper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay, Text } from "app/components";
import { RootState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginRight: theme.spacing(2),
  },
  card: {
    minWidth: 300,
    padding: theme.spacing(3),
    boxShadow: theme.palette.mainBoxShadow,
  },
  popper: {
    zIndex: 1101,
  },
  statistic: {
    fontSize: theme.spacing(4),
    lineHeight: `${theme.spacing(4)}px`,
    fontWeight: 500,
  },
  topbarButton: {
    paddingTop: "2px",
    paddingBottom: "2px",
  },
}));

const RewardsInfoButton: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [active, setActive] = useState(false);
  const [runClaimRewards, loading, error] = useAsyncTask("claimRewards");

  const buttonRef = useRef();

  const onClaimRewards = () => {
    runClaimRewards(async () => {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    })
  };

  if (!walletState.wallet) return null;

  const popperModifiers = {
    flip: {
      enabled: true,
    },
    preventOverflow: {
      enabled: true,
      boundariesElement: 'scrollParent',
    },
    arrow: {
      enabled: true,
      element: buttonRef?.current,
    },
  } as const;

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button
        size="small"
        buttonRef={buttonRef}
        className={classes.topbarButton}
        variant="outlined"
        onClick={() => setActive(!active)}>
        0.00 ZWAP
      </Button>
      <Popper
        open={active}
        placement="bottom-end"
        className={classes.popper}
        anchorEl={buttonRef?.current}
        disablePortal
        modifiers={popperModifiers}>
        <Box marginTop={1}>
          <Card className={classes.card}>
            <Text variant="body1" color="textSecondary">Your ZWAP Balance</Text>
            <Text variant="h1" marginTop={1} className={classes.statistic}>
              0.00 ZWAP
            </Text>

            <KeyValueDisplay marginTop={3} emphasizeValue kkey={"Total Potential Rewards"}>0.00 ZWAP</KeyValueDisplay>
            <KeyValueDisplay marginTop={1} emphasizeValue kkey={(
              <span>
                Unclaimed Rewards
                <HelpInfo placement="bottom" title="Add liquidity to earn ZWAP rewards every week!" />
              </span>
            )}>
              0.00 ZWAP
            </KeyValueDisplay>

            {!!error && (
              <Box marginTop={1}>
                <Text variant="body1" color="error">
                  {error.message ?? "Unknown error"}
                </Text>
              </Box>
            )}

            <Box marginTop={3} />

            <Button fullWidth variant="contained" color="primary" onClick={onClaimRewards}>
              {loading && <CircularProgress size="1em" color="inherit" />}
              {!loading && "Claim Rewards"}
            </Button>
          </Card>
        </Box>
      </Popper>
    </Box>
  );
};

export default RewardsInfoButton;
