---
name: git-commit
description: Stages all changes and commits them with an AI-generated multi-line message. Triggers on "commit", "generate commit message", "commit my changes", or "git commit".
---

Stage everything, read the diff, write a good commit message, and commit.

## Steps

1. Verify there are changes: `git status --porcelain`. If empty, stop and say so.
2. Stage all changes: `git add -A`.
3. Read the staged diff for context: `git diff --cached --stat` and `git diff --cached`.
4. Write the message:
   - Subject: concise, imperative, ≤50 chars. Conventional Commit prefix optional.
   - Body (when the change is non-trivial): blank line, then wrapped lines explaining *what* and *why*, not *how*.
5. Commit with a real multi-line message:

   ```bash
   git commit -m "$(cat <<'EOF'
   <subject>

   <body line>
   <body line>
   EOF
   )"
   ```

6. Confirm with `git log -1 --stat`.

## Rules

- Plain text only — no markdown, code fences, or quotes inside the message.
- Group unrelated changes into one coherent message; don't list every file.
- Don't add `Co-Authored-By` or tool attribution unless asked.
- Never `git push` — committing only.
