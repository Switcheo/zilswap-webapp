const hexToRGB = (hex: string): number[] => {
  let array = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
    , (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
  if (array) return array.map(x => parseInt(x, 16))
  return [0, 0, 0];
};

export default hexToRGB;
