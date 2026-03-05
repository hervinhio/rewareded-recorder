# functions

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test functions` to execute the unit tests via [Jest](https://jestjs.io).

## Environment configuration

This project uses environment variables (dotenv) for configuration, in line with the
[Firebase Functions config migration](https://firebase.google.com/docs/functions/config-env#migrate-to-dotenv).

The deprecated `functions.config()` API is **not** used in this codebase.

### Local development

Copy `.env.example` to `.env` and fill in any required values:

```bash
cp .env.example .env
```

Non-secret values should be added to `.env` files.
Sensitive values (API keys, passwords) should be stored in [Firebase Secret Manager](https://firebase.google.com/docs/functions/config-env#secret-manager).

The `.env` file is excluded from version control (see `.gitignore`).

