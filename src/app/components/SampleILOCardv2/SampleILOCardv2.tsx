import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box, Link, makeStyles, Divider } from '@material-ui/core';
import cls from 'classnames';
import { Dayjs } from 'dayjs';
import { ILOData } from 'core/zilo/constants';
import {
  FancyButton,
  Text,
  CurrencyInput,
  CurrencyLogo,
  ProportionSelect,
} from 'app/components';
import { RootState, TokenState } from 'app/store/types';
import { ReactComponent as NewLinkIcon } from 'app/components/new-link.svg';
import ProgressBar from 'app/components/ProgressBar';
import { ZilswapConnector } from 'core/zilswap';
import { bnOrZero } from 'app/utils';
import { ZIL_ADDRESS } from 'app/utils/constants';
import { AppTheme } from 'app/theme/types';
import WhitelistBadge from '../TokenILOCard/WhitelistBadge';
import { ReactComponent as ZwapLogo } from '../TokenILOCard/logo.svg';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    paddingBottom: theme.spacing(2.5),
    // "& .MuiBox-root": {
    //   flex: 1
    // }
  },
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  description: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
  },
  title: {
    fontWeight: 700,
  },
  meta: {
    fontFamily: "'Raleway', sans-serif",
    textAlign: 'center',
  },
  svg: {
    maxWidth: '100%',
    width: 'unset',
    height: 'unset',
    flex: 1,
    borderRadius: '12px 12px 0 0',
  },
  actionButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    height: 46,
  },
  expandButton: {
    background: 'none',
    border: 'none',
  },
  timer: {
    color: theme.palette.primary.dark,
    margin: theme.spacing(2),
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  viewIcon: {
    color: theme.palette.primary.dark,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: '-12px',
    transform: 'translateY(-50%)',
  },
  label: {
    color: theme.palette.label,
    fontWeight: 400,
    fontSize: '14px',
  },
  link: {
    fontWeight: 600,
    color: theme.palette.text?.secondary,
    marginTop: theme.spacing(0.5),
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    verticalAlign: 'top',
    '& path': {
      fill: theme.palette.text?.secondary,
    },
  },
  divider: {
    border: theme.palette.border,
    margin: theme.spacing(3, 0),
  },
  titleContainer: {
    marginTop: theme.spacing(3),
  },
  proportionSelect: {
    marginTop: 3,
    marginBottom: 4,
  },
  zwapLogo: {
    height: '15px',
    opacity: 0.5,
    marginRight: '2px',
    marginTop: '-1px',
  },
  highlight: {
    fontSize: '14px',
    color: theme.palette.type === 'dark' ? '#00FFB0' : '#003340',
    fontWeight: 400,
  },
  committedBox: {
    backgroundColor: 'rgba(222, 255, 255, 0.1)',
    border: '3px solid rgba(0, 255, 176, 0.2)',
    borderRadius: 12,
  },
  committedBoxLabel: {
    fontSize: '24px',
    lineHeight: 1.4,
    marginLeft: theme.spacing(1),
  },
  committedBoxAmount: {
    fontSize: '24px',
    color: theme.palette.primary.dark,
    textAlign: 'right',
    lineHeight: 1.1,
  },
  committedBoxPercent: {
    fontSize: '14px',
    color: theme.palette.type === 'dark' ? '#DEFFFF' : '#003340',
    opacity: 0.5,
    fontWeight: 400,
  },
}));

interface Props {
  expanded?: boolean;
  data: ILOData;
  blockTime: Dayjs;
  currentBlock: number;
  currentTime: Dayjs;
}

const initialFormState = {
  zilAmount: '0',
};

