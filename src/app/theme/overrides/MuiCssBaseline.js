import RobotoTtf from "../fonts/Roboto-Regular.ttf";
import RobotoMediumTtf from "../fonts/Roboto-Medium.ttf";
import RobotoBoldTtf from "../fonts/Roboto-Bold.ttf";

const RobotoFont = {
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    local('Roboto-Regular'),
    url(${RobotoTtf}) format('ttf')
  `,
};
const RobotoMedium = {
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 500,
  src: `
    local('Roboto-Medium'),
    url(${RobotoMediumTtf}) format('ttf')
  `,
};
const RobotoBold = {
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 700,
  src: `
    local('Roboto-Bold'),
    url(${RobotoBoldTtf}) format('ttf')
  `,
};

export default () => ({
  "@global": {
    "@font-face": [RobotoFont, RobotoMedium, RobotoBold],
  }
});