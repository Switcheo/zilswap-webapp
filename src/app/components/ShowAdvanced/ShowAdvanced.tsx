import { Box, IconButton, makeStyles, Typography, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import { ContrastBox } from "app/components";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useMoneyFormatter } from "app/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExpiryField, SlippageField, FancyButton } from "app/components";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CloseIcon from '@material-ui/icons/Close';
import { actions } from "app/store";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  showAdvanced: {
    padding: theme.spacing(2, 4, 2),
    flex: 1,
    backgroundColor: "rgba(1, 1, 1, 0.0)",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 2),
    },
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  text: {
    fontWeight: 400,
    letterSpacing: 0
  },
  accordion: {
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    "&last-child": {
      borderBottomRightRadius: "12px",
      borderBottomLeftRadius: "12px",
    }
  },
  iconButton: {
    color: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.5)" : "#003340",
    backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.1)" : "#D4FFF2",
    borderRadius: 12,
    padding: 5,
    marginLeft: 5,
  },
  actionButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    height: 46
  },
}));


const PREFERRED_SLIPPAGE = 0.01;
const PREFERRED_BLOCK = 15;

const ShowAdvanced = (props: any) => {
  const { showAdvanced } = props;
  const classes = useStyles();
  const moneyFormat = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 5 });
  const slippage = useSelector<RootState, number>(state => state.swap.slippage);
  const expiry = useSelector<RootState, number>(state => state.swap.expiry);
  const dispatch = useDispatch();
  const [newSlippage, setNewSlippage] = useState<number>(slippage);
  const [newExpiry, setNewExpiry] = useState<number>(expiry);

  if (!showAdvanced) return null;

  const updateSetting = () => {
    if (typeof newSlippage === "number" && slippage !== newSlippage) dispatch(actions.Swap.update({ slippage: newSlippage }));
    if (typeof newExpiry === "number" && expiry !== newExpiry) dispatch(actions.Swap.update({ expiry: newExpiry }));
  }

  const resetSetting = () => {
    dispatch(actions.Swap.update({ slippage: PREFERRED_SLIPPAGE }));
    dispatch(actions.Swap.update({ expiry: PREFERRED_BLOCK }));
    setNewExpiry(PREFERRED_BLOCK);
    setNewSlippage(PREFERRED_SLIPPAGE);
  }

  return (
    <ContrastBox className={classes.showAdvanced}>
      <Box alignItems="center" display="flex" mb={2} width="100%">
        <Typography variant="h3">Advanced Settings</Typography>
        <Box flexGrow={1} />
        <IconButton className={classes.iconButton} onClick={() => { setNewSlippage(slippage); dispatch(actions.Layout.showAdvancedSetting(false)) }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Accordion className={classes.accordion}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Box display="flex" width="100%">
            <Typography>Slippage Tolerance</Typography>
            <Box flexGrow={1} />
            <Typography>{moneyFormat((slippage || 0) * 100)}%</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <SlippageField updateInputSlippage={setNewSlippage} />
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.accordion}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Box display="flex" width="100%">
            <Typography>Block Expiry</Typography>
            <Box flexGrow={1} />
            <Typography>{expiry} Blocks</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <ExpiryField newExpiry={newExpiry} updateNewExpiry={setNewExpiry} />
        </AccordionDetails>
      </Accordion>

      <Box flexGrow={1}/>

      <FancyButton
        variant="contained"
        color="primary"
        className={classes.actionButton}
        disabled={slippage === newSlippage && expiry === newExpiry}
        onClick={() => updateSetting()}
      >
        Save
      </FancyButton>
      <FancyButton
        variant="contained"
        color="primary"
        className={classes.actionButton}
        onClick={() => resetSetting()}
      >
        Reset
      </FancyButton>
    </ContrastBox>
  )
}

export default ShowAdvanced;
