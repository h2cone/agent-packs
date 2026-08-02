# Chapter 16: Modifying Existing Code

## Core Idea
A mature system's design is shaped more by *changes* than by its initial conception. When modifying existing code, **stay strategic**: after each change, the system should look as if it had been designed from scratch with that change in mind. Keep comments accurate as the code evolves.

## Frameworks Introduced
- **Stay strategic when modifying**
  - When to use: every bug fix or feature added to existing code.
  - How: resist "what's the smallest possible change?" - that's tactical and accumulates complexity. Instead ask whether the current design is still the best given the change; refactor toward it. "If you're not making the design better, you are probably making it worse." Be pragmatic under deadlines (a 2-day near-equivalent to a 3-month refactor; or schedule cleanup after the deadline), but resist compromises.
- **Keep comments near the code**
  - When to use: placing and maintaining comments.
  - How: the closer a comment is to its code, the more likely it's updated. Put method interface comments in the code file next to the body (not a far-away header) - tools/IDEs surface docs to users, so optimize for the maintainer. Spread implementation comments to the *narrowest* scope (one per phase, not one big block at the top). The farther a comment is from its code, the more *abstract* it should be (so minor changes don't invalidate it).
- **Comments belong in the code, not the commit log**
  - When to use: writing a commit message about a subtle change.
  - How: if future developers need the info (e.g. why a subtle fix exists, lest someone undo it and reintroduce a bug), put it *in the code*. Commit logs are rarely scanned. Put docs where developers will actually see them.
- **Avoid duplication** (document each decision once)
  - When to use: a decision affects multiple places.
  - How: don't repeat the doc at each site - find the one obvious place (e.g. the variable's declaration), or use a `designNotes` file, and leave short "See comment in xyz" pointers elsewhere. Don't redocument another module's decisions at a call site, and don't duplicate external docs (HTTP spec, user manual) - reference them.
- **Check the diffs**: before committing, scan all changes and confirm each is reflected in the docs (also catches leftover debug code and TODOs).
- **Higher-level comments are easier to maintain**: abstract comments survive minor code changes, so they stay accurate with less effort (complementing Ch 13's precision where needed).

## Key Concepts
- **"Designed-from-scratch-with-this-change" test**: the target state after any modification.
- **Comment proximity**: distance from code inversely predicts accuracy.
- **Single source of truth**: each design decision documented exactly once.

## Mental Models
- Treat every edit as a design opportunity, not a surgical patch.
- If info belongs to future developers, it belongs in the code - the commit log is not documentation.
- The farther a comment sits from its code, the higher-level (more change-resistant) it must be.

## Anti-patterns
- **Minimal tactical patches** that each add a special case or dependency.
- **Interface comments in far-away header files** that drift from the implementation.
- **Commit-log-only documentation** of subtle motivations.
- **Duplicated comments** across sites that fall out of sync silently.

## Worked Example
The strategic-modification test in practice: when adding a feature, don't just bolt it on - ask if the resulting structure is what you'd have designed from scratch; if not, refactor now (or schedule it). A commit message like "worked around a device-driver crash in Linux 2.4.x" is *not* enough on its own: if that workaround isn't explained in the code, a later developer may delete it and reintroduce the crash - so the rationale must live in a code comment. For a cross-cutting decision (e.g. RAMCloud's `Status` values touching many files), the single source is the enum declaration, with a comment listing every other place to update, rather than duplicated warnings scattered everywhere.

## Key Takeaways
1. Stay strategic when modifying - aim for the design you'd have built from scratch.
2. "If you're not making the design better, you're probably making it worse."
3. Keep comments near their code; place them at the narrowest useful scope.
4. Put design rationale in the code, not just the commit log.
5. Document each decision exactly once; reference, don't duplicate.

## Connects To
- **Ch 3**: stay strategic - the investment mindset applied to modifications.
- **Ch 13**: what good comments contain; this chapter is how to *keep* them accurate.
- **Ch 15**: comments-first; this chapter keeps them alive as code changes.
