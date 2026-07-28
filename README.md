# ZilSwap Webapp

This repository contains the UI code for the ZilSwap dApp.

The webapp is hosted on canonical url: [https://zilswap.io](https://zilswap.io).

> **Maintenance status (2026):** this app is no longer actively maintained and is
> served as-is, primarily so users can withdraw liquidity and funds. Third-party
> wallet SDKs for sunset services (WalletConnect v1, Portis, Authereum, Fortmatic,
> Torus, Zeeves) have been removed, and `public/index.html` ships a strict
> Content-Security-Policy — add any new API endpoint to the `connect-src`
> allowlist there or requests to it will be blocked.

## Development

The ZilSwap webapp is built using React. Simply install Node.js and node package dependencies to begin.

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
