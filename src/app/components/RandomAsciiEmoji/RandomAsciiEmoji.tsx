import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";

const EMOJIS = [
  "( ႎ _ ႎ )",
  "¯\\_(ツ)_/¯",
  "༼つ◕_◕༽つ",
  "(ง •̀_•́)ง",
  "(っ˘ڡ˘ς)",
  "ƪ(‾ε‾“)ʃ",
  "(•ิ_•ิ)",
  "(ᵔᴥᵔ)",
  "\\ (•◡•) /",
  "~(˘▾˘~)",
];

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    opacity: .5,
  },
  emoji: {
    margin: theme.spacing(4, 0),
    fontSize: 64,
    fontFamily: "Roboto Mono",
    [theme.breakpoints.down("sm")]: {
      fontSize: 42,
    },
  },
}));
const SampleComponent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Typography variant="h4">Coming Soon…</Typography>
      <Typography className={classes.emoji} >{EMOJIS[~~(Math.random() * EMOJIS.length)]}</Typography>
      <Typography variant="caption" style={{fontWeight: "normal", fontStyle: "italic"}}>Meanwhile, enjoy a random art…</Typography>
    </Box>
  );
};

export default SampleComponent;