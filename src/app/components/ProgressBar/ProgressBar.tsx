import { Box, makeStyles } from "@material-ui/core";
import { extractBoxProps, PartialBoxProps } from "app/utils";
import React from "react";

interface Props extends PartialBoxProps {
  progress: number
}

const useStyles = makeStyles(theme => ({
  root: {
  },
  background: {
    backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
  },
  text: {
    color: theme.palette.type === "dark" ? "#003340" : "#DEFFFF"
  }
}));

const ProgressBar: React.FC<Props> = (props: Props) => {
  const { boxProps, restProps } = extractBoxProps(props)
  const { children, className, ...rest } = restProps;
  const classes = useStyles();

  return (
    <Box marginTop={3} bgcolor="background.contrast" display="flex" flexDirection="column" borderRadius={12} padding={1}>
      <Box {...rest} position="relative" display="flex" alignItems="stretch" bgcolor="background.default" borderRadius={12}>
        <Box padding={2} width={`${props.progress}%`} borderRadius={12} className={classes.background}/> 

        <Box className={classes.text} fontWeight="fontWeightBold" position="absolute" top={0} bottom={0} left={0} right={0} display="flex" alignItems="center" justifyContent="center">
          <span>{props.progress}%</span>
        </Box>
      </Box>
    </Box>
  )
}

export default ProgressBar