import AvenirNextDemiBoldWoff from "../fonts/AvenirNext-DemiBold.woff";
import AvenirNextBoldWoff from "../fonts/AvenirNext-DemiBold.woff";


const AvenirNextDemiBold = {
  fontFamily: '"Avenir Next"',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 600,
  src: `
    url(${AvenirNextDemiBoldWoff}) format('woff')
  `,
};

const AvenirNextBold = {
  fontFamily: '"Avenir Next"',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 'bold', // 700
  src: `
    url(${ AvenirNextBoldWoff}) format('woff')
  `,
};

const MuiCssBaseline = () => ({
  "@global": {
    "@font-face": [AvenirNextDemiBold, AvenirNextBold],
  }
});

export default MuiCssBaseline;
