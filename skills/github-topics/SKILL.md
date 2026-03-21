---
name: github-topics
description: Generates and applies GitHub repository topics by analyzing the codebase, validating candidates against existing GitHub topics, and setting them via the CLI. Triggers on "add topics", "set repo tags", "update GitHub topics", or managing repository topics.
---

Analyze the repository and recommend 10-20 candidate topics. Topics must be lowercase and hyphenated (e.g., `command-line-tool`, `typescript`).

## Validate topics

For each candidate, verify it exists on GitHub:

```bash
gh search repos --topic=<topic> --limit=1 --json fullName --jq 'length'
```

Drop any topic that returns `0`. Show the user which topics were removed and why.

## Apply topics

```bash
gh repo edit --add-topic topic1 --add-topic topic2 --add-topic topic3
```

Print the final list and a link to the repository.
