# Chapter 4: Commentary

## Core Idea
Go provides C-style `/* */` block comments and C++-style `//` line comments. Line comments are the norm; block comments appear mostly as package comments but are useful within an expression or to disable large swaths of code. Comments immediately before a top-level declaration (with no intervening newlines) are *doc comments* - the primary documentation for a package or command.

*This chapter is thin - it states conventions rather than introducing frameworks.*

## Frameworks Introduced
- **Doc comments precede the declaration**: A comment directly above a top-level declaration documents that declaration.
  - When to use: For every exported package, type, function, and constant you want documented.
  - How: Place the comment on the line(s) immediately before the declaration with no blank line between; tools like `godoc` associate it with the declaration.

## Key Concepts
- **Line comments (`//`)**: The default, everyday comment style.
- **Block comments (`/* */`)**: Used for package comments, or to comment out large regions / sit within an expression.
- **Doc comments**: Pre-declaration comments that become the package's documentation (see "Go Doc Comments").

## Mental Models
- Think of the comment-above-the-decl as *the* doc: write it for the reader of `godoc` output, not for the reader of the source.

## Anti-patterns
- **Leaving a blank line between a comment and its declaration**: Breaks the doc-comment association.
- **Over-commenting the obvious**: Comments should add information, not echo the code.

## Key Takeaways
1. Prefer `//` line comments; reserve `/* */` for package comments, inline use, or disabling code.
2. A comment immediately before a top-level declaration is its doc comment - keep no blank line between them.
3. See "Go Doc Comments" for the full doc-comment conventions.

## Connects To
- **Ch 3 (Formatting)**: `gofmt` preserves and reformats comments, so placement is what matters.
- **Ch 5 (Names)**: good names reduce the need for comments; a helpful doc comment can beat a long name.
