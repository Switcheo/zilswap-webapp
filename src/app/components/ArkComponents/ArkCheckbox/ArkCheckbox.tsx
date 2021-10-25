import React, { useState } from "react";
import {
  FormControl, FormControlLabel, FormControlProps,
  Checkbox, Typography, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { ReactComponent as Checked } from "./checked.svg";
import { ReactComponent as UnChecked } from "./uncheck.svg";
import { ReactComponent as CheckedLight } from "./checked-light.svg";
import { ReactComponent as UnCheckedLight } from "./uncheck-light.svg";

interface Props extends FormControlProps {
  lineHeader: string;
  lineFooter: string;
  isChecked?: boolean;
  onChecked?: (checked: boolean) => void;
}

const ArkCheckbox: React.FC<Props> = (props: Props) => {
  const { onChecked, isChecked, lineHeader, lineFooter, children, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [checked, setChecked] = useState(!!isChecked);

  const handleCheck = () => {
    setChecked(!checked);
    if (typeof onChecked === "function") {
      onChecked(!checked)
    }
  }

  return (
    <FormControl {...rest} className={cls(classes.root, className)}>
      <FormControlLabel labelPlacement="end" label={
        <>
          <Typography className={classes.header}>{lineHeader}</Typography>
          <Typography className={classes.footer}>{lineFooter}</Typography>
        </>
      }
        control={<Checkbox
          onChange={() => handleCheck()} checked={checked}
          icon={
            theme.palette.type === "dark" ? <UnChecked className={classes.checkbox} /> : <UnCheckedLight className={classes.checkbox} />

          }
          checkedIcon={
            theme.palette.type === "dark" ? <Checked className={classes.checkbox} /> : <CheckedLight className={classes.checkbox} />
          }
        />}
      />
    </FormControl>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    '& .MuiIconButton-root': {
      "&:hover": {
        backgroundColor: theme.palette.type === "dark" ? "rgba(222, 255, 255, 0.08)" : "rgba(0, 51, 64, 0.05)",
      },
    }
  },
  header: {
    fontSize: 14,
    fontWeight: 900,
    fontFamily: "'Raleway', sans-serif",
  },
  footer: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.2),
    fontSize: 11,
    opacity: 0.5,
    fontFamily: "Avenir Next",
  },
  checkbox: {
    borderRadius: 3
  }
}));

export default ArkCheckbox;