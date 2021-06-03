import { useSnackbar } from "notistack";

const useToaster = (persist = true) => {
  const { enqueueSnackbar } = useSnackbar();

  return (content: string, { overridePersist = persist, hash = "" } = {}) => {
    if (!content) return;
    const message = JSON.stringify({
      content, hash
    })
    enqueueSnackbar(message, { persist: overridePersist });
  }
}

export default useToaster