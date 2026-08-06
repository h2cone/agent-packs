# Repository Guidelines

## Project Structure & Module Organization
`skills/` contains reusable agent playbooks. Each skill lives in its own kebab-case directory with a `SKILL.md` entry point. Put detailed supporting guidance in that skill's `references/` directory when needed. Root files such as `README.md` and `LICENSE` define project-level documentation and licensing. There is no dedicated test or shared assets directory.

`pi-extensions/` contains [pi coding agent](https://github.com/earendil-works/pi) extensions. Each lives in its own kebab-case directory with an `index.ts` entry point (default-exporting the `ExtensionAPI` factory), supporting modules alongside, and a `README.md` covering install, usage, and limitations. Extensions have no build step, no `package.json`, and no npm dependencies beyond what pi already provides (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-ai`, `@earendil-works/pi-tui`). Relative imports between modules use explicit `.ts` extensions (loaded via jiti).

## Build, Test, and Development Commands
This repository has no build step or automated test suite. After editing a skill, review its Markdown links and manually exercise any commands or workflows affected by the change, including a representative failure path when practical.

## Coding Style & Naming Conventions
Use kebab-case for skill directories. Keep guidance in `skills/*/SKILL.md` concise, procedural, and directly actionable. Organize longer background material into focused Markdown files under `references/`, and link to it from the skill entry point only where it supports the workflow.

## Testing Guidelines
There is no automated coverage target. Check that every referenced file exists, every example is internally consistent, and instructions remain usable from a clean checkout. If executable tooling is added later, place tests next to the code they cover or under a new `tests/` directory.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commits with optional Conventional Commit prefixes and scopes, such as `feat(skills): add github-topics skill` and `docs: add skill install instructions`. Follow that pattern when it improves clarity. Pull requests should explain user-visible behavior, list manual verification steps, link related issues, and include screenshots only when visual output changes.
