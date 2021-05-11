import hexToRGB from "./hexToRGB";

const hexToRGBA = (hex: string, alpha: number): string => {
  const rgb = hexToRGB(hex);
  return `(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
};
export default hexToRGBA;
