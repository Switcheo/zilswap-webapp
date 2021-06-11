import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import { Box, makeStyles } from '@material-ui/core'
import dayjs, { Dayjs } from "dayjs";

import { Text } from "app/components";
import TokenILOCard from "app/components/TokenILOCard";
import ILOCard from "app/layouts/ILOCard";
import { RootState, WalletState } from "app/store/types";
import { useNetwork } from "app/utils";
import { ZILO_DATA } from "core/zilo/constants";
import { ZilswapConnector } from "core/zilswap";
import { AppTheme } from "app/theme/types";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  secondaryText: {
    marginTop: theme.spacing(1)
  },
  link: {
    color: theme.palette.link,
    "&:hover": {
      textDecoration: "underline"
    }
  }
}))

const CurrentView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;

  const classes = useStyles();
  const network = useNetwork();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const ziloData = ZILO_DATA[network!].filter(x => false);

  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [blockTime, setBlockTime] = useState<Dayjs>(dayjs())
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs())

  // just need to set once on network init
  useEffect(() => {
    setCurrentBlock(ZilswapConnector.getCurrentBlock())
    setBlockTime(dayjs())
    setCurrentTime(dayjs())
  }, [network])

  useEffect(() => {
    // need to listen to wallet state
    // to trigger react component reload
    // when network changes.
  }, [walletState]);

  return (
    <ILOCard {...rest}>
      {
        ziloData.length === 0 ?
          <Box display="flex" flexDirection="column" className={classes.container} textAlign="center" mb={4}>
            <Text variant="h1">Nothing here yet.</Text>
            <Text className={classes.secondaryText} color="textSecondary">
              Click <Link to="/ilo/current" className={classes.link}>here</Link> to view current ILOs.
            </Text>
          </Box>
          :
          ziloData.map(data => {
            return (
              <TokenILOCard
                key={data.contractAddress}
                expanded={true}
                data={data}
                blockTime={blockTime}
                currentBlock={currentBlock}
                currentTime={currentTime}
              />
            )
          })
      }
    </ILOCard>
  )
}

export default CurrentView