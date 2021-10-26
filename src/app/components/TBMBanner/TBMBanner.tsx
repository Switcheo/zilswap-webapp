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

const TBMBanner = () => {
  const classes = useStyles();

  return <Box className={classes.banner} maxWidth={800} margin="0 auto">
    <a href="https://thebear.market" target="_blank" rel="noreferrer">
      <img className={classes.bannerImage} src="/assets/tbm-banner.svg" alt="" />
    </a>
  </Box>
}

export default TBMBanner