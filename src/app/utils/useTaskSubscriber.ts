import { LoadingTasks, RootState } from "app/store/types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useTaskSubscriber = (...tasks: string[]) => {
  const loadingTasks = useSelector<RootState, LoadingTasks>(store => store.layout.loadingTasks);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    for (const key of tasks)
      if (loadingTasks[key]) return setLoading(true);
    setLoading(false);
  }, [loadingTasks, tasks]);

  return [loading];
};

export default useTaskSubscriber;
