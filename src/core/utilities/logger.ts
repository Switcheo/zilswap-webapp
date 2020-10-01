export const logger = function(...args: any) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    console.log.apply(console, args);
  }
};
