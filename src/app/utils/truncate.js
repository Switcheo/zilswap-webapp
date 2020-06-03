export default (string, start = 5, end = 5) => {
  return typeof string === "string" ? `${string.slice(0, start)}...${string.slice(-end)}`: undefined;
};
