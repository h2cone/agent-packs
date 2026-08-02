# Chapter 9: Better Together Or Better Apart?

## Core Idea
Decide together-vs-apart by **overall system complexity and modularity**, not by size. Subdivision is not free - it adds interfaces, management code, separation, and duplication. Bring related things together; separate general-purpose from special-purpose code. Depth matters more than length.

## Frameworks Introduced
- **Costs of subdivision**
  - When to use: before splitting anything.
  - How: more components → harder to track and find; more interfaces (each adds complexity); more management code; greater separation (bad if the pieces depend on each other - readers flip back and forth, or miss dependencies); duplication. Subdivide only when the pieces are truly independent.
- **Signs two pieces are related** (candidates to join)
  - They share information (e.g. both depend on a document syntax).
  - They are used together - *bidirectionally* (a disk cache always uses a hash table, but hash tables have many non-cache uses → keep separate).
  - They overlap conceptually under one higher-level category.
  - It's hard to understand one without looking at the other.
- **Bring together if**
  - *Information is shared* (merging isolates the shared knowledge).
  - *It simplifies the interface* (e.g. merging `FileInputStream`+`BufferedInputStream` and buffering by default makes buffering invisible to most users).
  - *It eliminates duplication* (factor repeated code into a method, or restructure so it runs once - e.g. a single cleanup block reached via `goto`).
- **Separate general-purpose from special-purpose code**: a module with a reusable mechanism should provide *only* that mechanism; specialization belongs in a module tied to the particular use.
- **Splitting and joining methods**
  - *Factor out a subtask* (Fig 9.3b): clean split only if the child is understandable without the parent and vice versa (the child is general-purpose). If you flip between parent and child to understand them, that's the **Conjoined Methods** red flag.
  - *Divide into two caller-visible methods* (Fig 9.3c): only if the original interface was too complex because it did unrelated things; each new method simpler; ideally a caller needs only one.
  - Don't split merely by length - it yields shallow methods (Fig 9.3d).
  - Joining can replace two shallow methods with one deeper one, eliminate duplication/dependencies, or improve encapsulation.
- **A different opinion: Clean Code** (length-based splitting): Ousterhout disagrees - depth > length. Make functions deep first, then short enough to read; don't sacrifice depth for length. Beyond a few dozen lines, further shrinking rarely helps readability and creates conjoined functions.

## Key Concepts
- **Repetition** (red flag): the same code over and over means you haven't found the right abstraction.
- **Special-General Mixture** (red flag): a general mechanism polluted with special-purpose code for one use case.
- **Conjoined Methods** (red flag): can't understand one method without the other; the split was wrong.
- **Goal of method design**: each method does one thing, completely, with a simple interface - deep, regardless of length.

## Mental Models
- "Subdivision isn't free" - every split taxes the system with a new interface and more separation.
- Related code together is often simpler than the same code scattered, even if the together-version is longer.
- Long methods with a simple signature and a clean read are *deep* and good; length alone is not a smell.

## Anti-patterns
- **Splitting by line count** (Clean Code style) into many shallow/conjoined methods.
- **Repetition**: not factoring out a repeated pattern.
- **Special-General Mixture**: mixing a use case into a general mechanism.
- **Conjoined Methods**: mutually dependent split methods.
- **Separating truly related code** that forces readers to flip between files.

## Worked Example
Two contrasting editor examples:
1. *Separate (cursor + selection)*: a combined object storing both the selection and which end holds the cursor was *more* complex (booleans, conditional retrieval) and gave higher-level code no benefit. Separating them - and representing both with a general `Position` class - simplified both use and implementation; `Position` found other uses too. (Sometimes apart is better.)
2. *Join (error logging)*: a `NetworkErrorLogger` class with one-line methods (`logRpcOpenError`, ...) each called once and tightly coupled to its call site - shallow and flip-inducing. Inlining the log statements at detection points was simpler and removed the interfaces. (Sometimes together is better.)
Method splitting: extract a cleanly-separable subtask (good); divide a multi-purpose method into focused ones (sometimes); split by length into shallow methods (bad).

## Key Takeaways
1. Choose together-or-apart by overall complexity and modularity, not size.
2. Subdivision has real costs (interfaces, separation, duplication) - only split truly independent pieces.
3. Bring together when info is shared, the interface simplifies, or duplication is eliminated.
4. Separate general-purpose mechanisms from special-purpose use cases.
5. Depth > length: don't split methods by line count; avoid conjoined and shallow splits.

## Connects To
- **Ch 5**: shared information → leakage → reason to join.
- **Ch 6**: separate general-purpose from special-purpose code.
- **Ch 7**: pass-through/shallow methods are the failure mode of over-splitting.
- **Ch 19**: disagrees with Clean Code's length-first splitting (and other trends).
