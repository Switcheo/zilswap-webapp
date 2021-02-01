import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import { ReactComponent as EmptyStateSVG } from "./empty-state.svg";
import React from "react";

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
