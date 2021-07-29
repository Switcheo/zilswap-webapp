import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Badge, Box, BoxProps, Button, Card, CircularProgress, ClickAwayListener, IconButton, Link, Popper, Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import { CurrencyLogo, HelpInfo, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { PendingClaimTx, RewardsState, RootState, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useAsyncTask, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { formatZWAPLabel } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZWAPRewards } from "core/zwap";
import { TOKEN_CONTRACT } from "core/zwap/constants";
import dayjs from "dayjs";
import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as IconSVG } from './icon.svg';

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginRight: theme.spacing(1),
    },
    "& .MuiAccordion-root.Mui-expanded": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#13222C", 0.5)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
      margin: 0
    },
    "& .MuiAccordionSummary-root": {
      display: "inline-flex",
      minHeight: "28px",
      maxHeight: "28px"
    },
    "& .MuiAccordionDetails-root": {
      display: "inherit",
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0
    }
  },
  backdrop: {
    zIndex: 1101,
  },
  card: {
    minWidth: 300,
    padding: theme.spacing(3),
    boxShadow: theme.palette.mainBoxShadow,
    backgroundColor: theme.palette.background.default,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF"
  },
  popper: {
    zIndex: 1102,
  },
  topbarButton: {
    padding: "2px 8px",
    color: theme.palette.primary.contrastText,
    border: "1px solid #00FFB0",
  },
  buttonIcon: {
    marginLeft: theme.spacing(1),
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  currencyLogo: {
    marginLeft: "2px",
  },
  currencyLogoSmall: {
    height: "22px",
    width: "22px"
  },
  tooltip: {
    marginLeft: "5px",
    verticalAlign: "top!important",
  },
  claimRewardsButton: {
    padding: "16px",
  },
  rewardBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  dropDownIcon: {
    color: theme.palette.primary.light
  },
  accordion: {
    width: "100%",
    borderRadius: "10px!important",
    boxShadow: "none",
    border: "none",
    backgroundColor: "transparent",
    "& .MuiIconButton-root": {
      padding: 0,
      marginRight: 0
    },
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#13222C", 0.5)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
    },
  },
  reward: {
    display: "inline-flex",
    alignItems: "flex-end",
    marginBottom: theme.spacing(0.5)
  },
  currency: {
   fontWeight: 600,
   marginLeft: "2px"
  },
  link: {
    color: theme.palette.text?.primary
  },
  linkIcon: {
    marginLeft: theme.spacing(1),
    marginBottom: "2px",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
  body: {
    fontSize: "14px",
    fontWeight: "normal"
  },
  textSuccess: {
    color: theme.palette.primary.dark
  },
  successIcon: {
    verticalAlign: "top",
  },
  amount: {
    fontFamily: "Avenir Next"
  }
}));

