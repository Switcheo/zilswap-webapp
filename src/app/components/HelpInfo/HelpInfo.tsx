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
    '&:hover': {
      cursor: 'pointer',
    },
  },
  tooltip: {
    borderRadius: 12,
    backgroundColor: theme.palette.background.tooltip,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    color: theme.palette.text?.secondary,
    padding: theme.spacing(1.5),
    fontSize: 11,
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
    <Tooltip {...rest} className={cls(classNames.root, className)}
      classes={{ tooltip: classNames.tooltip, ...classes }}>
      <TooltipSVG className={classNames.tooltipSVG} />
    </Tooltip>
  );
};

export default HelpInfo;
