import { Tooltip, TooltipProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as TooltipSVG } from "./tooltip.svg";

interface Props extends Omit<TooltipProps, "children"> {
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  tooltip: {
    backgroundColor: theme.palette.background.tooltip,
  },
  tooltipArrow: {
    "&::before": {
      color: theme.palette.background.tooltip,
    },
  },
  tooltipSVG: {
    marginLeft: theme.spacing(1),
    height: 12,
    verticalAlign: "middle",
    "& #helpInfo": {
      "& #Oval": {
        stroke: theme.palette.text?.secondary
      },
      "& #questionMarkTop": {
        fill: theme.palette.text?.secondary
      },
      "& #questionMarkBottom": {
        fill: theme.palette.text?.secondary
      }
    },
    "&:hover": {
      "& #helpInfo": {
        "& #Oval": {
          stroke: theme.palette.icon
        },
        "& #questionMarkTop": {
          fill: theme.palette.icon
        },
        "& #questionMarkBottom": {
          fill: theme.palette.icon
        }
      }
    }
  }
}));

const HelpInfo: React.FC<Props> = (props: Props) => {
  const { className, classes, ...rest } = props;
  const classNames = useStyles();

  return (
    <Tooltip arrow {...rest} className={cls(classNames.root, className)}
      classes={{ tooltip: classNames.tooltip, arrow: classNames.tooltipArrow, ...classes }}>
      <TooltipSVG className={classNames.tooltipSVG} />
    </Tooltip>
  );
};

export default HelpInfo;
