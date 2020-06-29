import AvenirNextDemiBoldWoff from "../fonts/AvenirNext-DemiBold.woff";


const AvenirNext = {
  fontFamily: 'Avenir Next',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 600,
  src: `
    url(${AvenirNextDemiBoldWoff}) format('woff')
  `,
};

export default () => ({
  "@global": {
    "@font-face": [AvenirNext],
  }
});