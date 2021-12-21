import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';

const useStyles = makeStyles((theme: AppTheme) => ({
  banner: {
    padding: theme.spacing(0, 2),
    paddingBottom: 0,
    marginTop: theme.spacing(2),
  },
  bannerImage: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 8px 16px 0 rgba(20, 155, 163, 0.16),',
  }
}));

const ZilTokenSwapCTABanner = () => {
  const classes = useStyles();

  return (
    <Box className={classes.banner} maxWidth={800} margin="0 auto">
      <RouterLink to="/bridge/erc20-zil-swap">
        <img className={classes.bannerImage} src="/assets/202112-erc20-zil-swap.png" alt="" />
      </RouterLink>
    </Box>
  )
}

export default ZilTokenSwapCTABanner
