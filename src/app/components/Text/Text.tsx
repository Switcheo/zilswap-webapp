import { Box, Tooltip, TooltipProps, Typography, TypographyProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { extractBoxProps, PartialBoxProps } from "app/utils";
import clsx from "clsx";
import React from "react";

interface Props extends TypographyProps, PartialBoxProps {
  isPlaceholder?: boolean;
}

const TooltipWrapper: React.FC<Omit<TooltipProps, "title"> & { show: boolean }> = ({ children, show, ...rest }) => {
  if (!show) return children;

  return <Tooltip title="Placeholder content" arrow {...rest}>{children}</Tooltip>
}

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const Text: React.FC<Props> = (props: Props) => {
  const { boxProps, restProps } = extractBoxProps(props)
  const { className, children, isPlaceholder, ...rest } = restProps

  const classes = useStyles()

  return (
    <Box {...boxProps}>
      <TooltipWrapper show={isPlaceholder}>
        <Typography
          variant="body1"
          color="textPrimary"
          {...rest}
          className={clsx(classes.root, className)}
        >
          {children}
        </Typography>
      </TooltipWrapper>
    </Box>
  );
};

export default Text;
