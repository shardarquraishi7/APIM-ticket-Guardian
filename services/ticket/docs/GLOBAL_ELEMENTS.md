# Global Elements

For detailed instructions on Global Elements usage within a WASK project, see the [`next-global-elements` docs](https://github.com/telus/platform-web/blob/main/packages/next-global-elements/README.md).

## E2E Testing

By default, in non-deployed environments (locally and in the pull request validation GitHub workflow), E2E tests will use static mocked Global Elements data as opposed to hitting the Global Elements API. If you wish to make an API call to receive actual Global Elements data in non-deployed environments, you can set `GE_USE_MOCK_DATA=false` in the relevant env file (`.env.test` by default). For more information on secrets in E2E test, see additional documentation [here](https://github.com/telus/platform-web/blob/main/docs/FAQ.md#secrets-in-app-e2e-tests).
