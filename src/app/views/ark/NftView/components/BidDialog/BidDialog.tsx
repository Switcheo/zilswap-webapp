import React, { Fragment, useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, ClickAwayListener, DialogContent, DialogProps, FormControlLabel, MenuItem, MenuList } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDownRounded";
import UncheckedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import DoneIcon from "@material-ui/icons/DoneRounded";
import BigNumber from "bignumber.js";
import cls from "classnames";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { useHistory } from "react-router-dom";
import { bnOrZero } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { CurrencyInput, DialogModal, FancyButton, HelpInfo, Text, ArkNFTCard } from "app/components";
import { getBlockchain, getTokens, getWallet } from "app/saga/selectors";
import { actions } from "app/store";
import { Nft } from "app/store/marketplace/types";
import { RootState, TokenInfo } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useBlockTime } from "app/utils";
import { ZIL_ADDRESS } from "app/utils/constants";
import { ReactComponent as CheckedIcon } from "app/views/ark/Collections/checked-icon.svg";
import { ArkClient, logger } from "core/utilities";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { fromBech32Address, toBech32Address } from "core/zilswap";

interface Props extends Partial<DialogProps> {
  token: Nft;
  collectionAddress: string;
}

const initialFormState = {
  bidAmount: "0",
  acceptTerms: false,
};

export type expiryOption = {
  text: string;
  value: number | undefined;
  unit: string | undefined;
};

const EXPIRY_OPTIONS: expiryOption[] = [
  {
    text: "6 hours",
    value: 6,
    unit: "hours",
  },
  {
    value: 1,
    text: "1 day",
    unit: "day",
  },
  {
    value: 3,
    text: "3 days",
    unit: "day",
  },
  {
    value: 1,
    text: "1 week",
    unit: "week",
  },
  {
    value: 1,
    text: "1 month",
    unit: "month",
  },
  {
    value: 3,
    text: "3 months",
    unit: "month",
  },
  {
    value: undefined,
    text: "Select a date",
    unit: undefined,
  },
];

