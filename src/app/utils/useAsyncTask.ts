import useStatefulTask from "./useStatefulTask";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "app/store/types";
import { LoadingTasks } from "app/store/layout/types";

export type ErrorHandler = (error: any) => (() => void);
export type AsyncTaskOutput<T> = [(task: () => Promise<T>) => Promise<void>, boolean, Error | null, () => void];

const parseError = (original: Error): Error => {
  let error = original;
  return error;
};

const useAsyncTask = <T>(taskname: string): AsyncTaskOutput<T> => {
  const [error, setError] = useState<Error | null>(null);
  const loadingTasks = useSelector<RootState, LoadingTasks>(store => store.layout.loadingTasks);

  const cleanup = () => {
    setError(null);
  };

  const statefulTask = useStatefulTask<T>();
  const asyncTaskRunner = async (task: () => Promise<T>): Promise<void> => {
    if (typeof cleanup === "function") cleanup();

    try {
      await statefulTask(task, taskname);
    } catch (rawError) {
      console.error("async task error", rawError);
      const error = parseError(rawError);
      setError(error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const loadingState = !!loadingTasks[taskname];
  return [asyncTaskRunner, loadingState, error, clearError];
};

export default useAsyncTask;
