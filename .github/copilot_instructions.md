# GitHub Copilot Instructions for hervinhio/rewarded-keeper

## Project Overview

This repository contains code for the "Rewarded Keeper" project, which is on managing publishers and their activity report. The codebase includes components written in TypeScript, JavaScript, and uses frameworks/libraries such as React and Firebase. nx for project management.

## Coding Style

- Follow ESLint for code formatting.
- Use descriptive variable and function names.
- Write concise and clear comments where necessary.
- Organize code into logical modules and folders.

## Best Practices

- Prefer composition over inheritance.
- Avoid global variables; use dependency injection where possible.
- Write unit tests for new features and bug fixes.
- Handle errors gracefully and log exceptions.

## Directory Structure

- `/apps/rewarded-keeper` - Source code for the web application. It is a react application. Test files are located alongside the source files.
- `/apps/rewarded-keeper-e2e` - Source code for the end to end testing.
- `/libs/functions` - Source code for the Firebase functions.
- `/docs` - Documentation for the project, including API specifications and user guides.

## Commit Messages

- Use conventional commit messages (e.g., `feat: add new feature`, `fix: resolve bug`).
- Reference related issues in commit messages when applicable.

## Pull Requests

- Ensure all tests pass before submitting a PR.
- Include a clear description of changes.
- Request reviews from relevant team members.

## Copilot Usage

- Use Copilot to generate boilerplate code, helper functions, and documentation.
- Review and refactor Copilot suggestions to match project standards.
- Do not commit Copilot-generated code without manual review.

## Additional Notes

- Sensitive information (API keys, passwords) must not be committed.
- Follow the repository's code of conduct and contributing guidelines.