const SampleILOCard = (props: Props) => {
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const { data, expanded = true } = props;
  const classes = useStyles();
  let isWhitelisted = false;

  /* User contribution summary */
  const fundUSD = new BigNumber(formState.zilAmount).times(
    tokenState.prices[ZIL_ADDRESS]
  );
  const discount =
    isWhitelisted && data.whitelistDiscountPercent ? data.whitelistDiscountPercent : 0;
  const discountUSD = fundUSD.div(100 - discount).times(discount);
  const receiveUSD = fundUSD.plus(discountUSD);

  const zilToken = tokenState.tokens[ZIL_ADDRESS];

  const onZilChange = (amount: string = '0') => {
    const _amount = new BigNumber(amount)
      .shiftedBy(12)
      .integerValue(BigNumber.ROUND_DOWN);

    setFormState({
      ...formState,
      zilAmount: _amount.shiftedBy(-12).toString(),
    });
  };

  const onPercentage = (percentage: number) => {
    const balance = bnOrZero(zilToken.balance);
    const intendedAmount = balance.times(percentage).decimalPlaces(0);
    const netGasAmount = ZilswapConnector.adjustedForGas(intendedAmount, balance);
    setFormState({
      ...formState,
      zilAmount: netGasAmount.shiftedBy(-12).toString(),
    });
  };

  const formatUSDValue = (value: BigNumber): string => {
    if (value.isZero()) return '-';
    if (value.isNaN()) return '-';
    return `$${value.toFormat(2)}`;
  };

  return (
    <Box className={classes.root}>
      <Box>
        <button className={classes.expandButton}>
          <img className={classes.svg} src={data.imageURL} alt={data.tokenName} />
        </button>
      </Box>
      {expanded && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            className={classes.meta}
          >
            <WhitelistBadge
              whitelisted={isWhitelisted}
              discount={data.whitelistDiscountPercent ? data.whitelistDiscountPercent : 0}
              minZwap={data.minZwap ? data.minZwap : 0}
            />

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              className={classes.titleContainer}
            >
              <Text variant="h1" className={cls(classes.title, classes.meta)}>
                {data.tokenName} ({data.tokenSymbol})
              </Text>
              {!!data.projectURL && (
                <Link
                  className={classes.link}
                  underline="none"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={data.projectURL}
                >
                  <NewLinkIcon className={classes.linkIcon} />
                </Link>
              )}
            </Box>

            <Text marginTop={2} marginBottom={0.75} className={classes.description}>
              {data.description}
            </Text>

            <Text variant="h1" className={classes.timer}>
              Coming Soon
            </Text>

            <ProgressBar progress={0} marginTop={3} threshold={20} />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  Total Committed
                </Text>
                <Text className={classes.label}>-</Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  Target
                </Text>
                <Text className={classes.label}>{data.usdTarget}</Text>
              </Box>
            </Box>

            <Divider className={classes.divider} />

            <Box>
              <Box
                display="flex"
                bgcolor="background.contrast"
                padding={0.5}
                borderRadius={12}
                position="relative"
              >
                <CurrencyInput
                  label="Amount"
                  token={zilToken}
                  amount={formState.zilAmount}
                  // disabled={!inToken}
                  fixedToken={true}
                  onAmountChange={onZilChange}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <ProportionSelect
                  size="small"
                  className={classes.proportionSelect}
                  onSelectProp={onPercentage}
                />
              </Box>

              <Box marginTop={1} marginBottom={0.5}>
                <Box display="flex" marginTop={0.75}>
                  <Text className={classes.label} flexGrow={1} align="left">
                    Cost
                  </Text>
                  <Text className={classes.label}>{formatUSDValue(fundUSD)}</Text>
                </Box>
                <Box display="flex" marginTop={0.75}>
                  <ZwapLogo className={classes.zwapLogo} />
                  <Text className={classes.label} flexGrow={1} align="left">
                    <>
                      Whitelist Discount{' '}
                      {isWhitelisted ? `(${data.whitelistDiscountPercent}%)` : ''}
                    </>
                  </Text>
                  <Text className={classes.label}>{formatUSDValue(discountUSD)}</Text>
                </Box>
                <Box display="flex" marginTop={0.75}>
                  <Text className={cls(classes.highlight)} flexGrow={1} align="left">
                    Amount to Commit & Receive
                  </Text>
                  <Text className={classes.highlight}>{formatUSDValue(receiveUSD)}</Text>
                </Box>
              </Box>

              <FancyButton
                walletRequired
                className={classes.actionButton}
                disabled
                variant="contained"
                color="primary"
              >
                Coming Soon
              </FancyButton>
              <Divider className={classes.divider} />
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="center">
                  Your Committed & To Receive
                </Text>
              </Box>

              {zilToken && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  className={classes.committedBox}
                  paddingX={2}
                  paddingY={2}
                  marginTop={2}
                  alignItems="center"
                >
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CurrencyLogo currency={zilToken.symbol} />
                    <Text className={classes.committedBoxLabel}>ZIL</Text>
                  </Box>
                  <Box display="flex" flexDirection="column">
                    <Text className={classes.committedBoxAmount}>-</Text>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SampleILOCard;
