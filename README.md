# agent-packs

A collection of reusable AI agent skills.

## Skills

Skills live in `skills/` as `SKILL.md` playbooks. See [Install](#install) to add them to your agent — it then follows the steps inside.

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`git-commit`](skills/git-commit/SKILL.md) | "commit", "generate commit message", "git commit" | Pulls from the tracked upstream, stages all changes, reads the diff, and commits with an AI-generated multi-line message |
| [`github-publish`](skills/github-publish/SKILL.md) | "publish to GitHub", "push to GitHub", "create a GitHub repo" | Analyzes the codebase, generates missing metadata files (README, .gitignore, LICENSE), creates the remote repo via `gh`, and pushes the first commit |
| [`github-release`](skills/github-release/SKILL.md) | "set up releases", "add release workflow", "create release pipeline" | Detects the build system, generates a cross-platform GitHub Actions release workflow, creates a changelog, and updates the README with download links |
| [`github-topics`](skills/github-topics/SKILL.md) | "add topics", "set repo tags", "update GitHub topics" | Analyzes the repo, recommends topics, validates them against GitHub, and applies them via `gh repo edit` |
| [`architecture`](skills/architecture/SKILL.md) | "generate architecture doc", "create ARCHITECTURE.md", "document project architecture" | Explores the codebase and generates an `ARCHITECTURE.md` following the matklad standard — a concise map of modules and their relationships |
| [`nystrom-game-programming-patterns`](skills/nystrom-game-programming-patterns/SKILL.md) | "map these code smells to design patterns", "which Game Programming Pattern fits", "game loop fixed timestep", "component vs inheritance", frame loops / entity structure / spawning / spatial queries | Diagnoses a game/realtime codebase through Nystrom's 19 *Game Programming Patterns* (smell → why → plan), with architecture judgment and cheatsheet trade-offs folded into `references/` |
| [`silber-pixel-art`](skills/silber-pixel-art/SKILL.md) | "pixel art for my game", "create pixel art sprites", "build a tile set", "review my pixel art" | Applies the craft from *Pixel Art for Game Developers* (Silber, 2016) to a 2D game — resolution/palette/tile planning, sprites, light and perspective, tiled backgrounds, animation, and defect review |

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

## Pi Extensions

`pi-extensions/` holds extensions for the [pi coding agent](https://github.com/earendil-works/pi). Each is a kebab-case directory with an `index.ts` entry point, no build step, and no npm dependencies.

| Extension | Command | Description |
|-----------|---------|-------------|
| [`deep-research`](pi-extensions/deep-research/README.md) | `/deep-research <query>` | Bounded four-stage research (plan → claims → verify → cited report) with fail-closed `Verified`/`Partial` status, writing a `report.md` to `.pi/deep-research/` |

Install an extension by symlinking it into `~/.pi/agent/extensions/` (or adding the path to `settings.json` `extensions`), then `/reload`. See the extension's README for details.

## License

MIT
