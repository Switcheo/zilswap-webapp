import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
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
    overflow: 'hidden',
    boxShadow: '0 8px 16px 0 rgba(20, 155, 163, 0.16),',
  }
}));

const ArkCTABanner = () => {
  const classes = useStyles();

  return <Box className={classes.banner} maxWidth={800} margin="0 auto">
    <Link to="/ark">
      <img className={classes.bannerImage} src="/assets/202111-ark-webbanner.png" alt="" />
    </Link>
  </Box>
}

export default ArkCTABanner
