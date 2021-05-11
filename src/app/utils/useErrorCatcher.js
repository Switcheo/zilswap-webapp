import useStatefulTask from "./useStatefulTask";

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

const useErrorCatcher = function (error_catcher) {
  let cleanup = () => {
    if (error_catcher) error_catcher(null);
  };
  const _error_catcher = error_catcher || console.error;
  const statefulTask = useStatefulTask();
  return (async_func, taskname) => {
    if (typeof cleanup === "function") cleanup();

    return Promise.resolve(statefulTask(async_func, taskname))
      .catch(error => {
        console.error(error);
        cleanup = _error_catcher(parse_error(error)) || cleanup;
      });
  };
};

export default useErrorCatcher;
