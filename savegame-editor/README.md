# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Linting and formatting

Install [Bun](https://bun.sh/) and the Rust `clippy` and `rustfmt` components, then run `bun install` in this directory.

- `bun run lint` checks the frontend with TypeScript and ESLint and the Rust backend with Clippy.
- `bun run format` formats frontend source and Rust code.
- `bun run format:check` checks formatting without changing files.

The same commands are available as `just lint`, `just format`, and `just format-check`. The `lint:frontend`, `lint:rust`, `format:frontend`, and `format:rust` scripts can be run separately.

ESLint checks TypeScript and TSX in `src` and `tests`, and `vite.config.ts`. TypeScript checks types and unused variables in the configured project. Prettier formats those files and the CSS in `src`.
