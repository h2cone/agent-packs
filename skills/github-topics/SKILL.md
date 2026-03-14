---
name: github-topics
description: This skill should be used when the user wants to generate, recommend, or update GitHub repository topics, "add topics", "set repo tags", "update GitHub topics", or any task involving managing repository topics on GitHub.
version: 1.0.0
---

# GitHub Topics

Analyze the current repository, recommend relevant topics, validate them against existing GitHub topics, and apply them to the repository.

## Step 1 — Analyze the Repository

Use `Glob` and `Read` to explore the project structure, key files (README, package.json, Cargo.toml, go.mod, pyproject.toml, etc.), and source code. Identify:

- Primary language(s) and framework(s)
- Project purpose and domain (e.g., CLI tool, web app, library, API)
- Key technologies, libraries, and paradigms used
- Target audience and ecosystem (e.g., developer-tools, machine-learning)

## Step 2 — Recommend Topics

Based on the analysis, compile a list of **10–20 candidate topics**. Topics must follow GitHub's naming rules: lowercase, hyphenated, no spaces (e.g., `command-line-tool`, `typescript`, `react`).

Prioritize topics that are:

- Specific to the project's language, framework, and domain
- Commonly used on GitHub (popular topics get more visibility)
- Descriptive of the project's purpose and capabilities

Print the candidate list to the user.

## Step 3 — Validate Topics Against GitHub

For each candidate topic, run:

```bash
gh search repos --topic=<topic> --limit=1 --json fullName --jq 'length'
```

If the result is `0`, the topic does not exist on GitHub — remove it from the list. Keep only topics that return at least one matching repository.

Print the validated list to the user, noting any topics that were removed.

## Step 4 — Apply Topics to the Repository

Set the validated topics on the current repository:

```bash
gh repo edit --add-topic topic1 --add-topic topic2 --add-topic topic3
```

Print the final list of applied topics and a link to the repository.
