import { Box, Typography, makeStyles } from '@material-ui/core'
import { hexToRGBA, extractBoxProps, PartialBoxProps } from "app/utils";
import React from "react";

interface Props extends PartialBoxProps {
  progress: number
}

const useStyles = makeStyles(theme => ({
  progressBar: {
    border: `1px solid rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`,
  },
  text: {
    color: 'white',
  },
  lowProgressText: {
    color: theme.palette.text.primary,
  }
}));


const ProgressBar: React.FC<Props> = (props: Props) => {
  const { boxProps } = extractBoxProps(props)
  const { progress } = props
  const classes = useStyles()

  return (
    <Box {...boxProps} className={classes.progressBar} border={1} position="relative" display="flex" alignItems="stretch" bgcolor="background.default" borderRadius={4}>
      <Box bgcolor="primary.main" padding={2} width={`${progress}%`} borderRadius={4} />

      <Box position="absolute" top={0} bottom={0} left={0} right={0} display="flex" alignItems="center" justifyContent="center">
        <Typography className={progress >= 55 ? classes.text : classes.lowProgressText}>
          {props.progress}%
        </Typography>
      </Box>
    </Box>
  )
}

export default ProgressBar