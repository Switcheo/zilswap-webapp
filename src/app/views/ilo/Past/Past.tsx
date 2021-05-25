import { Notifications } from "app/components";
// import TokenILOCard from "app/components/TokenILOCard";
import ILOCard from "app/layouts/ILOCard";
import React from "react";

const PastView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;

  return (
    <ILOCard {...rest}>
      <Notifications />
    </ILOCard>
  )
}

export default PastView