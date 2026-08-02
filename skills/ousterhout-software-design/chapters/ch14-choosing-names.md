# Chapter 14: Choosing Names

## Core Idea
Names are underrated documentation: good names make code obvious and catch bugs; poor names create ambiguity and bugs. Choose names that are **precise** and **consistent** - "reasonably close" isn't good enough. Names are a form of abstraction.

## Frameworks Introduced
- **Names create an image**
  - When to use: naming any entity.
  - How: the goal is a mental image of what the thing *is* and *isn't*. Ask: "If someone sees this name in isolation, how closely can they guess what it refers to?" Names are abstractions - capture what's most important, omit the rest. Keep to ~2–3 words.
- **Precision** (Vague Name red flag)
  - When to use: reviewing any name.
  - How: the most common fault is being too generic (`getCount`, `x`, `y`, `block`, `result`). Boolean names should be *predicates* (`cursorVisible`, not `blinkStatus`). Names can also be *too* specific (`delete(Range selection)` -> `delete(Range range)`, since it deletes any range, not just selections). Generic loop vars (`i`, `j`) are fine when the whole loop is visible.
- **Consistency**
  - When to use: for recurring concepts (e.g. block numbers in a file system).
  - How: pick one common name per purpose and use it everywhere - *never* for anything else - and keep the purpose narrow so all uses share behavior. For two vars of the same kind, add a prefix (`srcFileBlock`, `dstFileBlock`). Use `i` for outer loops, `j` for inner, consistently. Consistency lets readers reuse knowledge across contexts.
- **Avoid extra words**: every word should carry information. Drop generic nouns (`fileObject`), type prefixes / Hungarian notation (IDEs show types), and class-name repetition (a `block` field in class `File`).
- **Hard to Pick Name** (red flag)
  - When to use: when you struggle to name something.
  - How: difficulty naming signals the entity may not have a clean definition - consider refactoring (e.g. one variable doing two jobs -> split it). Naming improves design by surfacing weaknesses.
- **A different opinion: Go style guide** (very short names). Ousterhaut disagrees with ambiguous short names (`ch`, `d`) - they invite the `block`-style confusion. He agrees with one Go rule: *the greater the distance between a name's declaration and its uses, the longer the name should be.* Ultimately, readability is judged by **readers, not writers** - if readers find short names cryptic, lengthen them.

## Key Concepts
- **Precision + consistency**: the two properties of a good name.
- **Names as abstraction**: a few words capturing the most important aspects.
- **Boolean-as-predicate**: a boolean name should read as a true/false assertion.
- **Complexity is incremental** (Ch 2): one mediocre name is harmless; thousands add up - so name well everywhere.

## Mental Models
- A name is an abstraction: if it could mean several things, it means nothing.
- If you can't find a clean name, the design is muddy - refactor, don't paper over it.
- Judge names by the reader, not by what you meant when you wrote them.

## Anti-patterns
- **Vague Name**: `block`, `count`, `result`, `x`/`y` for non-coordinate meanings.
- **Boolean non-predicates**: `blinkStatus`.
- **Over-specific names** that imply a narrower use than reality (`selection` for any `Range`).
- **Hungarian notation** and other redundant type-encoding.
- **Inconsistent common names** (same name, different behavior -> the bug below).

## Worked Example
The Sprite OS bug (six months to find): the variable `block` meant a *physical disk block* in some code and a *logical block within a file* in other code. A logical `block` was used where a physical one was required, overwriting an unrelated disk block with zeroes. Readers reflexively assumed `block` held the "right" kind because the name was a "reasonably close" match for both. Distinct names (`fileBlock` vs. `diskBlock`), or better, distinct types, would have prevented it - the compiler would have caught the mismatch.
Other fixes: `getCount()` -> `numActiveIndexlets()`; `blinkStatus` -> `cursorVisible`; `VOTED_FOR_SENTINEL_VALUE` -> `NOT_YET_VOTED`; Linux's near-identical `struct socket` / `struct sock` -> `sock_base` / `inet_sock`.

## Key Takeaways
1. Names are documentation - precise, consistent names make code obvious and prevent bugs.
2. "Reasonably close" isn't good enough; aim for precise, unambiguous, intuitive.
3. Booleans should be predicates; avoid generic nouns and redundant type words.
4. Use one common name per purpose, consistently, and never overload it.
5. If a name is hard to pick, the design may be wrong - let naming drive refactoring.

## Connects To
- **Ch 2**: naming is incremental complexity; obscurity often starts with a vague name.
- **Ch 13**: good names reduce (but don't replace) the need for comments.
- **Ch 18**: precise, consistent names make code obvious.
- **Ch 19**: disagrees with the Go short-name style (and other trends).
