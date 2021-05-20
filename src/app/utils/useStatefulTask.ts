import actions from "app/store/actions";
import { strings } from "app/utils";
import { useDispatch } from "react-redux";

const useStatefulTask = <T>() => {
  const dispatch = useDispatch();
  return async (runnable: () => Promise<T>, taskName = strings.uuidv4()): Promise<T> => {
    if (typeof runnable !== "function") 
      throw new Error("stateful task runnable not a function");
    const taskUuid = strings.uuidv4();
    dispatch(actions.Layout.addBackgroundLoading(taskName, taskUuid));
    try {
      return await runnable();
    } finally {
      dispatch(actions.Layout.removeBackgroundLoading(taskUuid));
    }
  }
};

export default useStatefulTask;
