import { Box, makeStyles, Typography } from '@material-ui/core';
import { extractBoxProps, PartialBoxProps } from "app/utils";
import React from "react";

interface Props extends PartialBoxProps {
  progress: number
}

const useStyles = makeStyles(theme => ({
  root: {
  },
  background: {
    backgroundColor: theme.palette.primary.dark
  },
  text: {
    color: 'white',
    textShadow: '0 0 4px rgba(0,0,0,0.95)',
  },
  lowProgressText: {
    color: theme.palette.text.primary,
  }
}));

const ProgressBar: React.FC<Props> = (props: Props) => {
  const { boxProps } = extractBoxProps(props);
  const { progress } = props;
  const classes = useStyles();

  return (
    <Box marginTop={3} bgcolor="background.contrast" display="flex" flexDirection="column" borderRadius={12} padding={1}>
      <Box {...boxProps} position="relative" display="flex" alignItems="stretch" bgcolor="background.default" borderRadius={12} mt={0}>
        <Box padding={2} width={`${progress}%`} borderRadius={12} className={classes.background}/>
          <Box className={classes.text} fontWeight="fontWeightBold" position="absolute" top={0} bottom={0} left={0} right={0} display="flex" alignItems="center" justifyContent="center">
            <Typography className={progress >= 55 ? classes.text : classes.lowProgressText}>
              {progress}%
            </Typography>
          </Box>
        </Box>
    </Box>
  )
}

export default ProgressBar