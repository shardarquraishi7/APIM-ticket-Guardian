# Contribution Guide

PLACEHOLDER - fill in your team's required information

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page will auto-update as you edit the file.

## Testing

### Unit

[Jest](https://jestjs.io/docs) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit testing

```bash
$ npm run test
```

### E2E

[Cypress](https://github.com/cypress-io/cypress) for integration testing

To open the cypress GUI while developing:

```bash
$ npm run cypress open
```

To run e2e tests in headless mode, you'll need to have set up [access to the NPM registry](#access-to-the-npm-registry-for-E2E-testing). Once this has been configured, run the following command:

```bash
$ npm run test:e2e
```

#### GitHub Package registry

You can use a GitHub Personal Access Token (PAT) to access the package registry on GitHub. To generate a GitHub PAT [see docs here](https://github.com/telus/platform-web/blob/main/docs/QUICKSTART.md#generate-a-github-personal-access-token). Once you have set up and securely saved this token, run the following commands:

```bash
npm config set //npm.pkg.github.com/:_authToken=<GITHUB_PAT> @telus:registry=https://npm.pkg.github.com
```
