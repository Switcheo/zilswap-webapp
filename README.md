# ZilSwap Webapp

This repository contains the UI code for the ZilSwap dApp.

The hosted webapp was retired on 1 October 2026 and now returns HTTP 404.

> **Retirement status (2026-10-01):** this repository is retained for incident
> reference and local builds. Third-party
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

## CI

CI builds the app for source verification and incident reference. Hosted deployments are disabled.

## Contributing

View our [contribution guidelines](./CONTRIBUTING.md) before making a pull request.