const RewardsInfoButton: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const [active, setActive] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [claimCount, setClaimCount] = useState(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [runClaimRewards, loading, error] = useAsyncTask("claimRewards");
  const buttonRef = useRef();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'));

  const walletAddress = useMemo(() => walletState.wallet?.addressInfo.bech32, [walletState.wallet]);

  const potentialRewards = useMemo(() => {
    return Object.keys(rewardsState.potentialPoolRewards).reduce((accum, poolAddress) => {
      const reward = rewardsState.potentialPoolRewards[poolAddress];
      return accum.plus(reward);
    }, BIG_ZERO);
  }, [rewardsState.potentialPoolRewards]);

  const {
    unclaimedRewards,
    claimableRewards,
    claimTooltip,
  } = useMemo(() => {
    const pendingClaimTxs = rewardsState.claimTxs[walletAddress ?? ""] ?? {};
    const pendingClaimEpochs = Object.values(pendingClaimTxs).map(pendingTx => pendingTx.epoch);

    const unclaimedRewards = rewardsState.rewardDistributions.reduce((sum, dist) => {
      if (pendingClaimEpochs.includes(dist.info.epoch_number)) return sum;
      return dist.claimed === false ? sum.plus(dist.info.amount) : sum;
    }, BIG_ZERO);

    const claimableRewards = rewardsState.rewardDistributions.reduce((sum, dist) => {
      if (pendingClaimEpochs.includes(dist.info.epoch_number)) return sum;
      return (dist.claimed === false && dist.readyToClaim) ? sum.plus(dist.info.amount) : sum;
    }, BIG_ZERO);

    let claimTooltip = "No ZWAP to claim";
    if (!unclaimedRewards.isZero()) {
      if (unclaimedRewards.eq(claimableRewards)) {
        claimTooltip = "Click to claim your ZWAP!";
      } else if (unclaimedRewards.gt(claimableRewards)) {
        claimTooltip = "ZWAP emission is being prepared, please try again in a few seconds.";
      }
    }

    return {
      unclaimedRewards,
      claimableRewards,
      claimTooltip,
    };
  }, [walletAddress, rewardsState.claimTxs, rewardsState.rewardDistributions]);

  const zapTokenBalance: BigNumber = useMemo(() => {
    const zapContractAddr = ZWAPRewards.TOKEN_CONTRACT[network] ?? "";
    return tokenState.tokens[zapContractAddr]?.balance ?? BIG_ZERO;
  }, [network, tokenState.tokens]);

  const zapTokenValue: BigNumber = useMemo(() => {
    if (zapTokenBalance.isZero()) return BIG_ZERO;

    const zapContractAddr = ZWAPRewards.TOKEN_CONTRACT[network] ?? "";
    const zapToken = tokenState.tokens[zapContractAddr];
    if (!zapToken) return BIG_ZERO;

    return valueCalculators.amount(tokenState.prices, zapToken, zapTokenBalance);
  }, [network, tokenState.prices, tokenState.tokens, zapTokenBalance, valueCalculators]);

  const zapBalanceLabel = useMemo(() => formatZWAPLabel(zapTokenBalance), [zapTokenBalance]);
  const unclaimedRewardsLabel = useMemo(() => formatZWAPLabel(unclaimedRewards), [unclaimedRewards]);
  const potentialRewardsLabel = useMemo(() => formatZWAPLabel(potentialRewards), [potentialRewards]);

  const onClaimRewards = () => {
    runClaimRewards(async () => {
      if (unclaimedRewards.isZero() || !walletState.wallet) return;
      let claimTx = null;
      let count = 0;
      for (const distribution of rewardsState.rewardDistributions) {
        if (distribution.claimed) continue;

        // drop [leaf hash, ..., root hash]
        const proof = distribution.info.proof.slice(1, distribution.info.proof.length - 1);

        claimTx = await ZWAPRewards.claim({
          network,
          amount: distribution.info.amount,
          proof,
          epochNumber: distribution.info.epoch_number,
          wallet: walletState.wallet,
        });

        const pendingTx: PendingClaimTx = {
          dispatchedAt: dayjs(),
          epoch: distribution.info.epoch_number,
          txHash: claimTx.hash,
        };

        dispatch(actions.Rewards.addPendingClaimTx(
          walletState.wallet.addressInfo.bech32,
          pendingTx,
        ));

        count++;
      }

      if (claimTx) {
        setClaimCount(count);
        setClaimResult(claimTx);
        setTimeout(() => {
          dispatch(actions.Token.refetchState());
        }, 5000);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    })
  };


  const zwapAddress = TOKEN_CONTRACT[network];
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
      <span>
        {
          isMobileView 
          ? <IconButton onClick={() => setActive(!active)} buttonRef={buttonRef}>
              <IconSVG />
            </IconButton> 
          : <Badge variant="dot" invisible={unclaimedRewards.isZero()}>
              <Button
                size="small"
                buttonRef={buttonRef}
                className={classes.topbarButton}
                variant="outlined"
                onClick={() => setActive(!active)}>
                {zapBalanceLabel}
                <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoSmall)}/>
              </Button>
            </Badge>
        }
      </span>
      <Popper
        open={active}
        placement="bottom-end"
        className={classes.popper}
        anchorEl={buttonRef?.current}
        disablePortal
        modifiers={popperModifiers}>
        <Box marginTop={2}>
          <ClickAwayListener onClickAway={() => setActive(false)}>
            <Card className={classes.card}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Text variant="h6" color="textPrimary">Your Balance</Text>
                <Box display="flex" marginTop={1}>
                  <Text variant="h2" className={classes.textColoured}>
                    {zapBalanceLabel}
                  </Text>
                  <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.currencyLogo}/>
                </Box>
                <Text variant="h6" marginTop={0} className={classes.textColoured}>
                  ≈ {zapTokenValue.toFormat(2)} USD
                </Text>
              </Box>

              {/* Rewards claimable */}
              <Box display="flex" flexDirection="column" alignItems="center" mt={1.5}>
                <Text className={classes.body}>
                  Rewards Claimable
                  <HelpInfo placement="bottom" title="The estimated amount of ZWAP you have earned but have not claimed." className={classes.tooltip}/>
                </Text>
                <Box className={classes.rewardBox} bgcolor="background.contrast" width="100%">
                  <Text variant="h4" className={classes.reward}>
                    {unclaimedRewardsLabel}
                    <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoSmall)}/>
                    <span className={classes.currency}>
                      ZWAP
                    </span>
                  </Text>

                  <Text variant="h4" className={classes.reward}>
                    {unclaimedRewardsLabel}
                    <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoSmall)}/>
                    <span className={classes.currency}>
                      ZWAP
                    </span>
                  </Text>

                  <Text marginBottom={1} variant="body2" color="textSecondary" className={classes.amount}>
                    ≈ $400.00
                  </Text>

                  <Accordion className={classes.accordion} expanded={showDetails} onChange={(_, expanded) => setShowDetails(expanded)}>
                    <Box display="flex" justifyContent="center" width="100%">
                      <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon} />}>
                        <Text color="textSecondary">View Details</Text>
                      </AccordionSummary>
                    </Box>
                    <AccordionDetails>
                      <Box>
                        <h1>hello world</h1>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>

              {/* <KeyValueDisplay marginTop={2} alignItems="center" emphasizeValue kkey="Rewards This Epoch">
                <Box display="flex" alignItems="center">
                  <Text variant="body2" color="textPrimary">
                    ≈ {potentialRewardsLabel}
                  </Text>
                  <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoSmall)}/>
                  <HelpInfo placement="bottom" title="The estimated amount of ZWAP you will be receiving for providing liquidity this epoch." className={classes.tooltip}/>
                </Box>
              </KeyValueDisplay>

              <KeyValueDisplay alignItems="center" emphasizeValue kkey={"Rewards Unclaimed"}>
                <Badge color="primary" variant="dot" invisible={unclaimedRewards.isZero()}>
                  <Box display="flex" alignItems="center">
                    <Text variant="body2" color="textPrimary">
                      ≈ {unclaimedRewardsLabel}
                    </Text>
                    <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoSmall)}/>
                    <HelpInfo placement="bottom" title="The estimated amount of ZWAP you have earned but have not claimed." className={classes.tooltip}/>
                  </Box>
                </Badge>
              </KeyValueDisplay> */}

              {/* Need to change? */}
              {!!error && (
                <Box marginTop={1}>
                  <Text variant="body1" color="error">
                    {error.message ?? "Unknown error"}
                  </Text>
                </Box>
              )}

              {!!claimResult && (
                <Box marginTop={2}>
                  <Text variant="body1">Claimed ZWAP from {claimCount} Epochs</Text>
                  <Text variant="body1">Last Claim TX: 0x{truncate(claimResult?.hash, 8, 8)}</Text>
                </Box>
              )}

              <Box marginTop={2} />

              {!claimResult && (
                <Tooltip title={claimTooltip}>
                  <span>
                    <Button fullWidth variant="contained" color="primary" disabled={claimableRewards.isZero()} onClick={onClaimRewards} className={classes.claimRewardsButton}>
                      {loading && <CircularProgress size="1em" color="inherit" />}
                      {!loading && "Claim Rewards"}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {!!claimResult && (
                <Box display="flex" flexDirection="column" alignItems="center"> 
                  <Text marginTop={2} variant="h4" className={classes.textSuccess}>
                    <CheckCircleRoundedIcon fontSize="inherit" className={classes.successIcon} />
                    {" "}
                    Reward claims successful!
                  </Text>
                  <Link
                    className={classes.link}
                    underline="none"
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://viewblock.io/zilliqa/tx/0x${claimResult?.hash}?network=${network?.toLowerCase()}`}>
                      <Box display="flex" justifyContent="center" alignItems="center" mt={0.5}>
                        <Text className={classes.body}>View on Viewblock</Text>
                        <NewLinkIcon className={classes.linkIcon} />
                      </Box>
                  </Link>
                </Box>
              )}
  
            </Card>
          </ClickAwayListener>
        </Box>
      </Popper>
      <Backdrop className={classes.backdrop} open={active}>
      </Backdrop>
    </Box>
  );
};

export default RewardsInfoButton;
