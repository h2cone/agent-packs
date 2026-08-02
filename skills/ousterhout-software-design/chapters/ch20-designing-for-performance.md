# Chapter 20: Designing for Performance

## Core Idea
Clean design and high performance are *compatible* - simple code tends to be fast. Think about performance up front (choose naturally-efficient designs), **measure before and after** any change, and as a last resort **design around the critical path**. Simplicity is the performance tool.

## Frameworks Introduced
- **How to think about performance**
  - When to use: during normal development.
  - How: neither optimize-every-statement (slow, adds complexity, often pointless) nor ignore performance (death by a thousand cuts, 5–10x slow, unfixable later). Instead develop an *awareness of expensive operations* - network round-trips, disk/flash I/O, dynamic allocation, cache misses - and prefer cheap operations when they're just as simple (hash table over ordered map; store structs inline rather than arrays of pointers). Learn costs via **micro-benchmarks**. Simpler code is usually faster: no special-case checks, deep classes (fewer layer crossings). Add complexity for speed only when clearly justified and ideally hidden from interfaces.
- **Measure before (and after) modifying**
  - When to use: when the system is too slow.
  - How: don't tune by intuition (it's unreliable even for experts). Measure first to (a) find the few specific high-impact spots and (b) set a baseline. After changes, re-measure; if no measurable gain, *back the change out* (unless it simplified the code). Never retain complexity that doesn't pay.
- **Design around the critical path** (last resort, for hot code with no fundamental fix)
  - When to use: when a hot path can't be fixed by a cache or better algorithm.
  - How: ignore existing structure and ask "what's the *smallest* amount of code that must execute in the common case?" - call this **the ideal**. Then find a clean design that stays as close to the ideal as possible, adding only minimal code for clean abstractions. **Remove special cases from the critical path**: ideally one initial test detects all special cases and branches them *off* the path (where simplicity, not speed, matters). A new instance variable can collapse several special-case checks into one.
- **Fundamental fixes first**: a cache or a different algorithm/structure (e.g. kernel-bypass networking) beats micro-tuning; apply the rest of the book's design techniques around it.

## Key Concepts
- **Expensive operations** (today): network, secondary-storage I/O, dynamic allocation, cache misses.
- **Micro-benchmark**: a tiny program isolating one operation's cost.
- **The ideal**: the minimal common-case code, a target to design toward.
- **Critical path**: the code executed in the most common case; minimize special-case tests on it.
- **Cleaner ≈ faster**: the Buffer rewrite doubled speed *and* cut code 20%.

## Mental Models
- Simple code is fast code; complexity often does redundant or extraneous work.
- Never optimize by gut - measure to find and to verify.
- Design the critical path first (the ideal), then fit clean abstractions around it.

## Anti-patterns
- **Intuition-driven tuning** that wastes effort and adds complexity for no gain.
- **Death by a thousand cuts**: ignoring performance until inefficiency is smeared across the codebase.
- **Special-case checks scattered along the hot path**, each adding a branch.
- **Shallow layers on the critical path** (pass-through methods) - slow *and* a design smell (Ch 7).

## Worked Example
RAMCloud `Buffer` allocation, optimized ~2×. The original critical path (`Buffer::alloc` → `allocateAppend` → `Allocation::allocateAppend`) had two problems: (1) it checked **6 distinct conditions** (any allocations? enough room? - checked twice; adjacency to last chunk; etc.) and (2) it crossed **three shallow layers with identical signatures** - a pass-through red flag (Ch 7), slow *and* complex. The redesign: a single method on the critical path, plus a new instance variable `availableAppendBytes` that is zero for *three* different special cases at once (no space / last chunk not internal / no chunks) - collapsing them into one test. Special cases branch off-path. Result: appending 1 byte dropped 8.8 ns → 4.75 ns (~2×), and the class shrank 20% (1886 → 1476 lines) - faster *and* simpler. (Earlier, RAMCloud chose kernel-bypass networking as a *fundamental* fix decided up front from prior measurements, letting the rest of the system stay simple.)

## Key Takeaways
1. Clean design and high performance are compatible; simple code is usually fast.
2. Develop awareness of expensive operations; prefer cheap-but-equally-simple designs.
3. Always measure before and after; back out changes with no measurable gain.
4. For hot paths, design around "the ideal" minimal common-case code, then wrap clean abstractions around it.
5. Remove special cases from the critical path - one test up front, branch the rest off-path.

## Connects To
- **Ch 2/6**: eliminating special cases helps both simplicity and speed.
- **Ch 4/7**: deep modules and few shallow layers reduce layer-crossing overhead.
- **Ch 8**: pulling complexity downward (e.g. into one method) aids performance.
- **Ch 21**: optimize only what matters - the critical path.