const BidDialog: React.FC<Props> = (props: Props) => {
  const { children, className, collectionAddress, token, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { network } = useSelector(getBlockchain);
  const { wallet } = useSelector(getWallet);
  const tokenState = useSelector(getTokens);
  const open = useSelector<RootState, boolean>(
    (state) => state.layout.showBidNftDialog
  );
  const [runConfirmPurchase, loading, error] = useAsyncTask("confirmPurchase");
  const [completedPurchase, setCompletedPurchase] = useState<boolean>(false);
  const [formState, setFormState] =
    useState<typeof initialFormState>(initialFormState);
  const [bidToken, setBidToken] = useState<TokenInfo>(
    tokenState.tokens[ZIL_ADDRESS]
  );
  const [expiryDate, setExpiryDate] = useState<any>(null);
  const [expiryOption, setExpiryOption] = useState<expiryOption>(
    EXPIRY_OPTIONS[0]
  );
  const match = useRouteMatch<{ id: string; collection: string }>();
  const [expanded, setExpanded] = useState<boolean>(false);

  // eslint-disable-next-line
  const [blockTime, currentBlock, currentTime] = useBlockTime();

  const bestBid = token.bestBid;

  const { expiry, expiryTime } = useMemo(() => {
    const currentTime = dayjs();
    let expiryTime;

    if (!!expiryOption.value) {
      expiryTime = dayjs().add(expiryOption.value, expiryOption.unit as any);
    } else {
      expiryTime = dayjs(expiryDate);
    }

    const minutes = expiryTime.diff(currentTime, "minutes");
    const blocks = minutes / BLOCKS_PER_MINUTE;

    const expiry = currentBlock + blocks;

    return { expiry, expiryTime };
  }, [currentBlock, expiryOption, expiryDate]);

  const { priceToken, priceHuman } = useMemo(() => {
    if (!bestBid) return {};
    const priceToken =
      tokenState.tokens[toBech32Address(bestBid.price.address)];
    const priceHuman = bnOrZero(bestBid.price.amount).shiftedBy(
      -(priceToken?.decimals ?? 0)
    );

    return {
      priceToken,
      priceHuman,
    };
  }, [bestBid, tokenState.tokens]);

  const onConfirm = () => {
    if (!wallet) return;
    runConfirmPurchase(async () => {
      const { collection: address, id } = match.params;

      if (!bidToken) return; // TODO: handle token not found

      const priceAmount = bnOrZero(formState.bidAmount).shiftedBy(
        bidToken.decimals
      );
      const price = {
        amount: priceAmount,
        address: fromBech32Address(bidToken.address),
      };
      const feeAmount = priceAmount
        .times(ArkClient.FEE_BPS)
        .dividedToIntegerBy(10000)
        .plus(1);

      const arkClient = new ArkClient(network);
      const nonce = new BigNumber(Math.random())
        .times(2147483647)
        .decimalPlaces(0)
        .toString(10); // int32 max 2147483647
      const blockExpiry = Math.trunc(expiry);
      const message = arkClient.arkMessage(
        "Execute",
        arkClient.arkChequeHash({
          side: "Buy",
          token: { address, id },
          price,
          feeAmount,
          expiry: blockExpiry,
          nonce,
        })
      );

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(
        message as any
      )) as any;

      const result = await arkClient.postTrade({
        publicKey,
        signature,

        collectionAddress: address,
        address: wallet.addressInfo.byte20.toLowerCase(),
        tokenId: id,
        side: "Buy",
        expiry: blockExpiry,
        nonce,
        price,
      });

      dispatch(actions.Layout.toggleShowBidNftDialog("close"));
      logger("post trade", result);
    });
  };

  const onCloseDialog = () => {
    if (loading) return;
    dispatch(actions.Layout.toggleShowBidNftDialog("close"));
    setFormState({
      bidAmount: "0",
      acceptTerms: false,
    });
    setCompletedPurchase(false);
  };

  const onViewCollection = () => {
    dispatch(actions.Layout.toggleShowBidNftDialog("close"));
    history.push("/ark/profile");
  };

  const onCurrencyChange = (token: TokenInfo) => {
    setBidToken(token);
  };

  const onBidAmountChange = (rawAmount: string = "0") => {
    setFormState({
      ...formState,
      bidAmount: rawAmount,
    });
  };

  const onEndEditBidAmount = () => {
    let bidAmount = new BigNumber(formState.bidAmount).decimalPlaces(
      bidToken?.decimals ?? 0
    );
    if (bidAmount.isNaN() || bidAmount.isNegative() || !bidAmount.isFinite())
      setFormState({
        ...formState,
        bidAmount: "0",
      });
  };

  const onChangeExpiry = (date: any) => {
    setExpiryDate(date);
    const option = EXPIRY_OPTIONS.filter(
      (option) => option.text === "Select a date"
    )[0];
    setExpiryOption(option);
  };

  const isBidEnabled = useMemo(() => {
    if (!formState.acceptTerms) return false;

    return true;
  }, [formState]);

  return (
    <DialogModal
      header="Place a Bid"
      {...rest}
      open={open}
      onClose={onCloseDialog}
      className={cls(classes.root, className)}
    >
      <DialogContent className={cls(classes.dialogContent)}>
        {/* Nft card */}
        <ArkNFTCard
          className={classes.nftCard}
          token={token}
          collectionAddress={fromBech32Address(collectionAddress)}
          dialog={true}
        />

        <CurrencyInput
          label="Place Your Bid"
          bid={true}
          highestBid={priceHuman}
          bidToken={priceToken}
          token={bidToken ?? null}
          amount={formState.bidAmount}
          onEditorBlur={onEndEditBidAmount}
          onAmountChange={onBidAmountChange}
          onCurrencyChange={onCurrencyChange}
        />

        {/* Set expiry */}
        <ClickAwayListener onClickAway={() => setExpanded(false)}>
          <Accordion
            expanded={expanded}
            className={classes.expiryAccordion}
            onChange={() => setExpanded(!expanded)}
          >
            <AccordionSummary
              expandIcon={
                <ArrowDropDownIcon
                  className={classes.dropDownIcon}
                  fontSize="large"
                />
              }
            >
              <Box
                display="flex"
                flexDirection="column"
                className={classes.expiryTextBox}
              >
                <Text color="textSecondary">
                  Set Estimated Expiry
                  <HelpInfo
                    className={classes.helpInfo}
                    placement="top"
                    title="The date and time you select here is an estimated conversion based on block time"
                  />
                </Text>
                <Text className={classes.expiryDate}>
                  {/* {dayjs(expiryDate).format("D MMM YYYY")},{" "} */}
                  {/* {dayjs(expiryTime, "HH:mm:ss").format("HH:mm:ss")} */}
                  {dayjs(expiryTime).format("D MMM YYYY, HH:mm:ss")}
                </Text>
                <Text color="textSecondary" className={classes.blockHeightText}>
                  Block Height:{" "}
                  <span className={classes.blockHeightColor}>
                    {expiry.toFixed(0)}
                  </span>
                </Text>
              </Box>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetail}>
              <Box className={classes.expiryBox}>
                <MenuList>
                  {EXPIRY_OPTIONS.map((option) => {
                    return (
                      <MenuItem
                        onClick={() => setExpiryOption(option)}
                        value={option.text}
                        className={cls(classes.menuItem, {
                          [classes.selected]: expiryOption === option,
                        })}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width={"100%"}
                        >
                          {option.text}
                          {expiryOption === option && (
                            <DoneIcon fontSize="small" />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </MenuList>
                {expiryOption.text === "Select a date" && (
                  <Box display="flex" justifyContent="center" mt={0.5} mb={2}>
                    <DatePicker
                      minDate={new Date()}
                      className={classes.datePicker}
                      selected={new Date()}
                      onChange={(date) => onChangeExpiry(date)}
                      fixedHeight
                      inline
                    />
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </ClickAwayListener>

        {!completedPurchase && (
          <Fragment>
            {/* Terms */}
            <Box className={classes.termsBox}>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radioButton}
                    checkedIcon={<CheckedIcon />}
                    icon={<UncheckedIcon fontSize="small" />}
                    checked={formState.acceptTerms}
                    onChange={() =>
                      setFormState({
                        ...formState,
                        acceptTerms: !formState.acceptTerms,
                      })
                    }
                    disableRipple
                  />
                }
                label={
                  <Text>
                    By checking this box, I accept ARK's terms and conditions.
                  </Text>
                }
              />
            </Box>

            {error && (
              <Text color="error">
                Error: {error?.message ?? "Unknown error"}
              </Text>
            )}

            <FancyButton
              className={classes.actionButton}
              loading={loading}
              variant="contained"
              color="primary"
              onClick={onConfirm}
              disabled={!isBidEnabled}
              walletRequired
            >
              Place Bid
            </FancyButton>
          </Fragment>
        )}

        {completedPurchase && (
          <FancyButton
            className={classes.collectionButton}
            variant="contained"
            color="primary"
            onClick={onViewCollection}
            walletRequired
          >
            View Collection
          </FancyButton>
        )}
      </DialogContent>
    </DialogModal>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiDialogTitle-root": {
      padding: theme.spacing(3),
      "& .MuiTypography-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: "24px",
        linHeight: "36px",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.8rem",
      },
    },
    "& .MuiAccordionSummary-root": {
      backgroundColor: theme.palette.currencyInput,
      border: "1px solid transparent",
      "&:hover": {
        borderColor: "#00FFB0",
        "& .MuiSvgIcon-root": {
          color: "#00FFB0",
        },
      },
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      borderRadius: 12,
      marginBottom: theme.spacing(1.5),
      borderColor: "#00FFB0",
      "& .MuiSvgIcon-root": {
        color: "#00FFB0",
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "12px 0",
    },
    position: "relative",
  },
  backdrop: {
    position: "absolute",
    zIndex: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: theme.spacing(3),
  },
  dialogContent: {
    backgroundColor: theme.palette.background.default,
    borderLeft:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRight:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderBottom:
      theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRadius: "0 0 12px 12px",
    padding: theme.spacing(0, 3, 2),
    minWidth: 380,
    maxWidth: 411,
    overflowY: "auto",
  },
  actionButton: {
    height: 46,
  },
  collectionButton: {
    height: 46,
    marginTop: theme.spacing(1),
  },
  nftCard: {
    maxWidth: "none",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  termsBox: {
    marginBottom: theme.spacing(1),
    "& .MuiFormControlLabel-root": {
      marginLeft: "-8px",
      marginRight: 0,
    },
  },
  priceBox: {
    borderRadius: 12,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.currencyInput,
    marginBottom: theme.spacing(1),
  },
  priceText: {
    fontSize: "20px",
    lineHeight: "30px",
  },
  price: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "28px",
    paddingBottom: "4px",
    color: theme.palette.primary.dark,
  },
  currencyLogo: {
    paddingBottom: "4px",
  },
  txText: {
    color: theme.palette.label,
  },
  icon: {
    fontSize: "14px",
    color: theme.palette.label,
  },
  link: {
    color: theme.palette.text?.primary,
  },
  linkIcon: {
    marginLeft: 2,
    verticalAlign: "top",
  },
  loadingTitle: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: "24px",
    linHeight: "40px",
  },
  loadingBody: {
    fontSize: "14px",
    lineHeight: "24px",
    marginTop: theme.spacing(0.5),
  },
  expiryAccordion: {
    backgroundColor: "transparent",
    marginTop: theme.spacing(1.5),
    boxShadow: "none",
    border: "1px solid transparent",
  },
  expiryBox: {
    "& .MuiMenuItem-root": {
      fontFamily: "'Raleway', sans-serif",
      fontSize: "14px",
      fontWeight: 700,
    },
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontSize: "14px",
      fontWeight: 900,
    },
  },
  accordionDetail: {
    display: "inherit",
    padding: 0,
    backgroundColor: theme.palette.type === "dark" ? "#183E47" : "#FFFFFF",
    border: `1px solid rgba${
      theme.palette.type === "dark"
        ? hexToRGBA("#DEFFFF", 0.1)
        : hexToRGBA("#003340", 0.2)
    }`,
    borderRadius: 12,
  },
  expiryTextBox: {
    "& .MuiTypography-root": {
      textAlign: "initial",
    },
  },
  helpInfo: {
    marginLeft: "4px",
  },
  dropDownIcon: {
    color: theme.palette.primary.light,
  },
  blockHeightText: {
    fontSize: "10px",
    lineHeight: "12px",
  },
  blockHeightColor: {
    color: theme.palette.text?.primary,
  },
  expiryDate: {
    lineHeight: "24px",
    fontFamily: "'Raleway', sans-serif",
    fontSize: "16px",
    fontWeight: 900,
  },
  datePicker: {},
  menuItem: {
    minHeight: "32px",
  },
  selected: {
    color: "#00FFB0",
  },
}));

export default BidDialog;
