import { Box, Card, CardContent, CardProps, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AmountLabel, KeyValueDisplay, PoolLogo, Text } from "app/components";
import { AppTheme } from "app/theme/types";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";

interface Props extends CardProps { }

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: theme.spacing(.5),
    boxShadow: theme.palette.cardBoxShadow,
  },
  title: {
    backgroundColor: theme.palette.background.contrastAlternate,
    padding: theme.spacing(3, 4)
  },
  poolIcon: {
    marginRight: theme.spacing(2),
  },
  content: {
    padding: theme.spacing(4),
  },
  rewardValue: {
    fontSize: '20px',
    lineHeight: '22px',
  },
  thinSubtitle: {
    fontWeight: 400,
  },
}));

const PoolInfoCard: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardContent className={classes.title}>
        <Box display="flex" alignItems="center">
          <PoolLogo className={classes.poolIcon} pair={["SWTH", "XSGD"]} />
          <Text variant="h2">SWTH - XSGD</Text>
        </Box>
      </CardContent>
      <CardContent className={classes.content}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flex={1}>
            <Text color="textSecondary" variant="subtitle2" marginBottom={1.5}>ZAP Rewards</Text>
            <Box display="flex" alignItems="baseline">
              <Text color="primary" className={classes.rewardValue} marginRight={1}>281,180 ZAP</Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ next epoch</Text>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" flex={1}>
            <Text color="textSecondary" align="right" variant="subtitle2" marginBottom={1.5}>ROI</Text>
            <Box display="flex" alignItems="baseline" justifyContent="flex-end">
              <Text color="textPrimary" className={classes.rewardValue} marginRight={1}>1.42%</Text>
              <Text color="textPrimary" variant="subtitle2" className={classes.thinSubtitle}>/ daily</Text>
            </Box>
          </Box>
        </Box>

        <Box marginY={3.5}>
          <Divider color="primary" />
        </Box>

        <Box display="flex" flexDirection="column">
          <KeyValueDisplay marginBottom={2.25} kkey="Total Liquidity" ValueComponent="span">
            <Text>$1,820,852.21</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="Volume (24hrs)" ValueComponent="span">
            <Text>$61,387,541</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="Current Pool Size" ValueComponent="span">
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <AmountLabel marginBottom={1} currency="SWTH" amount={new BigNumber(1833023)} />
              <AmountLabel currency="ZIL" amount={new BigNumber(34093821)} />
            </Box>
          </KeyValueDisplay>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PoolInfoCard;
