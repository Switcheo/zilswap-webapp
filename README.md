# Zilswap Webapp

This repository contains the UI code for the Zilswap dApp.

The webapp is hosted on canonical url: [https://zilswap.io](https://zilswap.io). IFPS hosting is coming soon.

## Development

The Zilswap webapp is built using React. Simply install Node.js and node package dependencies to begin.

```bash
yarn install
yarn start
```

The webapp will be running on [http://localhost:3000](http://localhost:3000) by default

## Deployment

Pushing code to staging / master deploys to [staging](https://staging.zilswap.io) and [prod](https://zilswap.io) respectively.

Please ensure to check that your code passes the linter with **no warnings** by running `yarn lint` before deploying. You will need to have eslint installed: `npm i -g eslint`.

## Contributing

View our [contribution guidelines](./CONTRIBUTING.md) before making a pull request.
