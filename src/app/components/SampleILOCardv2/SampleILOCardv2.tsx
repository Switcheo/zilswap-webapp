import React from 'react';
import { Box, Link, makeStyles } from '@material-ui/core';
import cls from 'classnames';
import { Dayjs } from 'dayjs';
import { ILOData } from 'core/zilo/constants';
import { FancyButton, Text } from 'app/components';
import { ReactComponent as NewLinkIcon } from 'app/components/new-link.svg';
import ProgressBar from 'app/components/ProgressBar';
import { AppTheme } from 'app/theme/types';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    paddingBottom: theme.spacing(2.5),
    // "& .MuiBox-root": {
    //   flex: 1
    // }
  },
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  description: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
  },
  title: {
    fontWeight: 700,
    marginTop: theme.spacing(3),
  },
  meta: {
    fontFamily: "'Raleway', sans-serif",
    textAlign: 'center',
  },
  svg: {
    maxWidth: '100%',
    width: 'unset',
    height: 'unset',
    flex: 1,
    borderRadius: '12px 12px 0 0',
  },
  actionButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    height: 46,
  },
  expandButton: {
    background: 'none',
    border: 'none',
  },
  timer: {
    color: theme.palette.primary.dark,
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  viewIcon: {
    color: theme.palette.primary.dark,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: '-12px',
    transform: 'translateY(-50%)',
  },
  label: {
    color: theme.palette.label,
  },
  link: {
    fontWeight: 600,
    color: theme.palette.text?.secondary,
    marginTop: theme.spacing(0.5),
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    verticalAlign: 'top',
    '& path': {
      fill: theme.palette.text?.secondary,
    },
  },
}));

interface Props {
  expanded?: boolean;
  data: ILOData;
  blockTime: Dayjs;
  currentBlock: number;
  currentTime: Dayjs;
}

const SampleILOCard = (props: Props) => {
  const { data, expanded = true } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box>
        <button className={classes.expandButton}>
          <img className={classes.svg} src={data.imageURL} alt={data.tokenName} />
        </button>
      </Box>
      {expanded && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            className={classes.meta}
          >
            <Text variant="h1" className={cls(classes.title, classes.meta)}>
              {data.tokenName} ({data.tokenSymbol})
            </Text>
            <Text marginTop={2} marginBottom={0.75} className={classes.description}>
              {data.description}
            </Text>
            {!!data.projectURL && (
              <Link
                className={classes.link}
                underline="none"
                rel="noopener noreferrer"
                target="_blank"
                href={data.projectURL}
              >
                Learn more about this token <NewLinkIcon className={classes.linkIcon} />
              </Link>
            )}

            <Text variant="h1" marginTop={2} className={classes.timer}>
              Coming Soon…
            </Text>

            <ProgressBar progress={0} marginTop={3} />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  Total Committed
                </Text>
                <Text className={classes.label}>$0.00 (0%)</Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  <strong>Total Target</strong>
                </Text>
                <Text className={classes.label}>
                  <strong>{data.usdTarget}</strong>
                </Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  &nbsp; • &nbsp; ZIL to Raise
                </Text>
                <Text className={classes.label}>TBD</Text>
              </Box>
            </Box>

            <Box>
              <Text
                className={cls(classes.title, classes.description)}
                marginBottom={0.75}
              >
                Commit your $ZIL to participate.
              </Text>
              <FancyButton
                className={classes.actionButton}
                disabled
                variant="contained"
                color="primary"
              >
                Waiting to begin
              </FancyButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SampleILOCard;
