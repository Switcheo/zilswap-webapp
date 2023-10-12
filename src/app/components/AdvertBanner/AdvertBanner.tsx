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

// const BANNER_SPEC = {
//   src: "/assets/torch-banner.jpeg",
//   href: "https://torchwallet.io",
// }
const BANNER_SPEC = null as {
  src: string;
  href: string;
} | null;

const AdvertBanner = () => {
  const classes = useStyles();

  if (!BANNER_SPEC) return null;

  return <Box className={classes.banner} maxWidth={800} margin="0 auto">
    <a href={BANNER_SPEC.href} target="_blank" rel="noreferrer">
      <img className={classes.bannerImage} src={BANNER_SPEC.src} alt="" />
    </a>
  </Box>
}

export default AdvertBanner
