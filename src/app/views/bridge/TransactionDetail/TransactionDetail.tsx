import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, IconButton, Link, makeStyles, Step, StepConnector, StepLabel, Stepper, withStyles } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { CurrencyLogo, FancyButton, HelpInfo, KeyValueDisplay, MnemonicDialog, Text } from "app/components";
import { ReactComponent as StraightLine } from "app/components/ConfirmTransfer/straight-line.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { BridgeTx } from "app/store/bridge/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useBridgeableTokenFinder, useNetwork } from "app/utils";
import { ReactComponent as EthereumLogo } from "app/views/main/Bridge/ethereum-logo.svg";
import { ReactComponent as WavyLine } from "app/views/main/Bridge/wavy-line.svg";
import { ReactComponent as ZilliqaLogo } from "app/views/main/Bridge/zilliqa-logo.svg";
import cls from "classnames";
import React, { Fragment, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { Network } from "zilswap-sdk/lib/constants";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    padding: theme.spacing(2, 4, 0),
    maxWidth: 488,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
      padding: theme.spacing(2, 2, 0),
    },
    "& .MuiAccordionSummary-root": {
      display: "inline-flex"
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "48px"
    },
    "& .MuiAccordionDetails-root": {
      padding: "0px 16px 16px",
      display: "inherit"
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0
    }
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  backButton: {
    marginLeft: theme.spacing(-1),
    color: theme.palette.text?.secondary,
    padding: "6px"
  },
  box: {
    marginTop: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    padding: theme.spacing(1.5)
  },
  amount: {
    display: "inline-flex",
    marginTop: theme.spacing(1)
  },
  token: {
    margin: theme.spacing(0, 1)
  },
  transferBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
    padding: theme.spacing(1),
    overflow: "auto",
  },
  networkBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1)
  },
  label: {
    color: theme.palette.label
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  helpInfo: {
    verticalAlign: "text-top!important"
  },
  approvedHelpInfo: {
    verticalAlign: "top!important",
  },
  textWarning: {
    color: theme.palette.warning.main
  },
  textSuccess: {
    color: theme.palette.primary.dark
  },
  successIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.7)
  },
  dropDownIcon: {
    color: theme.palette.primary.light
  },
  accordion: {
    borderRadius: "12px",
    boxShadow: "none",
    border: "none",
    backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#DEFFFF", 0.1)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
    "& .MuiIconButton-root": {
      padding: 0,
      marginRight: 0
    }
  },
  arrowIcon: {
    verticalAlign: "middle",
    color: theme.palette.primary.light,
    margin: "0 -4px 1.2px -4px"
  },
  checkIcon: {
    fontSize: "1rem",
    verticalAlign: "sub",
    color: theme.palette.primary.light,
  },
  checkIconCompleted: {
    color: theme.palette.primary.dark
  },
  link: {
    color: theme.palette.text?.secondary,
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    width: "10px",
    verticalAlign: "top",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
  warningIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.5)
  },
  wavyLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-70px",
    marginTop: "-40px",
    width: "140px",
    [theme.breakpoints.down("xs")]: {
      width: "100px",
      marginLeft: "-50px",
    },
  },
  straightLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-59px",
    marginTop: "-20px",
    [theme.breakpoints.down("xs")]: {
      width: "90px",
      marginLeft: "-44px",
    },
  },
  stepper: {
    backgroundColor: "transparent",
    "& .MuiStepIcon-root": {
      color: `rgba${hexToRGBA("#DEFFFF", 0.1)}`,
      border: "5px solid #0D1B24",
      borderRadius: "50%",
      zIndex: 1
    },
    // "& .MuiStepIcon-active": {
    //   boxShadow: "0px 0px 0px 1.5px #00FFB0 inset"
    // },
    "& .MuiStepIcon-completed": {
      color: "#00FFB0",
      backgroundColor: theme.palette.type === "light" ? "#29475A" : ""
    },
    "& .MuiSvgIcon-root": {
      fontSize: "3rem",
    },
    "& .MuiStepLabel-label": {
      marginTop: "8px",
      fontWeight: 600,
      fontSize: "14px",
      lineHeight: 1.6,
      color: theme.palette.text?.primary
    },
    "& .MuiStepLabel-completed": {
      color: theme.palette.primary.dark
    },
    "& .MuiStepIcon-text": {
      fill: theme.palette.type === "light" ? "#29475A" : ""
    }
  },
  progressBox: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column"
    },
  },
  progressInfo: {
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(2.5)
    },
  },
  chainName: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px"
    },
  },
  walletAddress: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px"
    },
  },
  instructionsButton: {
    backgroundColor: theme.palette.warning.main,
    padding: "6px 16px",
    marginTop: theme.spacing(2),
    "&:hover": {
      backgroundColor: `rgba${hexToRGBA(theme.palette.warning.main, 0.8)}`
    }
  },
  routerLink: {
    textDecoration: "inherit",
    color: "inherit"
  },
  progress: {
    color: "rgba(255,255,255,.5)",
    marginRight: theme.spacing(1)
  },
}));

