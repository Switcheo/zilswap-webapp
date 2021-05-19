
import { Box } from "@material-ui/core";
import { Notifications, Text } from "app/components";
import TokenILOCard from "app/components/TokenILOCard";
import ILOCard from "app/layouts/ILOCard";
import React from "react";

const PastView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const pastILOs: any[] = [];

  return (
    <ILOCard {...rest}>
      <Notifications />
      
      {pastILOs.map(ilo => (
        <TokenILOCard 
          expanded={false}
          canExpand={true} />   
      ))}

      {pastILOs.length === 0 &&
        <Box paddingY={6}>
          <Text color="textSecondary" align="center">There are currently no past ILOs.</Text>
        </Box>
      }
    </ILOCard>
  )
}

export default PastView