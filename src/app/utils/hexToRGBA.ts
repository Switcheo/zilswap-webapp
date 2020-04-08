import hexToRGB from "./hexToRGB";

export default (hex: string, alpha: number): string => {
  const rgb = hexToRGB(hex);
  return `(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
};
