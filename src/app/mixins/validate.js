import validate from 'validate.js';

const regex = (value, options) => {
  const regExp = new RegExp(options.pattern);

  if (!regExp.test(value)) {
    return options.message;
  }
};

const checked = (value, options) => {
  if (value !== true) {
    return options.message || 'must be checked';
  }
};

validate.validators = {
  ...validate.validators,
  regex,
  checked
};
