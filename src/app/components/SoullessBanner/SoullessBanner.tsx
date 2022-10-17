import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { AppTheme } from 'app/theme/types';

const useStyles = makeStyles((theme: AppTheme) => ({
  banner: {
    padding: theme.spacing(2, 2),
    paddingBottom: 0,
    marginTop: 10,
    marginBottom: -18,
  },
  bannerImage: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 12,
    overflow: 'hidden'
  }
}));

const SoullessBanner = () => {
  const classes = useStyles();

  return <Box className={classes.banner} maxWidth={800} margin="0 auto">
    <a href="/arky/collections/zil1q3jmtxnyzzgznt5f972et240svvycfq3y5exf4?search=&sortBy=price&sortDir=asc" target="_blank" rel="noreferrer">
      <img className={classes.bannerImage} src="/assets/soulless-banner.png" alt="" />
    </a>
  </Box>
}

export default SoullessBanner