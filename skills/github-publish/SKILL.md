---
name: github-publish
description: This skill should be used when the user wants to publish a project to GitHub, "push to GitHub", "create a GitHub repo", "upload to GitHub", "initialize git and push", or any task involving initializing a local project as a GitHub repository for the first time.
version: 1.0.0
---

# GitHub Publish

Publish the current local project to a new GitHub repository: analyze the codebase, generate metadata files, create the remote repo, and push.

## Step 1 — Analyze the Codebase

Read the project to understand its primary language/framework, purpose, and existing files (README, .gitignore, LICENSE). Use `Glob` and `Read` to explore. Do **not** overwrite files that already exist unless the user explicitly asks.

## Step 2 — Generate Repository Metadata Files

Create the following files only if absent or empty:

**README.md** — matched to the actual project, covering: project name, one-sentence description, features, getting started instructions, and license reference.

**.gitignore** — appropriate for the detected language/framework, including build artifacts, dependency directories, editor/IDE folders, OS files, and local env files.

**LICENSE** — MIT by default (use current year and GitHub username from `gh api user -q .login`), unless the user specifies otherwise.

## Step 3 — Create the GitHub Repository

Derive the repo name from the project directory (lowercase, hyphens). Derive the description from the README summary.

```bash
gh repo create <repo-name> --public --description "<description>" --source=. --remote=origin
```

Use `--private` if the user requested it. Stop and report if the repo name is already taken.

## Step 4 — Initialize Git and Push

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:<username>/<repo-name>.git
git push -u origin main
```

- Before committing, check `git config user.name` and `git config user.email`. If either is unset, read them from the user's global git config (`git config --global user.name` / `git config --global user.email`) and apply them locally before running `git commit`.
- Skip `git init` if `.git` already exists.
- Skip `git remote add origin` and warn the user if `origin` is already set.
- Print the repository URL after a successful push.
