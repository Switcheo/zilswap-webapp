
import { Notifications } from "app/components";
import TokenILOCard from "app/components/TokenILOCard";
import ILOCard from "app/layouts/ILOCard";
import { RootState, TokenState } from "app/store/types";
import React from "react";
import { useSelector } from "react-redux";

const PastView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const tokenState = useSelector<RootState, TokenState>(state => state.token);

  return (
    <ILOCard {...rest}>
      <Notifications />
      
      <TokenILOCard tokenState={tokenState} />
    </ILOCard>
  )
}

export default PastView