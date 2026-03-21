# Repository Guidelines

## Project Structure & Module Organization
`pi-extensions/` contains the TypeScript command extensions that Pi auto-discovers. Keep one command per file, with a default export such as `initExtension` or `reviewExtension`. `skills/` contains reusable agent playbooks; each skill lives in its own kebab-case directory with a `SKILL.md` entry point. Root files like `package.json`, `tsconfig.json`, and `README.md` define tooling and project-level docs. There is no dedicated `test/` or `assets/` directory yet.

## Build, Test, and Development Commands
Run `npm install` to install TypeScript and Pi dependencies. Use `npm run typecheck` for the only enforced validation step; it runs `tsc --noEmit` against `pi-extensions/**/*.ts` in strict mode. `npm test` is currently a placeholder that exits with an error, so do not treat it as a real test suite. When changing an extension, manually exercise the affected command and at least one failure path, for example running `/commit` outside a Git repo.

## Coding Style & Naming Conventions
Match the existing TypeScript style in `pi-extensions/`: tabs for indentation, double quotes, trailing commas, and small helper functions for parsing or formatting logic. Keep command files focused and avoid cross-file coupling unless a shared helper is clearly warranted. Use descriptive camelCase for variables and functions, PascalCase for interfaces and types, and kebab-case for skill directories. Markdown guidance in `skills/*/SKILL.md` should stay concise, procedural, and directly actionable.

## Testing Guidelines
There is no automated coverage target yet. Treat `npm run typecheck` as mandatory for every change to `pi-extensions/`, then verify behavior manually in Pi. If you add automated tests later, place them next to the module they cover or under a new `tests/` directory and name them after the target command, for example `commit.test.ts`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commits with optional Conventional Commit prefixes and scopes, such as `feat(skills): add github-topics skill` and `fix(review): handle missing pi-tui`. Follow that pattern when it improves clarity. Pull requests should explain user-visible behavior, list manual verification steps, link related issues, and include screenshots only when UI output changes.
