---
name: nystrom-game-programming-patterns
description: Diagnoses a game codebase through the 19 patterns in Robert Nystrom's Game Programming Patterns - Command, Flyweight, Observer, Prototype, Singleton, State, Double Buffer, Game Loop, Update Method, Bytecode, Subclass Sandbox, Type Object, Component, Event Queue, Service Locator, Data Locality, Dirty Flag, Object Pool, Spatial Partition - explains why each fits, and proposes a concrete application plan. Also answers architecture trade-offs from the book (YAGNI, fixed vs variable timestep, Singleton alternatives, Component vs inheritance, measure-first optimization). Triggers on "map these code smells to design patterns", "which Game Programming Pattern fits", "game loop fixed timestep", "component vs inheritance", or game architecture questions about frame loops, entity/component structure, spawning/churn, or spatial queries. Only for game and realtime interactive projects; not for general software and not a Gang-of-Four reference (no Factory, Strategy, Adapter, Decorator, Facade).
---

Analyze a game codebase (or a focused design question) through the lens of the 19 *Game Programming Patterns* and answer three questions for the user:

1. **What problems here can a design pattern solve, and which one?**
2. **Why does that pattern solve the problem — here, in this code?**
3. **How do we apply it?**

## Supporting references (load as needed)

| File | When to read |
|------|----------------|
| [`references/patterns.md`](references/patterns.md) | Every candidate pattern — **Recognize / Why / When / Keep in mind / Application sketch**. Do not reason about a pattern from memory alone. |
| [`references/cheatsheet.md`](references/cheatsheet.md) | Fast triage, decision rules, trade-off matrices (timestep, Singleton alternatives, optimization). |
| [`references/architecture.md`](references/architecture.md) | Whether *any* new structure is warranted (ease of change, YAGNI, three speeds, anti-patterns). |

## Step 1 — Explore the codebase

Build a mental model before naming a single pattern:

