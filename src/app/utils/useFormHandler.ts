import { useState, Dispatch, SetStateAction } from "react";

export type FormState = {
  values: { [index: string]: any };
  errors: { [index: string]: any };
  touched: { [index: string]: boolean };
}

export interface FormError {
  message?: string;
  errors?: {
    [index: string]: {
      msg: string;
    };
  };
}

export type ChangeHandler = (name: string, converter?: ((input: any) => {}) | null, sideEffect?: (input: any, key: string) => any) => any;

const defaultFormState = {
  values: {},
  errors: {},
  touched: {},
}

const useFormHandler = function (initialFormState: FormState = defaultFormState, errorPrinter: Function): [FormState, Dispatch<SetStateAction<FormState>>, (error: FormError) => void, ChangeHandler] {
  const [formState, setFormState] = useState(initialFormState);

  const _errorPrinter = errorPrinter || console.error;
  const errorHandler = (error?: FormError) => {
    if (error) {
      const { errors, message } = error;

      if (message) _errorPrinter(message);
      if (!errors) return;

      const newFormState: FormState = {
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

  const changeHandler = (name: string, converter?: ((input: any) => {}) | null, sideEffect?: (input: any, key: string) => any) => {
    return (input: {
      target: {
        value: any;
      }
    }) => {
      if (typeof input === "object")
        input = input.target.value;
      const newValue = typeof converter === "function" ? converter(input) : input;
      let newFormState = {
        ...formState,
        values: {
          ...formState.values,
          [name]: newValue,
        },
        touched: {
          ...formState.touched,
          [name]: true
        }
      }
      if (typeof sideEffect === "function") newFormState = sideEffect(newFormState, name);
      setFormState(newFormState);
    };
  };

  return [formState, setFormState, errorHandler, changeHandler]
};
export default useFormHandler;
