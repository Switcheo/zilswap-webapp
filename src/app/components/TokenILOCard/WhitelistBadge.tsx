import React from 'react';
import cls from 'classnames';
import { Box, Typography, Tooltip, makeStyles } from '@material-ui/core';
import { ZWAP_TOKEN_CONTRACT } from 'core/zilswap/constants';
import { useNetwork } from 'app/utils';
import { Text, CurrencyLogo } from 'app/components';
import { AppTheme } from 'app/theme/types';

interface Props {
  whitelisted: boolean;
  minZwap: number;
  discount: number;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    padding: theme.spacing(0.5, 0.5, 0.5, 1),
    backgroundColor: `rgba(222, 255, 255, 0.1)`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
    cursor: 'grab',
    '&:hover': {
      '& #text-tooltip': {
        color: '#00FFB0',
      },
    },
  },
  text: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text?.primary,
    lineHeight: 1.7,
    marginTop: 2,
  },
  textFade: {
    opacity: 0.7,
  },
  logo: {
    height: '22px',
  },
  tooltip: {
    borderRadius: 12,
    backgroundColor: theme.palette.background.tooltip,
    border: theme.palette.border,
    color: theme.palette.text?.primary,
    padding: theme.spacing(1.5),
    fontSize: 14,
    maxWidth: '280px',
  },
}));

const WhitelistBadge = ({ whitelisted, minZwap, discount }: Props) => {
  const classes = useStyles();
  const network = useNetwork();
  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
  if (whitelisted) {
    return (
      <Box className={classes.container}>
        <Text className={classes.text}>You're Whitelisted</Text>
        <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.logo} />
      </Box>
    );
  }
  return (
    <Tooltip
      title={`You need to hold more than ${minZwap} $ZWAP for at least 2 days in order to get whitelisted for a ${discount}% discount.`}
      placement="top"
      classes={{ tooltip: classes.tooltip }}
    >
      <Box className={classes.container}>
        <Typography
          variant="body1"
          color="textPrimary"
          className={cls(classes.textFade, classes.text)}
          id="text-tooltip"
        >
          How to get Whitelisted?
        </Typography>
        <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.logo} />
      </Box>
    </Tooltip>
  );
};

export default WhitelistBadge;
