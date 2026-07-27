# Contributing Guide

Welcome to the project! This guide will help you set up your environment and understand the development workflow.

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Yarn Classic](https://classic.yarnpkg.com/)

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/RashedulHaqueRasel1/Template-Overview-Website.git
    cd Template-Overview-Website
    ```

2.  **Install dependencies:**

    ```bash
    yarn install
    ```

    _This will also automatically install Husky git hooks._

3.  **Run the development server:**
    ```bash
    yarn dev
    ```

## 🧪 Testing and Quality Checks

We use a suite of tools to ensure code quality.

- **Type Check**: `yarn type-check` - Runs TypeScript compiler to check for type errors.
- **Lint**: `yarn lint` - Runs ESLint.
- **Test**: `yarn test` - Runs Jest unit tests.
- **Test Watch**: `yarn test:watch` - Runs Jest in watch mode.

## 📝 Commit Workflow (Important!)

We use **Conventional Commits** to ensure a clean adherence to semantic versioning.

**Do not use `git commit` directly.** Instead, follow this flow:

1.  Stage your changes:

    ```bash
    git add .
    ```

2.  **Run the commit wizard:**
    ```bash
    yarn commit
    ```
    This command will launch an interactive prompt (Commitizen) that guides you through creating a properly formatted commit message.

### Pre-commit Hooks

When you commit, the following checks run automatically via Husky:

1.  **Type Check**: Verifies there are no TypeScript errors.
2.  **Lint-staged**:
    - Runs `eslint --fix` on staged JS/TS/JSX/TSX files.
    - Runs `prettier --write` on staged JS/TS/JSX/TSX/JSON/MD files.
3.  **Commit-msg**: Verifies that your commit message follows the Conventional Commits standard.

If any of these checks fail, the commit will be aborted. Fix the errors and try again.

## 📂 Project Structure

- `.husky/`: Git hooks configuration.
- `src/`: Source code.
- `jest.config.ts`: Jest configuration.
- `.lintstagedrc`: Lint-staged configuration.