const ColorlibConnector = withStyles({
  alternativeLabel: {
    top: 15,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)"
  },
  active: {
    '& $line': {
      backgroundColor: "#00FFB0",
    },
  },
  completed: {
    '& $line': {
      backgroundColor: "#00FFB0",
    },
  },
  line: {
    height: 18,
    borderTop: "5px solid #0D1B24",
    borderBottom: "5px solid #0D1B24",
    backgroundColor: "#0D1B24",
    zIndex: 0
  }
})(StepConnector);

const CHAIN_NAMES = {
  [Blockchain.Zilliqa]: "Zilliqa",
  [Blockchain.Ethereum]: "Ethereum",
  [Blockchain.Neo]: "Neo",
  [Blockchain.BinanceSmartChain]: "Binance Smart Chain",
}

const STEPS = ['Deposit', 'Confirm', 'Withdraw'];

interface TransactionDetailProps {
  currentTx: BridgeTx;
  onBack?: () => void;
  approvalHash: string;
  tokenApproval?: boolean;
  isHistory?: boolean;
  onNewTransfer?: () => void;
}

const TransactionDetail = (props: TransactionDetailProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const bridgeableTokenFinder = useBridgeableTokenFinder();
  const { currentTx, onBack, tokenApproval, approvalHash, isHistory, onNewTransfer } = props;

  const [showTransactions, setShowTransactions] = useState<boolean>(true);

  const fromToken = bridgeableTokenFinder(currentTx.srcToken, currentTx.srcChain);

  let currentBridgeTx = currentTx;

  const { dstChain, srcChain } = currentBridgeTx;

  const { fromChainName, toChainName } = useMemo(() => {
    return {
      fromChainName: CHAIN_NAMES[currentBridgeTx!.srcChain],
      toChainName: CHAIN_NAMES[currentBridgeTx!.dstChain],
    }
  }, [currentBridgeTx]);

  const getTradeHubExplorerLink = (hash: string) => {
    if (network === Network.MainNet) {
      return `https://switcheo.org/transaction/${hash}`;
    } else {
      return `https://switcheo.org/transaction/${hash}?net=dev`;
    }
  };
  const getExplorerLink = (hash: string, blockchain: Blockchain) => {
    if (network === Network.MainNet) {
      switch (blockchain) {
        case Blockchain.Ethereum:
          return `https://etherscan.io/search?q=${hash}`;
        default:
          return `https://viewblock.io/zilliqa/tx/${hash}`;
      }
    } else {
      switch (blockchain) {
        case Blockchain.Ethereum:
          return `https://ropsten.etherscan.io/search?q=${hash}`;
        default:
          return `https://viewblock.io/zilliqa/tx/${hash}?network=testnet`;
      }
    }
  }

  const getActiveStep = () => {
    if (currentBridgeTx?.destinationTxHash) {
      return 3;
    }

    if (currentBridgeTx?.withdrawTxHash) {
      return 2;
    }

    if (currentBridgeTx?.sourceTxHash) {
      return 1;
    }

    return 0;
  }

  const formatAddress = (address: string | undefined | null, chain: Blockchain) => {
    if (!address) return "";
    switch (chain) {
      case Blockchain.Zilliqa:
        return truncate(toBech32Address(address), 5, 4);
      default:
        return truncate(address, 5, 4);
    }
  }

  const getEstimatedTime = () => {
    if (currentBridgeTx?.withdrawTxHash) {
      return 10;
    }

    if (currentBridgeTx?.depositTxConfirmedAt) {
      return 15;
    }

    if (currentBridgeTx?.sourceTxHash) {
      return 25;
    }

    return 30;
  }

  const handleShowMnemonicDialog = () => {
    dispatch(actions.Layout.toggleShowMnemonic("open"));
  }

  return (
    <Box display="flex" flexDirection="column" className={classes.container}>
      {!!onBack && (
        <Box>
          <IconButton onClick={() => onBack()} className={classes.backButton}>
            <ArrowBack />
          </IconButton>
        </Box>
      )}

      {!!currentBridgeTx && (
        <Box display="flex" flexDirection="column" alignItems="center">
          {!onBack && (
            <Box mt={4} />
          )}

          {!currentBridgeTx.destinationTxHash
            ? <Fragment>
              <Text variant="h2">Transfer in Progress...</Text>

              <Text variant="h4" className={classes.textWarning} margin={0.5} align="center">
                <WarningRoundedIcon className={classes.warningIcon} /> Warning: Please read these instructions carefully before closing this window to avoid losing your funds.
              </Text>

              {!currentBridgeTx.withdrawTxHash && (
                <Button onClick={handleShowMnemonicDialog} className={classes.instructionsButton} size="small" variant="contained">
                  Read Instructions
                </Button>
              )}
            </Fragment>
            : <Fragment>
              <Text variant="h2" className={classes.textSuccess}>
                <CheckCircleRoundedIcon fontSize="inherit" className={classes.successIcon} /> Transfer Complete
              </Text>

              <Text variant="h4" margin={0.5} align="center">
                Your funds have been successfully transferred.
              </Text>

              <Text color="textSecondary" marginTop={0.5} align="center">
                Please check your wallet to view your transferred funds.
              </Text>
            </Fragment>
          }
        </Box>
      )}

      <Box className={classes.box} bgcolor="background.contrast">
        <Box className={classes.transferBox}>
          <Text>{!currentBridgeTx?.destinationTxHash ? "Transferring" : "Transferred"}</Text>
          <Text variant="h2" className={classes.amount}>
            {currentBridgeTx?.inputAmount.toString(10)}
            <CurrencyLogo className={classes.token} currency={fromToken?.symbol} address={fromToken?.address} blockchain={fromToken?.blockchain} />
            {fromToken?.symbol}
          </Text>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between" position="relative">
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">From</Text>
            <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
              {currentBridgeTx?.srcChain === Blockchain.Ethereum
                ? <EthereumLogo />
                : <ZilliqaLogo />
              }
            </Box>
            <Text variant="h4" className={classes.chainName}>{fromChainName} Network</Text>
            <Text variant="button" className={classes.walletAddress}>{formatAddress(currentBridgeTx?.srcAddr, srcChain)}</Text>
          </Box>
          <Box flex={0.2} />
          {!!currentBridgeTx?.destinationTxHash
            ? <StraightLine className={classes.straightLine} />
            : <WavyLine className={classes.wavyLine} />
          }
          <Box className={classes.networkBox} flex={1}>
            <Text variant="h4" color="textSecondary">To</Text>
            <Box display="flex" flex={1} alignItems="center" justifyContent="center" mt={1.5} mb={1.5}>
              {currentBridgeTx?.dstChain === Blockchain.Zilliqa
                ? <ZilliqaLogo />
                : <EthereumLogo />
              }
            </Box>
            <Text variant="h4" className={classes.chainName}>{toChainName} Network</Text>
            <Text variant="button" className={classes.walletAddress}>{formatAddress(currentBridgeTx?.dstAddr, dstChain)}</Text>
          </Box>
        </Box>
      </Box>

      {currentBridgeTx && (
        <Box className={classes.box} bgcolor="background.contrast">
          <Text align="center" variant="h6">{!currentBridgeTx.destinationTxHash ? "Transfer Progress" : "Transfer Complete"}</Text>

          <Stepper className={classes.stepper} activeStep={getActiveStep()} connector={<ColorlibConnector />} alternativeLabel>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <span>{label}</span>
                  <Text className={classes.label}>
                    {index === 0
                      ? fromChainName
                      : index === 1
                        ? "TradeHub"
                        : toChainName
                    }
                  </Text>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <KeyValueDisplay kkey="Estimated Time Left" mt="8px" mb="8px" px={2}>
            {!currentBridgeTx.destinationTxHash
              ? <span><span className={classes.textColoured}>~{getEstimatedTime()}</span> Minutes</span>
              : "-"
            }
            <HelpInfo className={classes.helpInfo} placement="top" title="Estimated time left to the completion of this transfer." />
          </KeyValueDisplay>

          <Accordion className={classes.accordion} expanded={showTransactions} onChange={(_, expanded) => setShowTransactions(expanded)}>
            <Box display="flex" justifyContent="center">
              <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon} />}>
                <Text>View Transactions</Text>
              </AccordionSummary>
            </Box>
            <AccordionDetails>
              <Box>
                {/* Stage 1 */}
                <Box mb={1}>
                  <Text>
                    <strong>Stage 1: {fromChainName} <ArrowRightRoundedIcon fontSize="small" className={classes.arrowIcon} /> TradeHub</strong>
                  </Text>
                  <Box display="flex" mb={0.5} className={classes.progressBox}>
                    <Text flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, tokenApproval || currentBridgeTx.sourceTxHash ? classes.checkIconCompleted : "")} /> Token Approval (ERC20/ZRC2)
                    </Text>
                    <Text className={classes.progressInfo}>
                      {approvalHash &&
                        <Link
                          className={classes.link}
                          underline="hover"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={getExplorerLink(approvalHash, currentBridgeTx?.srcChain)}>
                          View on {currentBridgeTx?.srcChain === Blockchain.Ethereum ? 'Etherscan' : 'ViewBlock'} <NewLinkIcon className={classes.linkIcon} />
                        </Link>
                      }
                      {!approvalHash &&
                        <Text className={classes.link}>
                          Approved
                          <HelpInfo className={classes.approvedHelpInfo} placement="top" title="This token has previously been approved by you, and hence will not require approval during this transaction." />
                        </Text>
                      }
                    </Text>
                  </Box>
                  <Box display="flex" className={classes.progressBox}>
                    <Text flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, currentBridgeTx.sourceTxHash ? classes.checkIconCompleted : "")} /> Deposit to TradeHub Contract
                    </Text>
                    <Text className={cls(classes.link, classes.progressInfo)}>
                      {currentBridgeTx.sourceTxHash
                        ? <Link
                          className={classes.link}
                          underline="hover"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={getExplorerLink(currentBridgeTx.sourceTxHash, currentBridgeTx?.srcChain)}>
                          View on {currentBridgeTx?.srcChain === Blockchain.Ethereum ? 'Etherscan' : 'ViewBlock'} <NewLinkIcon className={classes.linkIcon} />
                        </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>

                {/* Stage 2 */}
                <Box mb={1}>
                  <Text>
                    <strong>Stage 2: TradeHub Confirmation</strong>
                  </Text>
                  <Box display="flex" mt={0.9} mb={0.5}>
                    <Text flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, currentBridgeTx?.depositTxConfirmedAt ? classes.checkIconCompleted : "")} /> TradeHub Deposit Confirmation
                    </Text>
                  </Box>
                  <Box display="flex" className={classes.progressBox}>
                    <Text flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, currentBridgeTx.withdrawTxHash ? classes.checkIconCompleted : "")} />
                      {" "}
                      Withdrawal to {toChainName}
                    </Text>
                    <Text className={cls(classes.link, classes.progressInfo)}>
                      {currentBridgeTx.withdrawTxHash
                        ? <Link
                          className={classes.link}
                          underline="hover"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={getTradeHubExplorerLink(currentBridgeTx.withdrawTxHash)}>
                          View on TradeHub <NewLinkIcon className={classes.linkIcon} />
                        </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>

                {/* Stage 3 */}
                <Box>
                  <Text>
                    <strong>Stage 3: TradeHub <ArrowRightRoundedIcon fontSize="small" className={classes.arrowIcon} /> {toChainName}</strong>
                  </Text>
                  <Box display="flex" className={classes.progressBox}>
                    <Text flexGrow={1} align="left">
                      <CheckCircleOutlineRoundedIcon className={cls(classes.checkIcon, currentBridgeTx.destinationTxHash ? classes.checkIconCompleted : "")} />
                      {" "}
                      Transfer to {toChainName} Wallet
                    </Text>
                    <Text className={cls(classes.link, classes.progressInfo)}>
                      {currentBridgeTx.destinationTxHash
                        ? <Link
                          className={classes.link}
                          underline="hover"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={getExplorerLink(currentBridgeTx.destinationTxHash, currentBridgeTx?.dstChain)}>
                          View on {currentBridgeTx?.dstChain === Blockchain.Zilliqa ? 'ViewBlock' : 'Etherscan'} <NewLinkIcon className={classes.linkIcon} />
                        </Link>
                        : "-"
                      }
                    </Text>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {isHistory && (
        <Box mb={4} />
      )}

      {!isHistory && (
        <>
          {!currentBridgeTx.destinationTxHash && (
            <FancyButton
              disabled={true}
              variant="contained"
              color="primary"
              className={classes.actionButton}>
              <CircularProgress size={20} className={classes.progress} />
              Transfer in Progress...
            </FancyButton>
          )}

          {!!currentBridgeTx.destinationTxHash && (
            <FancyButton
              onClick={onNewTransfer}
              variant="contained"
              color="primary"
              className={classes.actionButton}>
              Conduct Another Transfer
            </FancyButton>
          )}
        </>
      )}

      <MnemonicDialog mnemonic={currentBridgeTx?.interimAddrMnemonics} isHistory={isHistory} />
    </Box>
  )
}

export default TransactionDetail;
