import { useSnackbar, WithSnackbarProps } from 'notistack'
import React from 'react'

interface IProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void
}

const InnerSnackbarUtilsConfigurator: React.FC<IProps> = (props: IProps) => {
  props.setUseSnackbarRef(useSnackbar())
  return null
}

let useSnackbarRef: WithSnackbarProps
const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps) => {
  useSnackbarRef = useSnackbarRefProp
}

export const SnackbarUtilsConfigurator = () => {
  return (
    <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />
  )
}
export const detachedToast = (content: string, { overridePersist = true, hash = "" }) => {
  if (!content) return;
  const message = JSON.stringify({
    content, hash
  })
  useSnackbarRef.enqueueSnackbar(message, { persist: overridePersist })
}

export const useToaster = (persist = true) => {
  const { enqueueSnackbar } = useSnackbar();

  return (content: string, { overridePersist = persist, hash = "", sourceBlockchain = "" } = {}) => {
    if (!content) return;
    const message = JSON.stringify({
      content, hash, sourceBlockchain
    })
    enqueueSnackbar(message, { persist: overridePersist });
  }
}
