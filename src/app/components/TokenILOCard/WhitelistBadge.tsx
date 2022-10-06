import React from 'react';
import cls from 'classnames';
import { Box, Typography, Tooltip, makeStyles } from '@material-ui/core';
import { ZWAP_TOKEN_CONTRACT } from 'core/zilswap/constants';
import { useNetwork } from 'app/utils';
import { Text, CurrencyLogo } from 'app/components';
import { AppTheme } from 'app/theme/types';

interface Props {
  whitelisted: boolean;
<<<<<<< HEAD
  minZwap: number;
  discount: number;
=======
>>>>>>> staging
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    padding: theme.spacing(0.5, 0.5, 0.5, 1),

    backgroundColor: `rgba(222, 255, 255, 0.1)`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
    [theme.breakpoints.down('xs')]: {
      // padding: theme.spacing(2, 2, 0),
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
    opacity: 0.5,
  },
  logo: {
    height: '22px',
  },
  tooltip: {
    borderRadius: 12,
    backgroundColor: theme.palette.background.tooltip,
    border: theme.palette.border,
    color: theme.palette.text?.secondary,
    padding: theme.spacing(1.5),
    fontSize: 11,
  },
}));

<<<<<<< HEAD
const WhitelistBadge = ({ whitelisted, minZwap, discount }: Props) => {
=======
const WhitelistBadge = ({ whitelisted }: Props) => {
>>>>>>> staging
  const classes = useStyles();
  const network = useNetwork();
  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
  return (
    <Box className={classes.container}>
      {whitelisted ? (
        <Text className={classes.text}>You're Whitelisted</Text>
      ) : (
        <Tooltip
<<<<<<< HEAD
          title={`You need to hold more than ${minZwap} $ZWAP for at least 2 days in order to get whitelisted for a ${discount}% discount.`}
=======
          title="You need to hold more than 46.46 $ZWAP for at least 2 days in order to get whitelisted for a 5% discount."
>>>>>>> staging
          placement="top"
          classes={{ tooltip: classes.tooltip }}
        >
          <Typography
            variant="body1"
            color="textPrimary"
            className={cls(classes.textFade, classes.text)}
          >
            How to get Whitelisted?
          </Typography>
        </Tooltip>
      )}
      <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.logo} />
    </Box>
  );
};

export default WhitelistBadge;
