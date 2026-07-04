---
name: github-publish
description: Publishes a local project to GitHub by generating metadata files, reusing an existing target repository when present, creating the repo when absent, and pushing. Triggers on "publish to GitHub", "push to GitHub", "create a GitHub repo", "push to existing repo", or first-time repository setup.
---

Analyze the project, then create missing metadata files, create or reuse the GitHub repo, and push.

## Generate metadata files

Create only if absent or empty. Never overwrite existing files unless the user explicitly asks.

- **README.md** — Matched to the actual project.
- **.gitignore** — Appropriate for the detected language/framework.
- **LICENSE** — MIT by default (current year, username from `gh api user -q .login`). Ask if the user wants a different license.

## Resolve target repo

Prefer an explicit user-provided repo or GitHub URL. Otherwise derive the repo name from the directory (lowercase, hyphens) and the owner from `gh api user -q .login`. Derive description from README.

If `origin` already exists:

- Use it when it points at the same GitHub repo target.
- Warn and stop if it points somewhere else, unless the user explicitly asks to switch remotes.

## Reuse or create repo

Check whether the target repo already exists before trying to create it:

```bash
gh repo view <owner>/<repo-name> --json url,sshUrl,nameWithOwner,defaultBranchRef
```

If the repo exists:

- Do not run `gh repo create`.
- Treat it as the publish target.
- Add `origin` if missing, using the returned `sshUrl` when available:

```bash
git remote add origin <ssh-url>
```

If the repo does not exist:

```bash
gh repo create <owner>/<repo-name> --public --description "<description>" --source=. --remote=origin
```

- Use `--private` if the user requested it.
- If creation reports that the repo already exists, re-run `gh repo view <owner>/<repo-name>` and reuse it when visible. Stop only when the repo is inaccessible or clearly belongs to a different target.

Push the current branch:

```bash
git push -u origin HEAD
```

If the push is rejected because the remote has unrelated history or protected branches, stop and report the exact reason. Never force-push unless the user explicitly asks.

## Edge cases

- Skip `git init` if `.git` already exists.
- Before committing, check `git config user.name` and `git config user.email`. If unset, read from `--global` config and apply locally.
- If `origin` remote already exists, warn the user instead of overwriting.
- Print the repository URL after a successful push.
