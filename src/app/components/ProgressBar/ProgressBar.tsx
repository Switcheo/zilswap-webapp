import { Box } from "@material-ui/core";
import { extractBoxProps, PartialBoxProps } from "app/utils";
import React from "react";

interface Props extends PartialBoxProps {
  progress: number
}

const ProgressBar: React.FC<Props> = (props: Props) => {
  const { boxProps, restProps } = extractBoxProps(props)
  const { children, className, ...rest } = restProps;

  return <Box {...boxProps} {...rest} position="relative" display="flex" alignItems="stretch" bgcolor="background.default" borderRadius={4}>
    <Box bgcolor="primary.main" padding={2} width={`${props.progress}%`} borderRadius={4} /> 

    <Box position="absolute" top={0} bottom={0} left={0} right={0} display="flex" alignItems="center" justifyContent="center">
      <span>{props.progress}%</span>
    </Box>
  </Box>
}

export default ProgressBar