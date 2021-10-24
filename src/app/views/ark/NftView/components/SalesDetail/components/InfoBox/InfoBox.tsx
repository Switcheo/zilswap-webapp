import React from "react";
import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { AppTheme } from "app/theme/types";
import { Text, ArkBox } from "app/components";

interface Props extends BoxProps {
  topLabel?: string;
  bottomLabel?: string;
  tooltip?: string;
}

const InfoBox: React.FC<Props> = (props: Props) => {
  const { children, className, topLabel, bottomLabel, tooltip, ...rest } = props;
  const classes = useStyles();

  return (
    <ArkBox {...rest} className={cls(classes.root, className)}>
      {!!topLabel && (
        <Box display="flex" justifyContent="center" marginBottom={0.5}>
          <Text className={classes.topLabel} variant="body1">{topLabel}</Text>
          {typeof tooltip === "string" && (
            <InfoOutlinedIcon className={classes.infoIcon} />
          )}
        </Box>
      )}

      <Box className={classes.content}>
        {children}
      </Box>

      {!!bottomLabel && <Text className={classes.bottomLabel}>{bottomLabel}</Text>}
    </ArkBox>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2, 4),
  },
  content: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  infoIcon: {
    opacity: 0.5,
    fontSize: 14,
    marginLeft: theme.spacing(.5),
  },
  topLabel: {
    fontSize: 14,
  },
  bottomLabel: {
    opacity: 0.5,
    marginTop: theme.spacing(.5),
    textAlign: "center",
  },
}));

export default InfoBox;
