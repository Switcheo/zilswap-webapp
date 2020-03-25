const parse_error = (original) => {
  let error = original;
  if (original.isAxiosError) {
    if (original.response) {
      if (original.response.data && original.response.data.error)
        error = original.response.data.error;
      error.axios = {
        request: original.request,
        response: original.response,
        config: original.config,
      }
    }
  }
  return error;
};

export default function (error_catcher) {
  let cleanup = () => {
    if (error_catcher) error_catcher(null);
  };
  const _error_catcher = error_catcher || console.error;

  return (async_func) => {
    if (typeof cleanup === "function") cleanup();

    return Promise.resolve(async_func())
      .catch(error => {
        console.error(error);
        cleanup = _error_catcher(parse_error(error)) || cleanup;
      });
  };
};