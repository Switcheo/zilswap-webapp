import React from 'react';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { PartialBoxProps, extractBoxProps } from 'app/utils';

interface Props extends PartialBoxProps {
  progress: number;
  threshold?: number;
}

const useStyles = makeStyles(theme => ({
  root: {},
  background: {
    backgroundColor: theme.palette.primary.dark,
  },
  text: {
    color: theme.palette.primary.contrastText,
    textShadow: '0 0 4px rgba(0,0,0,0.95)',
  },
  barBackground: {
    backgroundColor: 'rgba(0, 51, 64, 0.5)',
  },
  thresholdBox: {
    width: '100%',
    left: '0px',
  },
}));

const ProgressBar: React.FC<Props> = (props: Props) => {
  const { boxProps } = extractBoxProps(props);
  const { progress, threshold } = props;
  const classes = useStyles();
  console.log('threshold', threshold);

  return (
    <Box
      marginTop={10}
      bgcolor="background.contrast"
      display="flex"
      flexDirection="column"
      borderRadius={12}
      padding={1}
      position="relative"
    >
      <Box
        {...boxProps}
        className={classes.barBackground}
        position="relative"
        display="flex"
        alignItems="stretch"
        bgcolor="background.default"
        borderRadius={12}
        mt={0}
      >
        <Box
          padding={2}
          width={`${progress}%`}
          borderRadius={12}
          className={classes.background}
        />
        <Box
          className={classes.text}
          fontWeight="fontWeightBold"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography className={classes.text}>{progress}%</Typography>
        </Box>
      </Box>
      {/* {threshold && (
        <Box className={classes.thresholdBox} position="absolute">
          <span>{threshold}</span>
        </Box>
      )} */}
    </Box>
  );
};

export default ProgressBar;
