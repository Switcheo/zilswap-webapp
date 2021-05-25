import { Notifications } from "app/components";
import TokenILOCard from "app/components/TokenILOCard";
import ILOCard from "app/layouts/ILOCard";
import { RootState, WalletState } from "app/store/types";
import { useNetwork } from "app/utils";
import { ZILO_DATA } from "core/zilo/constants";
import React, { useEffect } from "react";
import { useSelector } from 'react-redux'

const CurrentView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;

  const network = useNetwork();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  useEffect(() => {
    // need to listen to wallet state
    // to trigger react component reload
    // when network changes.
  }, [walletState]);

  return (
    <ILOCard {...rest}>
      <Notifications />
      {
        ZILO_DATA[network!].map(data => {
        return (
          <TokenILOCard
            expanded={true}
            data={data}
          />
          )
        })
      }
    </ILOCard>
  )
}

export default CurrentView