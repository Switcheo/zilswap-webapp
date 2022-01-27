import React, { useMemo, useState } from "react";
import { useHistory } from "react-router";
import cls from "classnames";
import { Box, BoxProps, CircularProgress, Link, makeStyles, Typography } from "@material-ui/core";
import { toBech32Address } from "@zilliqa-js/crypto";
import LaunchIcon from "@material-ui/icons/Launch";
import { Network } from "zilswap-sdk/lib/constants";
import { AppTheme } from "app/theme/types";
import { MintContract } from "app/store/mint/types";
import { FancyButton, KeyValueDisplay, Text } from "app/components";
import { ZilswapConnector } from "core/zilswap";
import { ArkClient, waitForTx } from "core/utilities";
import { ReactComponent as WarningIcon } from "app/views/ark/NftView/components/assets/warning.svg";
import { hexToRGBA, useAsyncTask, useNetwork, useToaster } from "app/utils";
import { ReactComponent as Checkmark } from "app/views/ark/NftView/components/SellDialog/checkmark.svg";

interface Props extends BoxProps {
  pendingMintContract: MintContract;
}

const MintProgress: React.FC<Props> = (props: Props) => {
  const { children, className, pendingMintContract, ...rest } = props;
  const classes = useStyles();
  const history = useHistory();
  const toaster = useToaster();
  const network = useNetwork();

  const [acceptTxId, setAcceptTxId] = useState<string | null>(null);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [hasAcceptOwnership, setHasAcceptOwnership] = useState<boolean>(false);

  const [runAcceptOwnership, loadingAcceptOwnership] = useAsyncTask("acceptOwnership", (error) => toaster(error.message, { overridePersist: false }));

  const onViewCollection = () => {
    history.push(`/arky/collections/${toBech32Address(pendingMintContract?.contractAddress!)}`);
  }

  const isViewCollectionEnabled = useMemo(() => {
    return pendingMintContract?.contractAddress && pendingMintContract.status === "completed";
  }, [pendingMintContract])

  const isAcceptOwnershipEnabled = useMemo(() => {
    if (hasAcceptOwnership) return false;
    return pendingMintContract?.contractAddress && pendingMintContract.status === "transferring";
  }, [pendingMintContract])

  // statuses
  const hasDeployed = useMemo(() => {
    return !!pendingMintContract?.contractAddress;
  }, [pendingMintContract])

  const hasMinted = useMemo(() => {
    return pendingMintContract.mintedCount === pendingMintContract.tokenCount;
  }, [pendingMintContract])

  const hasCompleted = useMemo(() => {
    return hasAcceptOwnership;
  }, [hasAcceptOwnership])

  const explorerLink = useMemo(() => {
    if (network === Network.MainNet) {
      return `https://viewblock.io/zilliqa/tx/0x${acceptTxId}`;
    } else {
      return `https://viewblock.io/zilliqa/tx/0x${acceptTxId}?network=testnet`;
    }
  }, [network, acceptTxId]);

  // call accept contract ownership
  const onAcceptOwnership = () => {
    runAcceptOwnership(async () => {
      if (pendingMintContract?.contractAddress && pendingMintContract.status === "transferring") {
        const arkClient = new ArkClient(network);
        const zilswap = ZilswapConnector.getSDK();
  
        const transaction = await arkClient.acceptContractOwnership(toBech32Address(pendingMintContract.contractAddress), zilswap);

        if (transaction?.id) {
          setAcceptTxId(transaction.id);
          setLoadingTx(true);
          try {
            await waitForTx(transaction.id);
            setHasAcceptOwnership(true);
          } catch (e) {
            console.error(e);
          } finally {
            setLoadingTx(false);
          }
        }
      }
    })
  }

  const getProgress = () => {
    if (pendingMintContract) {
      const { mintedCount, tokenCount } = pendingMintContract;

      return ((mintedCount / tokenCount) * 100).toFixed(0);
    }

    return 0;
  }

  return (
    <Box className={classes.root} {...rest} display="flex" flexDirection="column">
      <Typography className={classes.header}>Minting NFTs</Typography>

      {/* Deploy Contract */}
      <Box display="flex" marginTop={4} marginBottom={5} position="relative">
        <Box className={cls(classes.stepBar, {
          [classes.stepBarActive]: true,
          [classes.stepBarCompleted]: hasDeployed
        })}/>
        <Box className={cls(classes.step, {
          [classes.stepActive]: true,
          [classes.stepCompleted]: hasDeployed
        })}>
          {hasDeployed ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>1</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Text className={classes.stepLabel}>Deploy Contract</Text>
          <Text className={classes.stepDescription}>Some backend magic is happening to lay some ground work for minting.</Text>
        </Box>
      </Box>

      {/* Mint NFTs */}
      <Box display="flex" marginBottom={5} position="relative">
        <Box className={cls(classes.stepBar, classes.stepBarSecond, {
          [classes.stepBarActive]: hasDeployed,
          [classes.stepBarCompleted]: hasMinted
        })}/>
        <Box className={cls(classes.step, {
          [classes.stepActive]: hasDeployed,
          [classes.stepCompleted]: hasMinted
        })}>
          {hasMinted ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>2</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch" width="100%">
          <Text className={classes.stepLabel}>Mint NFTs</Text>
          <Text className={classes.stepDescription}>Your NFTs are now minting...</Text>

          {/* progress bar */}
          <Box mt={2} display="flex">
            <Box className={classes.defaultBackground}>
              <Box className={classes.defaultBar} />
            </Box>

            <Box className={classes.progressBackground} width={`${getProgress()}%`}>
              <Box className={classes.progressBar} />
            </Box>
          </Box>

          <KeyValueDisplay kkey="NFTs minted" mt="6px" className={classes.nftsMinted}>
            {pendingMintContract
              ? <span>{pendingMintContract.mintedCount}/{pendingMintContract.tokenCount}</span>
              : <span>-</span>
            }
          </KeyValueDisplay>
        </Box>
      </Box>

      {/* Assign Ownership */}
      <Box display="flex" marginBottom={5} position="relative">
        <Box className={cls(classes.stepBar, classes.stepBarThird, {
          [classes.stepBarActive]: hasMinted,
          [classes.stepBarCompleted]: hasCompleted
        })}/>
        <Box className={cls(classes.step, {
          [classes.stepActive]: hasMinted,
          [classes.stepCompleted]: hasCompleted
        })}>
          {hasCompleted ? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>3</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Box display="flex" justifyContent="space-between">
            <Text className={classes.stepLabel}>Accept Ownership</Text>
            {acceptTxId && 
              <Link
                className={classes.link}
                underline="hover"
                rel="noopener noreferrer"
                target="_blank"
                href={explorerLink}
              >
                <Typography>
                  View on explorer
                  <LaunchIcon className={classes.linkIcon} />
                </Typography>
              </Link>
            }
          </Box>
          <Text className={classes.stepDescription}>Check your wallet and approve the transaction so that you can become the proud owner of your collection.</Text>
        </Box>
      </Box>

      {/* Complete */}
      <Box display="flex">
        <Box className={cls(classes.step, {
          [classes.stepActive]: hasCompleted,
          [classes.stepCompleted]: hasCompleted
        })}>
          {hasCompleted? (
            <Checkmark />
          ) : (
            <span className={classes.stepNumber}>4</span>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Text className={classes.stepLabel}>Complete</Text>
          <Text className={classes.stepDescription}>Congratulations on minting your very own NFT collection! <br /> Hit the button below to check it out :)</Text>
        </Box>
      </Box>

      <KeyValueDisplay kkey="Estimated Time" mt="24px" mb="24px" className={classes.estimatedTime}>
        <span>~ 27 Minutes Left</span>
      </KeyValueDisplay>

      <Box className={classes.warningBox}>
        <WarningIcon className={classes.warningIcon} />
        <Text>
          Keep this window open so no data will be lost.
        </Text>
      </Box>

      <FancyButton variant="contained" color="primary" className={classes.actionButton} onClick={onAcceptOwnership} disabled={!isAcceptOwnershipEnabled || loadingAcceptOwnership || loadingTx}>
        {(loadingAcceptOwnership || loadingTx) &&
          <CircularProgress size={20} className={classes.circularProgress} />
        }
        Accept Ownership
      </FancyButton>

      <FancyButton variant="contained" color="primary" className={classes.actionButton} onClick={onViewCollection} disabled={!isViewCollectionEnabled}>
        View Collection
      </FancyButton>
    </Box>
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(3.75, 4.5, 4.5),
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
    [theme.breakpoints.up("md")]: {
      maxWidth: "600px",
    }
  },
  header: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "35px",
  },
  actionButton: {
    marginTop: theme.spacing(3),
    height: 46,
  },
  warningBox: {
    minHeight: 46,
    width: "100%",
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: `rgba${hexToRGBA(theme.palette.warning.main, 0.2)}`,
    borderRadius: 12,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& .MuiTypography-root": {
      color: `rgba${hexToRGBA(theme.palette.warning.main, 0.8)}`,
      fontSize: "14px",
      lineHeight: "17px",
    }
  },
  warningIcon: {
    height: 24,
    width: 24,
    flex: "none",
    marginRight: theme.spacing(1),
    "& path": {
      stroke: theme.palette.warning.main,
    },
  },
  estimatedTime: {
    "& .MuiTypography-root": {
      color: theme.palette.text?.primary,
      fontSize: "14px",
      lineHeight: "18px",
    }
  },
  step: {
    width: 110,
    height: 52,
    borderRadius: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#223139",
    backgroundImage: "linear-gradient(#29475A, #223139)",
    marginRight: 24,
    position: "relative",
    maxWidth: 54.5,
    minWidth: 53.75,
  },
  stepLabel: {
    fontWeight: "bold",
    fontSize: "16px",
    lineHeight: "19px",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
      marginBottom: theme.spacing(0.5),
    }
  },
  stepDescription: {
    fontSize: "14px",
    lineHeight: "19px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    }
  },
  stepActive: {
    backgroundColor: "#6BE1FF",
    backgroundImage: "none",
    color: "#003340"
  },
  stepCompleted: {
    backgroundColor: "#00FFB0",
    color: "#003340"
  },
  stepBar: {
    position: "absolute",
    top: 50,
    left: 25,
    height: 60,
    width: 6,
    backgroundColor: "#223139",
    backgroundImage: "linear-gradient(#29475A, #223139)",
    zIndex: 0,
  },
  stepBarSecond: {
    height: 130,
  },
  stepBarThird: {
    height: 70,
  },
  stepBarActive: {
    backgroundImage: "linear-gradient(#6BE1FF, #223139)",
  },
  stepBarCompleted: {
    backgroundImage: "linear-gradient(#00FFB0, #00FFB0)",
  },
  progress: {
    position: "absolute",
  },
  stepNumber: {
    fontFamily: "Avenir Next",
    fontSize: "16px",
    lineHeight: "19px",
  },
  defaultBackground: {
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#D4FFF2", 0.25)}`,
    borderRadius: 5,
    display: "flex",
    padding: "4px",
    width: "100%",
  },
  defaultBar: {
    display: "flex",
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#D4FFF2", 0.5)}`,
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  progressBackground: {
    backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#00FFB0" : "#6BE1FF", 0.1)}`,
    borderRadius: 5,
    display: "flex",
    padding: "4px",
    marginLeft: "-100%",
  },
  progressBar: {
    display: "flex",
    backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#6BE1FF",
    borderRadius: 5,
    padding: "1.5px",
    width: "100%",
  },
  nftsMinted: {
    "& .MuiTypography-root": {
      color: theme.palette.text?.primary,
      fontSize: "14px",
      lineHeight: "18px",
    }
  },
  circularProgress: {
    color: "rgba(255, 255, 255, .5)",
    marginRight: theme.spacing(1)
  },
  link: {
    color: theme.palette.text?.primary,
    "& .MuiTypography-root": {
      fontSize: "14px",
      lineHeight: "18px",
    }
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    fontSize: "14px",
    marginTop: "1.5px",
    verticalAlign: "top",
    "& path": {
      fill: theme.palette.text?.primary,
    },
  },
}))

export default MintProgress;
