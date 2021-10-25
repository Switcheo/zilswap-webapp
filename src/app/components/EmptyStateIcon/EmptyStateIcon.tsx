import React from "react";
import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { ReactComponent as EmptyStateSVG } from "./empty-state.svg";

interface Props extends BoxProps {
  iconClass?: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

const EmptyStateIcon: React.FC<Props> = (props: Props) => {
  const { children, className, iconClass, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <EmptyStateSVG className={iconClass} />
    </Box>
  );
};

export default EmptyStateIcon;
