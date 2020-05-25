import { Box, InputLabel, Tooltip, TextField, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { ReactComponent as TooltipSVG } from "./tooltip.svg";
import React, { useState, ChangeEvent } from "react";
import { AppTheme } from "app/theme/types";
import { RootState } from "app/store/types";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "app/store";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
  selectRoot: {
    height: 30,
    display: "table",
  },
  selectMenu: {
    padding: 2,
  },
  selectedDropdown: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.background.default,
    borderRadius: 2
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
}));

const SlippageField: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const slippage = useSelector<RootState, number>(state => state.swap.slippage);
  const classes = useStyles();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    dispatch(actions.Swap.update({ slippage: value }))
  };

  const selectProps = {
    MenuProps: {
      classes: {
        list: classes.selectMenu,
      }
    },
    classes: {
      root: classes.selectRoot,
      select: classes.select,
    },
    onOpen: () => setShowDropdown(true),
    onClose: () => setShowDropdown(false)
  };
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel>Set Limit Add. Price Slippage
      <Tooltip placement="top"
          classes={{ tooltip: classes.tooltip }}
          title="Lowering this limit decreases your risk of fronttruning. However, this makes it more likely that your transaction will fail due to normal price movements.">
          <TooltipSVG className={classes.tooltipSVG} />
        </Tooltip>
      </InputLabel>

      <TextField
        variant="outlined"
        value={slippage}
        onChange={onChange}
        select
        SelectProps={selectProps}>
        <MenuItem classes={{ selected: classes.selectedDropdown }} value={0.001}>0.1 %</MenuItem>
        <MenuItem classes={{ selected: classes.selectedDropdown }} value={0.005}>0.5 % {showDropdown && "(Suggested)"}</MenuItem>
        <MenuItem classes={{ selected: classes.selectedDropdown }} value={0.010}>1.0 %</MenuItem>
      </TextField>
    </Box>
  );
};

export default SlippageField;