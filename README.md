# Rewarded Keeper

[![Deploy to Firebase Hosting on merge](https://github.com/hervinhio/rewareded-recorder/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/hervinhio/rewareded-recorder/actions/workflows/firebase-hosting-merge.yml)
[![Node.js CI](https://github.com/hervinhio/rewareded-recorder/actions/workflows/node.js.yml/badge.svg)](https://github.com/hervinhio/rewareded-recorder/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/hervinhio/rewareded-recorder/graph/badge.svg?token=DZWFSD2L0H)](https://codecov.io/gh/hervinhio/rewareded-recorder)

Rewarded Keeper is a Firebase-backed web application used to manage congregation service reports, users, groups, attendance, requests, and administrative operations.

The repository is an Nx monorepo containing:
- A React front-end application.
- A Firebase Functions backend.
- Shared workspace tooling and CI/CD automation.

## Purpose

This project centralizes reporting and congregation administration workflows in one web experience.

Main goals:
- Collect and review service reports.
- Manage publishers, groups, users, and congregation-level settings.
- Support operational workflows such as attendance tracking, requests, cases, and special months.
- Provide a release pipeline with automatic versioning, GitHub releases, Firebase deploy, and Sentry sourcemap uploads.

## Architecture

## Workspace layout

- apps/rewarded-keeper: React application (Nx webpack build)
- libs/functions: Firebase Functions source (TypeScript)
- .github/workflows: CI, release, deployment, and observability workflows
- firebase.json: Hosting, Firestore, emulators, and functions deployment config

## Front-end

- Stack: React 18 + TypeScript + Fluent UI
- Entry: apps/rewarded-keeper/src/main.tsx
- Main app shell: apps/rewarded-keeper/src/app/app.tsx
- Production build output: dist/apps/rewarded-keeper

## Backend (Firebase Functions)

- Source: libs/functions/src
- Build output: libs/functions/lib
- Runtime/deploy metadata under libs/functions/package.json and firebase.json

## Data and platform

- Firebase Hosting serves the SPA from dist/apps/rewarded-keeper
- Firestore rules/indexes are managed via:
  - firestore.rules
  - firestore.indexes.json
- Firebase emulators are configured in firebase.json

## Versioning and releases

- Release workflow computes the next patch version from the latest vX.Y.Z git tag.
- It updates apps/rewarded-keeper/src/app/version.js.
- It creates a git tag and a GitHub Release.

## Prerequisites

- Node.js 20+ (CI validates on 20.x and 22.x)
- Yarn 1.x
- Firebase CLI (for local emulators and manual deploy)

Optional for observability and release automation:
- GitHub Actions secrets for release/deploy/sentry jobs

## Local development

## Install dependencies

```bash
yarn install
```

## Run front-end locally

```bash
yarn start
```

Default start command maps to Nx serve for the default project (rewarded-keeper).

## Build

```bash
yarn build
```

This runs Nx build for the workspace default application.

To build Firebase functions:

```bash
yarn build functions
```

## Tests

Run all default tests:

```bash
yarn test
```

Run project-targeted tests:

```bash
npx nx test rewarded-keeper
npx nx test functions
```

## Lint and formatting

```bash
yarn lint
yarn prettify
```

## Firebase local tooling

Functions shell:

```bash
yarn shell
```

Functions logs:

```bash
yarn logs
```

## Deployment

## Automatic deployment flow (main branch)

On push to main:

1. Node.js CI runs build + tests.
2. Release workflow runs only if CI succeeds:
   - bumps version,
   - updates version.js,
   - pushes tag,
   - creates GitHub Release.
3. After Release succeeds, two workflows run in parallel:
   - Deploy to Firebase Hosting
   - Sentry Sourcemaps upload (using the same release tag)

Workflows:
- .github/workflows/node.js.yml
- .github/workflows/release.yml
- .github/workflows/firebase-hosting-merge.yml
- .github/workflows/sentry-sourcemaps.yml

## Manual deploy

Deploy all configured Firebase targets:

```bash
yarn deploy
```

Or use Firebase CLI directly for selective deploys (for example hosting only or functions only).

## Required GitHub secrets (CI/CD)

Release and deploy workflows rely on repository secrets, including:
- FIREBASE_SERVICE_ACCOUNT_REWARDED_KEEPER
- SENTRY_AUTH_TOKEN
- SENTRY_ORG
- SENTRY_PROJECT
- CODECOV_TOKEN

## Notes

- The app version shown in the UI is sourced from apps/rewarded-keeper/src/app/version.js.
- The release workflow is the source of truth for production version bumps.
- If a workflow changes, keep this README and .github/workflows in sync.
