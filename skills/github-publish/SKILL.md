---
name: github-publish
description: Publishes a local project to a new GitHub repository by generating metadata files, creating the remote repo, and pushing. Triggers on "publish to GitHub", "push to GitHub", "create a GitHub repo", or first-time repository setup.
---

Analyze the project, then create missing metadata files, the GitHub repo, and push.

## Generate metadata files

Create only if absent or empty. Never overwrite existing files unless the user explicitly asks.

- **README.md** — Matched to the actual project.
- **.gitignore** — Appropriate for the detected language/framework.
- **LICENSE** — MIT by default (current year, username from `gh api user -q .login`). Ask if the user wants a different license.

## Create repo and push

Derive repo name from the directory (lowercase, hyphens). Derive description from README.

```bash
gh repo create <repo-name> --public --description "<description>" --source=. --remote=origin --push
```

- Use `--private` if the user requested it.
- Stop and report if the repo name is already taken.

## Edge cases

- Skip `git init` if `.git` already exists.
- Before committing, check `git config user.name` and `git config user.email`. If unset, read from `--global` config and apply locally.
- If `origin` remote already exists, warn the user instead of overwriting.
- Print the repository URL after a successful push.
