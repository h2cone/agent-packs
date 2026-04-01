# agent-packs

A collection of AI agent packs.

## Pi Extensions

Extensions live in `pi-extensions/` and are auto-discovered by [Pi](https://github.com/mariozechner/pi-coding-agent).

| Command | Description |
|---------|-------------|
| `/init` | Scaffolds an `AGENTS.md` contributor guide for the current repository |
| `/commit [instructions]` | Stages all changes, generates a commit message via the AI, and commits |
| `/review [options]` | Runs a read-only code review with prioritized findings |

## Skills

Skills live in `skills/` as `SKILL.md` playbooks. Load a skill by pointing your agent at its file; the agent follows the steps inside.

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`github-publish`](skills/github-publish/SKILL.md) | "publish to GitHub", "push to GitHub", "create a GitHub repo" | Analyzes the codebase, generates missing metadata files (README, .gitignore, LICENSE), creates the remote repo via `gh`, and pushes the first commit |
| [`github-release`](skills/github-release/SKILL.md) | "set up releases", "add release workflow", "create release pipeline" | Detects the build system, generates a cross-platform GitHub Actions release workflow, creates a changelog, and updates the README with download links |
| [`github-topics`](skills/github-topics/SKILL.md) | "add topics", "set repo tags", "update GitHub topics" | Analyzes the repo, recommends topics, validates them against GitHub, and applies them via `gh repo edit` |
| [`architecture`](skills/architecture/SKILL.md) | "generate architecture doc", "create ARCHITECTURE.md", "document project architecture" | Explores the codebase and generates an `ARCHITECTURE.md` following the matklad standard — a concise map of modules and their relationships |

## Setup

```bash
npm install
```

## Development

```bash
npm run typecheck
```

## License

MIT
