import { Box, BoxProps, Button, InputLabel, TextField, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import HelpInfo from "../HelpInfo";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: "100%"
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
    "&:hover": {
      borderRadius: "12px",
      backgroundColor: "#00FFB0",
      color: "#003340",
    }
  },
  optionText: {
    fontSize: "0.75rem",
    lineHeight: "1.875rem",
  },
  warning: {
    color: `${theme.palette.colors.zilliqa.warning}`,
  },
  inputError: {
    border: `1px solid ${theme.palette.error}`,
  },
  inputWarning: {
    border: `1px solid ${theme.palette.colors.zilliqa.warning}`,
  },
  presetSlippageBox: {
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#D4FFF2",
    borderRadius: "12px",
    border: "1px solid #29475A",
  },
  selectedSlippage: {
    borderRadius: "12px",
    backgroundColor: "#00FFB0",
    color: "#003340",
    border: "1px solid #29475A",
  }
}));


const DEFAULT_SLIPPAGE_LABEL = "Set Limit Add. Price Slippage";

const PRESET_SLIPPAGE = [0.001, 0.005, 0.01, 0.02];
const PREFERRED_SLIPPAGE = 0.01;

type Props = BoxProps & {
  label?: string;
  updateInputSlippage: (newSlippage: number) => void;
};
const SlippageField: React.FC<Props> = (props: Props) => {
  const { children, className, label, updateInputSlippage, ...rest } = props;
  const slippage = useSelector<RootState, number>(state => state.swap.slippage);
  const [inputSlippage, setInputSlippage] = useState(new BigNumber(slippage).shiftedBy(2).toFormat(1));
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
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

    if (slippage.gt(0.05))
      setWarning("High frontrun risk");
    else if (slippage.lt(0.005))
      setWarning("Your transaction may fail");
    else
      setWarning("");

    updateInputSlippage(slippage.toNumber());
  };

  const inputSlippageValue = new BigNumber(inputSlippage).shiftedBy(-2).toNumber();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel>{label || DEFAULT_SLIPPAGE_LABEL}
        <HelpInfo
          placeholder="top"
          title="Lowering this limit decreases your risk of frontruning. However, this makes it more likely that your transaction will fail due to normal price movements." />
      </InputLabel>

      <Box display="flex" mb={1} width="100%">
        <div className={classes.presetSlippageBox}>
          {PRESET_SLIPPAGE.map((preset, index) => (
            <Button className={cls(classes.optionButton, preset === inputSlippageValue && classes.selectedSlippage)} onClick={() => onSelectPreset(preset)} key={index}>
              <Tooltip placement="top"
                title="Suggested slippage limit"
                classes={{ tooltip: classes.tooltip }}
                open={preset === PREFERRED_SLIPPAGE ? undefined : false}>
                <Typography
                  className={classes.optionText}
                  color={preset === inputSlippageValue ? "primary" : "textSecondary"}>
                  {new BigNumber(preset).shiftedBy(2).toFormat()}%
              </Typography>
              </Tooltip>
            </Button>
          ))}
        </div>
        <Box flexGrow={1} />
        <TextField
          variant="outlined"
          value={inputSlippage}
          onChange={onChange}
          placeholder="custom"
          InputProps={{
            className: cls(classes.inputWrapper, {
              [classes.inputError]: error.length > 0,
              [classes.inputWarning]: warning.length > 0,
            }),
            endAdornment: <span>%</span>
          }}
          inputProps={{ className: classes.input }} />
      </Box>
      <Typography color="error">{error}</Typography>
      {!error && (<Typography className={classes.warning}>{warning}</Typography>)}
    </Box >
  );
};

export default SlippageField;
