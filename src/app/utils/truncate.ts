const truncate = (str?: string, start = 5, end = 5) => {
  return typeof str === "string" ? `${str.slice(0, start)}...${str.slice(-end)}`: '';
};

export default truncate;
