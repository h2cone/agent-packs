# Chapter 2: Examples

## Core Idea
The Go package sources are intended to serve not only as the core library but also as examples of how to use the language. When you have a question about how to approach a problem, the documentation, code, and examples in the standard library can provide answers, ideas, and background.

*This chapter is thin - it is a pointer to resources rather than a body of technique.*

## Frameworks Introduced
- **Read the standard library as a reference implementation**: The packages are dual-purpose: usable library + canonical examples of Go style.
  - When to use: When unsure how to structure or implement something.
  - How: Browse the Go package sources; look for runnable, self-contained executable examples on go.dev (click "Example" to expand).

## Mental Models
- Treat the standard library source as a style guide and pattern catalog, not just a dependency.

## Anti-patterns
- **Reinventing a solution before checking the library**: Many "how do I do X" questions are already answered in the standard library's code and examples.

## Key Takeaways
1. The Go package sources are examples of idiomatic Go - read them.
2. Many packages include runnable executable examples on go.dev.
3. The library docs and code are a first stop for "how should I approach this?"

## Connects To
- **Every other chapter**: the idioms shown here are demonstrated throughout the standard library referenced across the book.
