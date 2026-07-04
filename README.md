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

Skills live in `skills/` as `SKILL.md` playbooks. See [Install](#install) to add them to your agent — it then follows the steps inside.

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`git-commit`](skills/git-commit/SKILL.md) | "commit", "generate commit message", "git commit" | Stages all changes, reads the diff, and commits with an AI-generated multi-line message |
| [`github-publish`](skills/github-publish/SKILL.md) | "publish to GitHub", "push to GitHub", "create a GitHub repo" | Analyzes the codebase, generates missing metadata files (README, .gitignore, LICENSE), creates the remote repo via `gh`, and pushes the first commit |
| [`github-release`](skills/github-release/SKILL.md) | "set up releases", "add release workflow", "create release pipeline" | Detects the build system, generates a cross-platform GitHub Actions release workflow, creates a changelog, and updates the README with download links |
| [`github-topics`](skills/github-topics/SKILL.md) | "add topics", "set repo tags", "update GitHub topics" | Analyzes the repo, recommends topics, validates them against GitHub, and applies them via `gh repo edit` |
| [`architecture`](skills/architecture/SKILL.md) | "generate architecture doc", "create ARCHITECTURE.md", "document project architecture" | Explores the codebase and generates an `ARCHITECTURE.md` following the matklad standard — a concise map of modules and their relationships |
| [`design-pattern`](skills/design-pattern/SKILL.md) | "what design pattern should I use", "refactor with patterns", "analyze code for design patterns" | Diagnoses the codebase for problems the 19 *Game Programming Patterns* can solve, explains why each fits, and proposes a concrete application plan |

## Install

Copy a skill folder into `~/.agents/skills/` (Claude Code: `~/.claude/skills/`). Re-run to update.

**macOS / Linux**

```bash
git clone --depth 1 https://github.com/h2cone/agent-packs /tmp/ap
cp -r /tmp/ap/skills/* ~/.agents/skills/        # all skills
cp -r /tmp/ap/skills/git-commit ~/.agents/skills/  # one skill
```

**Windows (PowerShell)**

```powershell
git clone --depth 1 https://github.com/h2cone/agent-packs $env:TEMP\ap
Copy-Item $env:TEMP\ap\skills\* $HOME\.agents\skills\ -Recurse -Force        # all
Copy-Item $env:TEMP\ap\skills\git-commit $HOME\.agents\skills\ -Recurse -Force  # one
```

Then trigger a skill by a phrase in the Trigger column above. The `github-*` skills also need `gh` authenticated.

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
