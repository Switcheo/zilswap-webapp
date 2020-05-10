export default (string, start = 5, end = 5) => {
  return `${string.slice(0, start)}...${string.slice(-end)}`;
};
