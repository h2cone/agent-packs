---
name: git-commit
description: Pulls from the tracked upstream, stages all changes, and commits them with an AI-generated multi-line message. Triggers on "commit", "generate commit message", "commit my changes", or "git commit".
---

Sync with the tracked upstream, stage everything, read the diff, write a good commit message, and commit.

## Steps

1. Inspect state and sync: `git status --short --branch`, then resolve the tracked upstream with `git rev-parse --abbrev-ref --symbolic-full-name "@{upstream}"`.
   - If an upstream exists, run `git pull --rebase --autostash`.
   - If the pull, rebase, or autostash fails or leaves unmerged paths (`git diff --name-only --diff-filter=U`), stop without staging/committing and report the recovery state.
   - If no upstream is configured, skip the pull and say so.
2. Verify there are changes after pulling: `git status --porcelain`. If empty, stop and say so.
3. Stage all changes: `git add -A`.
4. Read the staged diff for context: `git diff --cached --stat` and `git diff --cached`.
5. Write the message:
   - Subject: concise, imperative, ≤50 chars. Conventional Commit prefix optional.
   - Body (when the change is non-trivial): blank line, then wrapped lines explaining *what* and *why*, not *how*.
6. Commit with a real multi-line message:

   ```bash
   git commit -m "$(cat <<'EOF'
   <subject>

   <body line>
   <body line>
   EOF
   )"
   ```

7. Confirm with `git log -1 --stat` and `git status --short --branch`.

## Rules

- Plain text only — no markdown, code fences, or quotes inside the message.
- Group unrelated changes into one coherent message; don't list every file.
- Don't add `Co-Authored-By` or tool attribution unless asked.
- Never bypass a failed pull or unresolved conflict to create the commit.
- Never `git push` — committing only.