1. Read entry points, manifest, and existing docs (`README.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `AGENTS.md`).
2. Map the top-level structure — modules, packages, service boundaries.
3. Trace one or two hot paths end-to-end (a frame loop, a spawn path, an input-to-action path) to see how things couple.
4. Hunt for the **smells** in the index below (or the fuller table in [`references/cheatsheet.md`](references/cheatsheet.md)). Note each with a concrete `file:line` and a one-line description of the pain it causes.

**Design-only questions** (no repo, or pure "should we use X?"): skip deep exploration; load [`references/architecture.md`](references/architecture.md) and the relevant pattern entry / cheatsheet matrix, then answer with When-to-Use and Keep-in-mind still applied.

## Step 2 — Triage smells to candidate patterns

Match each smell to candidate patterns using the index. This is a fast triage — every candidate still has to pass Step 4.

| Symptom / code smell you observe | Candidate pattern(s) |
|---|---|
| Button presses hard-wired to `jump()`/`fireGun()`; need rebinding, undo/redo, replay, or AI driving any actor | Command |
| Millions of similar objects; duplicated large blobs (meshes/textures) per instance; an enum + big `switch` on type | Flyweight |
| Unrelated systems coupled so one can notify another; tendrils of one concern woven through another's code | Observer |
| Parallel spawner/factory hierarchy per subclass; sibling data entities repeating identical fields | Prototype |
| Booleans with invalid combinations; an `enum` + growing `switch`; mutually exclusive modes over time | State |
| A "manager" god class babysitting other objects; global state wrapped in a class; everyone grabs one instance everywhere | Singleton *(treat as a smell to refactor away — see alternatives in its entry)* |
| Tearing/flickering; readers see half-written state; same-step updates are order-dependent | Double Buffer |
| App freezes waiting for input; speed varies with hardware; sim slows under load | Game Loop |
| Giant pile of per-entity code stuffed in the loop; entities hardcoded; long per-entity loops block the frame | Update Method |
| Behavior hard-coded in the engine language; slow recompiles kill iteration; need modding, post-ship patches, or sandboxing | Bytecode |
| Many subclasses of one base with redundant code, each poking into unrelated subsystems | Subclass Sandbox |
| Hundreds of subclasses just to vary data; designers tuning numbers force recompiles; DLC adding new breeds | Type Object |
| Monolithic god class spanning input/physics/graphics/sound; Deadly Diamond from sharing capabilities | Component |
| Synchronous API blocks the caller; push/pull mismatch; cross-system calls stomping on the wrong thread | Event Queue |
| Every call site hard-coupled to a concrete system; want to swap, null, or decorate the implementation | Service Locator |
| Hot loop pointer-chasing through scattered heap objects; cache misses; vtable hops in inner loops *(needs profiling)* | Data Locality |
| Derived data recomputed every frame / on every change; redundant cascading recomputation | Dirty Flag |
| Frequent alloc/free of similar short-lived objects; fragmentation; slow heap allocation | Object Pool |
| O(n²) all-pairs proximity/collision queries; "what's near here?" scans the whole array | Spatial Partition |

## Step 3 — Load the full core prompt

For every candidate from Step 2, read the matching entry in [`references/patterns.md`](references/patterns.md). The entry is the lens: it tells you exactly what to confirm, how to justify, and how to apply.

When weighing *whether* to recommend structure at all, or choosing among Singleton / DI / Locator / timestep styles, also read the relevant sections of [`references/architecture.md`](references/architecture.md) and [`references/cheatsheet.md`](references/cheatsheet.md).

## Step 4 — Confirm fit and justify (the "why")

For each candidate, before recommending:

1. **Confirm the signals.** Do the **Recognize the need** bullets genuinely appear in the code? Cite `file:line` for each. If only one or two weakly apply, drop it.
2. **Check the gate.** Does **When to use** hold? For the four optimization patterns this is non-negotiable: require a *measured* performance problem before recommending Data Locality, Dirty Flag, Object Pool, or Spatial Partition. Never recommend them preemptively.
3. **Weigh the cost.** Read **Keep in mind**. If the risks outweigh the benefit for this codebase, say so and drop it — or recommend a lighter alternative the entry names. Architecture check: does this *reduce* what someone must load to change the code ([`architecture.md`](references/architecture.md))?
4. **Justify in context.** Explain **Why it works** tied to the *actual* code, not the book's example. One or two sentences per pattern: name the indirection/decoupling/data-arrangement it introduces and how that removes the specific pain you found.

Reject candidates that don't pass. A shortlist of 2–5 well-justified patterns beats a dump of 19.

## Step 5 — Plan the application (the "how")

For each surviving pattern, produce a concrete plan:

- **Target**: the exact files/types to change (`file:line`).
- **Steps**: drawn from the entry's **Application sketch**, adapted to the codebase's language and conventions.
- **Risks**: the relevant **Keep in mind** bullets and how you'll mitigate them.
- **Sequencing**: order the work by impact/effort; note dependencies between patterns (e.g., Component enables Data Locality; Object Pool helps State's instantiated states).
- **Verification**: how to confirm the pattern worked (a test, a profiler number, a before/after).

## Output

Present a structured report with three sections matching the three questions — **Problems → Patterns**, **Why they fit**, **Plan** — each tied to concrete code when a repo is present. Offer to persist it as `DESIGN-PATTERNS.md`; if one exists, show a diff preview and ask before overwriting.

For pure design questions without a codebase, answer with: recommendation, When-to-Use gate, Keep-in-mind risks, and a short application sketch — still no pattern dump.

## Principles

- **Don't force patterns.** Every pattern adds structure; recommend one only when the pain is real and the **When to use** gate passes.
- **Architecture is ease of change.** Prefer recommendations that shrink the next learn-code cost; reject engine-for-its-own-sake and YAGNI violations ([`architecture.md`](references/architecture.md)).
- **Singleton is a smell, not a solution.** If the codebase already has singletons causing coupling, recommend the entry's alternatives (dependency injection, Subclass Sandbox accessor, Service Locator, or a plain static class) — don't introduce new ones. See the Singleton alternatives matrix in [`cheatsheet.md`](references/cheatsheet.md).
- **Optimization patterns need evidence.** Data Locality, Dirty Flag, Object Pool, Spatial Partition only on a measured problem.
- **Scoped to games and realtime interactive systems.** This lens is for game/realtime codebases; map the book's examples to the user's game domain. Don't reach for it on general software where Gang-of-Four patterns (Factory, Strategy, Adapter, etc.) are the better fit.
- **Ground everything in code.** When analyzing a repo, every problem, justification, and step cites `file:line`. No pattern-theory lectures.

## Edge cases

- **Small codebase (< ~2,000 LOC):** likely only one or two patterns apply, or none — say so plainly rather than inventing work.
- **No real problems found:** report that the codebase is already well-structured where it matters, and note any patterns it already uses correctly.
- **Existing pattern misuse** (a Singleton causing pain, a God-class component bag): frame as "refactor toward the pattern's intent," citing the entry's alternatives.
- **User wants implementation, not just analysis:** the plan in Step 5 is the handoff — offer to execute the first, smallest change.
- **Concept / trade-off only** (e.g. fixed vs variable timestep, Type Object vs inheritance): use cheatsheet matrices + the pattern entry; do not invent a fake codebase diagnosis.
