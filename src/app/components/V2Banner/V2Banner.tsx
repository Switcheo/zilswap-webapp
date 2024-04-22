import React from "react";
import { Box, makeStyles } from "@material-ui/core";
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import cls from "classnames";
import { AppTheme } from "app/theme/types";


export interface BannerProps {
  rootClass?: string
}

const ZILSWAP_V2_URL = "https://v2.zilswap.io/"

const V2Banner: React.FC<BannerProps> = (props: BannerProps) => {
  const { rootClass } = props
  const classes = useStyles()

  return (
    <Box className={cls(classes.root, rootClass)} onClick={() => {
      window.location.href = ZILSWAP_V2_URL
    }}>
      <span style={{ fontSize: "24px" }}>🔥</span>
      &nbsp;
      ZilSwap V2 [Beta] is LIVE! Try it out now
      <ArrowForwardIcon />
    </Box>
  )
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: 'flex',
    width: 'max-content',
    backgroundColor: 'rgba(0, 255, 176, 0.1)',
    border: '1px solid #00FFB0',
    padding: '12px 24px',
    alignItems: 'center',
    borderRadius: '12px',
    marginBottom: theme.spacing(2),
    // text styles
    fontFamily: 'Avenir Next',
    fontSize: 14,
    color: '#00FFB0',
    fontWeight: 600,
    "&:hover": {
      cursor: 'pointer'
    }
  },
  currencyLogo: {
    height: 30,
    width: 30,
  },
}))

export default V2Banner
