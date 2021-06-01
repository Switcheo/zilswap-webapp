const IS_DEV_ENV = !process.env.NODE_ENV || process.env.NODE_ENV === "development"
const DEBUG_ON = process.env.DEBUG_LOG === "true"
const DEBUG_OFF = process.env.DEBUG_LOG === "false"

export const isDebug = () => 
  (IS_DEV_ENV && !DEBUG_OFF)
  ||
  DEBUG_ON
  ||
  (typeof window !== 'undefined' ? (window as any).debugZilswap === true : false);

export const logger = function (...args: any) {
  if (isDebug()) {
    console.log.apply(console, args);
  }
};
