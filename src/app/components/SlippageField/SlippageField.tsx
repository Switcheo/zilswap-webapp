import { Box, BoxProps, Button, InputLabel, TextField, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as TooltipSVG } from "./tooltip.svg";

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
  },
  inputWrapper: {
    height: 30,
    width: 70,
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(.5),
    textAlign: "center",
  },
  input: {
    fontSize: "0.75rem !important",
    padding: `${theme.spacing(.5, 1)} !important`,
    textAlign: "center",
  },
  optionButton: {
    width: "unset",
    borderRadius: 0,
    minWidth: 0,
    padding: theme.spacing(0, 1),
  },
  optionText: {
    fontSize: "0.75rem",
    lineHeight: "1.875rem",
  },
}));

const DEFAULT_SLIPPAGE_LABEL = "Set Limit Add. Price Slippage";

const PRESET_SLIPPAGE = [0.001, 0.005, 0.01];
const PREFERRED_SLIPPAGE = 0.005;

type Props = BoxProps & {
  label?: string;
};
const SlippageField: React.FC<Props> = (props: Props) => {
  const { children, className, label, ...rest } = props;
  const dispatch = useDispatch();
  const slippage = useSelector<RootState, number>(state => state.swap.slippage);
  const [inputSlippage, setInputSlippage] = useState(new BigNumber(slippage).shiftedBy(2).toString());
  const [error, setError] = useState("");
  const classes = useStyles();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue.length > 4) return;

    setInputSlippage(inputValue);
    const value = Number(inputValue);

    if (isNaN(slippage) || !isFinite(slippage) || value < 0 || value >= 50) {
      setError("Invalid slippage input");

      return;
    }
    onChangeValue(new BigNumber(value).shiftedBy(-2));
  };

  const onSelectPreset = (preset: number) => {
    const slippage = new BigNumber(preset);
    setInputSlippage(slippage.shiftedBy(2).toFormat(1));
    onChangeValue(slippage);
  };

  const onChangeValue = (slippage: BigNumber) => {
    setError("");
    dispatch(actions.Swap.update({ slippage: slippage.toNumber() }));
  };

  const onEndEditing = () => {
    if (!error.length)
      setInputSlippage(new BigNumber(slippage).shiftedBy(2).toFormat(1));
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel>{label || DEFAULT_SLIPPAGE_LABEL}
        <Tooltip placement="top"
          classes={{ tooltip: classes.tooltip }}
          title="Lowering this limit decreases your risk of fronttruning. However, this makes it more likely that your transaction will fail due to normal price movements.">
          <TooltipSVG className={classes.tooltipSVG} />
        </Tooltip>
      </InputLabel>

      <Box>
        <TextField
          variant="outlined"
          value={inputSlippage}
          onChange={onChange}
          onBlur={onEndEditing}
          InputProps={{ className: classes.inputWrapper, endAdornment: <span>%</span> }}
          inputProps={{ className: classes.input }} />
        {PRESET_SLIPPAGE.map((preset, index) => (
          <Button className={classes.optionButton} onClick={() => onSelectPreset(preset)} key={index}>
            <Tooltip placement="top"
              title="Suggested slippage limit"
              classes={{ tooltip: classes.tooltip }}
              open={preset === PREFERRED_SLIPPAGE ? undefined : false}>
              <Typography
                className={classes.optionText}
                color={preset === slippage ? "textPrimary" : "textSecondary"}>
                {new BigNumber(preset).shiftedBy(2).toFormat()}%
              </Typography>
            </Tooltip>
          </Button>
        ))}
      </Box>
      <Typography color="error">{error}</Typography>
    </Box >
  );
};

export default SlippageField;
