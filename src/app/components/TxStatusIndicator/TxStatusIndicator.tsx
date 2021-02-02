import { Box, BoxProps, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CheckCircleOutlineRounded, ErrorOutlineRounded } from "@material-ui/icons";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {
  error?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  error: {
    color: theme.palette.error.main,
  },
  success: {
    color: theme.palette.success.main,
  },
}));

const TxStatusIndicator: React.FC<Props> = (props: Props) => {
  const { children, className, error, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {!!error && (
        <Tooltip arrow title="Transaction failed">
          <ErrorOutlineRounded className={classes.error} />
        </Tooltip>
      )}
      {!error && (
        <Tooltip arrow title="Successful transaction">
          <CheckCircleOutlineRounded className={classes.success} />
        </Tooltip>
      )}
    </Box>
  );
};

export default TxStatusIndicator;
