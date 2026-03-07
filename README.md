# agent-packs

A collection of AI agent packs.

## Pi Extensions

Extensions live in `pi-extensions/` and are auto-discovered by [Pi](https://github.com/mariozechner/pi-coding-agent).

| Command | Description |
|---------|-------------|
| `/init` | Scaffolds an `AGENTS.md` contributor guide for the current repository |
| `/commit [instructions]` | Stages all changes, generates a commit message via the AI, and commits |
| `/review [options]` | Runs a read-only code review with prioritized findings |

### `/commit` options

```
/commit                    # stage all changes, generate message, commit
/commit <instructions>     # pass extra instructions for the commit message
```

### `/review` options

```
/review                      # interactive menu (or defaults to uncommitted changes)
/review <instructions>       # custom review prompt
/review --base <branch>      # review changes against a base branch (PR style)
/review --commit <sha>       # review a specific commit
/review --uncommitted        # review current staged/unstaged/untracked changes
```

## Skills

Skills live in `skills/` as `SKILL.md` playbooks. Load a skill by pointing your agent at its file; the agent follows the steps inside.

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`github-publish`](skills/github-publish/SKILL.md) | "publish to GitHub", "push to GitHub", "create a GitHub repo" | Analyzes the codebase, generates missing metadata files (README, .gitignore, LICENSE), creates the remote repo via `gh`, and pushes the first commit |

## Setup

```bash
npm install
```

## Development

```bash
npm run typecheck   # strict TypeScript check (no emit)
```

Before submitting changes, run `typecheck` and manually exercise the affected command, including at least one failure path (e.g., running `/commit` outside a git repo).

## Project Structure

```
pi-extensions/
  init.ts            # /init command
  commit.ts          # /commit command
  review.ts          # /review command
skills/
  github-publish/
    SKILL.md         # publish a local project to a new GitHub repository
```

## License

MIT
