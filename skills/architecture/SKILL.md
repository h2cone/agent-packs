---
name: architecture
description: Generates an ARCHITECTURE.md for any codebase following the matklad standard — a concise, high-level map of modules and their relationships aimed at helping newcomers navigate the project. Triggers on "generate architecture doc", "create ARCHITECTURE.md", "document project architecture", or mapping codebase structure.
---

Analyze the codebase and generate an `ARCHITECTURE.md` following the [matklad standard](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html). The document is a country-level map — not an atlas of every state. Every recurring contributor will read it, so brevity matters.

## Explore the codebase

Before writing anything, build a mental model:

1. Read the project's entry points, manifest files, and existing docs (`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`).
2. Map the top-level directory tree — identify coarse-grained modules, crates, packages, or service boundaries.
3. Read key files in each module to understand purpose and dependencies. Focus on public interfaces, not internals.
4. Trace one or two important call paths end-to-end (e.g., how a request flows from entry point to response) to understand module relationships.
5. Look for architectural patterns: layering, plugin systems, message passing, shared state.

## Generate ARCHITECTURE.md

Write the document with these sections, omitting any that have no meaningful content:

### Bird's Eye View

One or two paragraphs explaining what the project does and the high-level approach. Answer: "What problem does this solve and how?"

### Code Map

The centerpiece. For each coarse-grained module or directory:

- **Name** — the directory or crate name.
- **Purpose** — one sentence on what it does.
- **Key types/files** — name the most important ones (name, don't link — links go stale).
- **Relationships** — which other modules it depends on or is depended upon by.

Use a flat list or table. Keep it at the right abstraction level — describe modules, not individual functions.

### Architectural Invariants

Document important constraints, especially those expressed as the **absence** of something:

- "The `model` layer does not depend on `view`."
- "All database access goes through the `repo` layer."
- "No module imports from `internal/` of another module."

These invariants shape every future change and are invisible without explicit documentation.

### Cross-Cutting Concerns

If the project has patterns that span multiple modules, document them:

- Error handling strategy
- Logging / observability conventions
- Authentication / authorization flow
- Configuration loading
- Testing patterns (e.g., integration vs unit, fixture conventions)

Only include concerns that a newcomer would need to know and that aren't obvious from the code.

## Writing principles

- **Concise over complete** — if it's in the code, don't repeat it. The doc points people to where things are, it doesn't explain how they work internally.
- **Name, don't link** — reference files and types by name (e.g., "`FooParser` in `src/parser/`"). Hyperlinks rot; names can be searched.
- **Stable content only** — only document things unlikely to change frequently. Omit volatile implementation details.
- **No module internals** — don't describe how a module works inside. That belongs in inline comments or module-level docs.
- **Match the project's language** — use the same terminology the codebase uses. Don't invent new names for existing concepts.

## Edge cases

- If `ARCHITECTURE.md` already exists, show a diff preview and ask before overwriting.
- For monorepos, organize the Code Map by workspace/package, noting cross-package dependencies.
- For very small projects (< 2,000 LOC), a Bird's Eye View and a brief Code Map may be sufficient — skip Invariants and Cross-Cutting Concerns unless they're non-obvious.
- For very large projects (> 200,000 LOC), focus on the top two layers of the module hierarchy. Point readers to sub-module docs for deeper detail.
- If the project uses a framework with strong conventions (Rails, Next.js, etc.), note the framework and only document deviations from its standard structure.
