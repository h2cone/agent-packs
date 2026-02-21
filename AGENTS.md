# Repository Guidelines

## Project Structure & Module Organization
- `pi-extensions/`: TypeScript extensions loaded by Pi. Each file maps to command behavior:
  - `init.ts` (`/init`) scaffolds `AGENTS.md`
  - `commit.ts` (`/commit`) stages changes and generates commit messages
  - `review.ts` (`/review`) performs read-only code reviews
- `skills/`: reserved for skill packs/prompts (currently a placeholder via `.gitkeep`).
- Root config files: `package.json`, `tsconfig.json`, and `package-lock.json`.
- Generated/local-only content: `node_modules/`, `.DS_Store` (ignored in `.gitignore`).

## Build, Test, and Development Commands
- `npm install` — install project dependencies.
- `npm run typecheck` — run strict TypeScript checks (`tsc --noEmit`) for `pi-extensions/**/*.ts`.
- `npm test` — currently a placeholder script that exits with an error; do not use as a quality gate yet.
- Before opening a PR, run `npm run typecheck` and manually exercise affected Pi commands (for example: `/init --help`, `/commit --help`, `/review --help`).

## Coding Style & Naming Conventions
- Language: TypeScript with `strict: true`.
- Indentation: tabs (match the existing files in `pi-extensions/`).
- Use clear command-state types (interfaces/unions) and keep handlers focused.
- File naming: lowercase, command-focused names in `pi-extensions/` (e.g., `review.ts`).
- Naming conventions: constants in `UPPER_SNAKE_CASE`, functions/variables in `camelCase`.
- Keep user-facing UI notifications concise and actionable.

## Testing Guidelines
- No formal test framework is configured yet.
- Minimum validation for each change:
  1. Run `npm run typecheck`
  2. Manually test the changed command path in Pi
  3. Verify at least one failure path (invalid args, non-git directory, empty diff, etc.)
- If you add tests, prefer colocated files like `pi-extensions/<feature>.test.ts` and update `npm test` accordingly.

## Commit & Pull Request Guidelines
- The repository currently has no commit history, so no enforced commit convention exists yet.
- Use concise, imperative commit subjects (Conventional Commits are recommended but optional), e.g., `feat(review): improve fallback output parsing`.
- PRs should include: objective, key changes, manual verification steps, and screenshots/log snippets when UI behavior changes.
