import BigNumber from "bignumber.js";

// trim values and display decimal according toDecimalPlace.
// if value too small, filter through and find first non-zero value + next few values and display.
const trimInputValue = (inputValue: BigNumber | string, toDecimalPlace = 5) => {
  if (!inputValue) return "";
  const value = new BigNumber(inputValue);
  const valueStr = value.toString().split("");
  const stringLen = valueStr.length;
  const decimalPos = valueStr.indexOf(".");

  // no decimal return full value
  if (!decimalPos) return value.toString();

  const decLen = decimalPos ? stringLen - (decimalPos + 1) : 0;
  if (value.isGreaterThan(1)) {
    if (decLen > toDecimalPlace) return value.toFixed(toDecimalPlace);
    return value.toString();
  } else {
    let decPlace = 0;
    let endCheck = false;
    valueStr.forEach(str => {
      if (!endCheck) {
        if (str === "0") {
          decPlace++;
        } else if (str === ".") {
        } else {
          endCheck = true;
        }
      }
    })

    return value.toFixed(decPlace + toDecimalPlace);
  }
}

export default trimInputValue;