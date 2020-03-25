import { useState } from "react";

const defaultFormState = {
  values: {},
  errors: {},
  touched: {},
}

export default function (initialFormState = defaultFormState, errorPrinter) {
  const [formState, setFormState] = useState(initialFormState);

  const _errorPrinter = errorPrinter || console.error;

  const errorHandler = (error) => {
    if (!error || !error.axios) {
      if (error && error.message)
        error = error.message;
      _errorPrinter(error);
      return;
    }

    if (error.axios) {
      const { errors, message } = error;

      _errorPrinter(message);
      if (!errors) return;

      const newFormState = {
        ...formState,
        errors: {},
      };
      // eslint-disable-next-line
      for (const field of Object.keys(formState.values)) {
        if (errors[field] && errors[field].msg) {
          newFormState.errors[field] = errors[field].msg;
          newFormState.touched[field] = true;
        }
      }
      setFormState(newFormState);
    }
  };

  const changeHandler = (name, converter) => {
    return input => {
      if (typeof input === "object")
        input = input.target.value;
      const newValue = typeof converter === "function" ? converter(input) : input;
      setFormState({
        ...formState,
        values: {
          ...formState.values,
          [name]: newValue,
        },
        touched: {
          ...formState.touched,
          [name]: true
        }
      });
    };
  };

  return [formState, setFormState, errorHandler, changeHandler]
};