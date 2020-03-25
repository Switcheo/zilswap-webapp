import { useReducer } from "react";

const presetFilter = {
  limit: 10,
  offset: 0,
  count: 0,
};

const initialState = {

};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "update":
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          ...action.filter,
        },
      };
    default: return state;
  }
}

export default function useFilter(filterKey, initialFilter = presetFilter) {
  const [filtersLibrary, dispatch] = useReducer(reducer, initialState);

  if (!filtersLibrary[filterKey]) {
    dispatch({
      type: "update",
      key: filterKey,
      filter: { ...initialFilter },
    });
  }

  const updateFilter = (newFilterComponents) => {
    dispatch({
      type: "update",
      key: filterKey,
      filter: { ...newFilterComponents },
    });
  };

  const filter = filtersLibrary[filterKey] || {};
  const listenFilters = Object.keys(filter).filter(key => key !== "count").map(key => filter[key]);

  return [filter, updateFilter, listenFilters];
};