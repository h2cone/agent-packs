# Patterns & Techniques — *A Philosophy of Software Design*

The book's reusable techniques (not GoF patterns). Apply by the red flags they eliminate.

## Deep Module Design
**When to use**: designing any module/class/method.
**How**: maximize functionality per unit of interface complexity — a "tall rectangle." Hide mechanism in the implementation; keep the interface to what callers must know (formal + informal).
**Trade-offs**: a deeper implementation is fine; a simple interface matters more than a simple implementation.

## Information Hiding
**When to use**: decomposing a system into modules.
**How**: each module encapsulates one or a few design decisions invisible in its interface. Decompose around *knowledge*, not execution order.
**Trade-offs**: hide only what isn't needed outside; `private` ≠ hidden (getters/setters leak).

## Somewhat-General-Purpose Modules
**When to use**: designing a new module's interface.
**How**: functionality covers current needs; the interface doesn't tie to them. Reduce methods without reducing capability; ask "in how many situations is this used?" and "is it easy to use now?"
**Trade-offs**: too general (single-char `insert`) forces glue code; too special (`backspace(Cursor)`) leaks and can't generalize.

## Push Specialization Up or Down
**When to use**: when specialization can't be eliminated.
**How**: *up* — push special-purpose logic to top-level callers, keep lower layers general. *down* — push it into pluggable low-level modules behind a general interface (device drivers).
**Trade-offs**: keeps general mechanisms pure; requires a clean separating interface.

## Eliminate Special Cases
**When to use**: when method bodies sprout `if`s for edge cases.
**How**: design the normal case to handle edges with no extra code (e.g. "no selection" = empty selection with start==end).
**Trade-offs**: can require a cleverer representation; pays off in simplicity and speed.

## Define Errors Out of Existence
**When to use**: before throwing an exception.
**How**: redefine the operation's contract so the condition isn't an error (`unset` = "ensure variable doesn't exist"; Unix mark-for-deletion; clamped `substring`).
**Trade-offs**: may hide bugs, but the simplicity gained usually prevents more bugs than it hides.

## Exception Masking / Aggregation / Just Crash
**When to use**: for exceptions you can't define away.
**How**: *mask* — handle at a low level (TCP resends, NFS retries). *aggregate* — one top-level handler for many (web-server dispatcher; promote small errors to one recovery path). *crash* — abort for unrecoverable, infrequent errors (out-of-memory).
**Trade-offs**: mask low, aggregate high; never mask info callers actually need.

## Design It Twice
**When to use**: at every major design decision (interface, implementation, decomposition).
**How**: sketch ≥2 *radically different* alternatives; compare on ease-of-use for higher-level code first; choose, combine, or let weaknesses drive a new design.
**Trade-offs**: ~1–2 hrs for a class; pays back in days/weeks of implementation.

## Pull Complexity Downward
**When to use**: when a module faces unavoidable, related complexity.
**How**: absorb it into the implementation so callers get a simple interface; prefer auto-computed values + defaults over exported config parameters.
**Trade-offs**: only pull down complexity that's related to the module and simplifies elsewhere — otherwise it's leakage.

## Comments-First (Comments as Design Tool)
**When to use**: starting a new class.
**How**: write class interface comment → method interface comments + empty bodies → instance-variable comments → fill bodies. Each new entity gets its comment before/with its declaration.
**Trade-offs**: a long/hard comment is a *red flag* (Hard to Describe) signaling a bad abstraction, not a writing problem.

## Describe the Non-Obvious
**When to use**: every comment.
**How**: comment at a *different* level than the code — lower for precision (units, boundaries, ownership, invariants), higher for intuition (what the block is trying to do). Never repeat the code. Separate interface comments (the abstraction) from implementation comments.
**Trade-offs**: interface comments that must describe implementation reveal a shallow class.

## Stay Strategic When Modifying
**When to use**: any change to existing code.
**How**: aim for the design you'd have built from scratch with this change; refactor toward it. Keep comments near code, documented once (designNotes + pointers), and check the diffs before committing.
**Trade-offs**: pragmatic under deadlines, but "if you're not making the design better, you're making it worse."

## Consistency
**When to use**: across names, style, interfaces, patterns, invariants.
**How**: document conventions; enforce with automated checkers + reviews; "when in Rome, do as the Romans do"; don't change conventions without strong new evidence.
**Trade-offs**: value of consistency > value of a marginally better approach; but don't force dissimilar things together.

## Make Code Obvious
**When to use**: always; verify via code reviews.
**How**: good names + consistency + judicious whitespace + compensating comments. Avoid generic containers, declaration/allocation type mismatch, and unspoken surprises.
**Trade-offs**: design for readers, not writers — a few extra writer-minutes save every reader.

## Design for Performance
**When to use**: throughout development, intensively only where it matters.
**How**: know expensive operations (network, I/O, allocation, cache misses); prefer cheap-but-equal designs; **measure before and after**; as a last resort design around "the ideal" minimal critical path, branching special cases off it.
**Trade-offs**: simpler code is usually faster; never retain complexity that doesn't measurably pay.

## Decide What Matters
**When to use**: at every design choice.
**How**: find leverage (one decision solving many); *minimize* what matters (defaults, hide info, handle low); *emphasize* what matters (prominence, repetition, centrality).
**Trade-offs**: two failure modes — treating too much as important, or missing what is important.

## Context Object
**When to use**: when a value is threaded through many methods that don't use it (pass-through variable).
**How**: one object per system instance holds all global state; referenced by major objects so it appears only in constructors.
**Trade-offs**: shares globals' downsides (nonobvious dependencies, thread-safety); keep context vars immutable; it's the least-bad option.

## Cross-Module Documentation
**When to use**: a decision spans multiple modules (e.g. a network protocol).
**How**: if there's an obvious central place (an enum everyone extends), document cascading changes there; else keep a `designNotes` file with short "See X in designNotes" pointers at each site.
**Trade-offs**: single source of truth vs. distance from dependent code — pointers mitigate discovery.
