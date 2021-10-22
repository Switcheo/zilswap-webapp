import React from "react";
import { Paper, PaperProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends PaperProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    maxWidth: 488,
    margin: "0 auto",
    marginBottom: theme.spacing(2),
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.border,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
}));

const ILOCard: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Paper {...rest} className={cls(classes.root, className)}>
      {children}
    </Paper>
  );
};

export default ILOCard;
