import actions from "app/store/actions";
import {
  strings
} from "app/utils";
import {
  useDispatch
} from "react-redux";

export default () => {
  const dispatch = useDispatch();
  return async (runnable, taskName = strings.uuidv4()) => {
    if (typeof runnable !== "function") return;
    const taskUuid = strings.uuidv4();
    dispatch(actions.Layout.addBackgroundLoading(taskName, taskUuid));
    try {
      return await runnable();
    } finally {
      dispatch(actions.Layout.removeBackgroundLoading(taskUuid));
    }
  }
};