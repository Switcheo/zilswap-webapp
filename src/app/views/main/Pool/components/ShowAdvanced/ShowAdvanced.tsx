import { makeStyles, Divider, InputLabel, Tooltip, TextField, MenuItem, Typography } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import React from "react";
import { ReactComponent as TooltipSVG } from "./tooltip.svg";
import { hexToRGBA } from "app/utils";

const tooltipText = `
Lowering this limit decreases your risk of fronttruning. However, this makes it more likely that your transaction will fail due to normal price movements.
`;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {

  },
  showAdvanced: {
    backgroundColor: theme.palette.background.contrast,
    padding: `${theme.spacing(4)}px ${theme.spacing(6)}px ${theme.spacing(4)}px ${theme.spacing(6)}px`,
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  slippageRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  selectRoot: {
    height: 30,
    display: "table"
  },
  select: {
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  expire: {
    height: 30,
    width: 60,
    marginRight: theme.spacing(1),
    textAlign: "center"
  },
  expireRow: {
    display: "flex"
  },
  slippageColumn: {
  },
  expireColumn: {
  },
  selectedDropdown: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.background.default
  },
  tooltipSVG: {
    marginLeft: theme.spacing(1),
    height: 12,
    verticalAlign: "middle"
  },
  tooltip: {
    backgroundColor: theme.palette.background.tooltip,
    color: theme.palette.background.default
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  minutes: {
    display: "flex",
    alignItems: "center"
  }
}));

const ShowAdvanced = (props: any) => {
  const { showAdvanced, give, receive,
    giveCurrency, receiveCurrency, slippage,
    limitSlippage, handleLimitSlippage, handleExpire,
    setShowSlippageDropdown, expire, showSlippageDropdown
  } = props;
  const classes = useStyles();

  if (!showAdvanced) return null;

  return (
    <div className={classes.showAdvanced}>
      <div>You are giving <span>{give} {giveCurrency}</span> for at least {receive} {receiveCurrency}</div>
      <div>Expected price slippage {slippage}%</div>
      <Divider className={classes.divider} />
      <div className={classes.slippageRow}>
        <div className={classes.slippageColumn}>
          <InputLabel>Set Limit Add. Price Slippage<Tooltip placement="top" classes={{ tooltip: classes.tooltip }} title={tooltipText}><TooltipSVG className={classes.tooltipSVG} /></Tooltip></InputLabel>
          <TextField
            variant="outlined"
            value={limitSlippage}
            onChange={handleLimitSlippage}
            select
            SelectProps={{
              classes: {
                root: classes.selectRoot,
                select: classes.select
              },
              onOpen: () => setShowSlippageDropdown(true),
              onClose: () => setShowSlippageDropdown(false)
            }}
          >
            <MenuItem classes={{ selected: classes.selectedDropdown }} value={0.1}>0.1 %</MenuItem>
            <MenuItem classes={{ selected: classes.selectedDropdown }} value={0.5}>0.5 % {showSlippageDropdown && "(Suggested)"}</MenuItem>
            <MenuItem classes={{ selected: classes.selectedDropdown }} value={1}>1 %</MenuItem>
          </TextField>
        </div>
        <div className={classes.expireColumn}>
          <InputLabel>Set Expire</InputLabel>
          <div className={classes.expireRow}>
            <TextField
              variant="outlined"
              value={expire}
              InputProps={{
                className: classes.expire,
              }}
              inputProps={{
                style: {
                  textAlign: "center"
                }
              }}
              onChange={handleExpire}
            />
            <Typography className={classes.minutes}>Mins</Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowAdvanced;