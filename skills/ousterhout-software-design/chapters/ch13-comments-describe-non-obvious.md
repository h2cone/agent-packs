# Chapter 13: Comments Should Describe Things that Aren't Obvious from the Code

## Core Idea
The guiding principle: comments describe what *isn't* obvious from the code - from a first-time reader's perspective. Good comments operate at a *different level of detail* than the code: lower (precision) or higher (intuition), never the same level (which just repeats the code).

## Frameworks Introduced
- **Describe the non-obvious**
  - When to use: every comment.
  - How: "obvious" is judged by a first-time reader, not you. If a reviewer says something isn't obvious, it isn't - don't argue, clarify.
- **Pick conventions** - comment categories: *interface* (before a class/method/struct - the most important), *data-structure member* (next to a field), *implementation* (inside a method - often unnecessary), *cross-module* (rare but important). Every class and method needs an interface comment; comment everything rather than agonizing over edge cases.
- **Don't repeat the code** (Comment Repeats Code red flag)
  - When to use: after writing a comment.
  - How: ask "could someone who's never seen the code write this comment just by looking at it?" If yes, it's worthless. Use *different words* than the entity's name; add info (units, scope) the declaration lacks.
- **Lower-level comments add precision** (for variables/arguments/return values)
  - When to use: documenting declarations.
  - How: fill in units, inclusive/exclusive boundaries, null meaning, ownership (who frees/closes), invariants. Think *nouns* (what the variable represents), not *verbs* (how it's manipulated).
- **Higher-level comments enhance intuition** (inside methods, and for interfaces)
  - When to use: commenting code blocks and loops, and method-level behavior.
  - How: describe *what* the code is trying to do at a higher level ("append the current key hash onto an existing RPC"), not how. "How we got here" comments (conditions prompting the code) are valuable. Ask: what's the simplest thing that explains everything here?
- **Interface documentation** (defines the abstraction)
  - When to use: every class and method.
  - How: *separate* interface comments (what callers need) from implementation comments (how it works). A class interface comment describes the overall abstraction and what each instance represents, plus limitations. A method interface comment gives higher-level behavior + precise args/return + side effects + exceptions + preconditions (minimize these). If an interface comment must describe the implementation, the class is **shallow**.
- **Implementation comments: what and why, not how**
  - When to use: only for longer/complex methods; most short methods need none.
  - How: a high-level comment before each major block or loop (what each iteration does); explain *why* non-obvious code exists (e.g. a bug-fix pointer "Fixes RAM-436").
- **Cross-module design decisions**
  - When to use: when a decision spans multiple classes (e.g. a network protocol affecting sender and receiver).
  - How: if there's an obvious central place (e.g. a `Status` enum everyone must extend), document the cascading changes there. Otherwise keep a central `designNotes` file with one section per topic, and put `// See "Zombies" in designNotes.` pointers in each dependent location.

## Key Concepts
- **Interface vs. implementation comments**: separated so users aren't exposed to internals; their *difference* measures depth.
- **Implementation Documentation Contaminates Interface** (red flag): interface docs that describe implementation details users don't need.
- **Side effect**: a consequence affecting future behavior but not part of the result (must be in the interface comment).
- **"Obvious" is the reader's call**, not the author's.

## Mental Models
- Comments augment code at a *different* level - down for precision, up for intuition; same-level comments just repeat.
- The interface comment *is* the abstraction; if it leaks implementation, the design is shallow.
- Document variables as nouns (what they are), not verbs (how they're twiddled).

## Anti-patterns
- **Comment Repeats Code**: `// Add a horizontal scroll bar` before `new JScrollBar(HORIZONTAL)`.
- **Reusing the entity's words**: `getNormalizedResourceNames` -> "Obtain a normalized resource name" (adds only "to").
- **Vague variable comments**: "Current offset" vs. "Position of the first object not yet returned to the client."
- **Implementation detail in interface docs**: naming internal RPCs or private config params in a class's user-facing comment.

## Worked Example
- *Repeats code* (bad): `ptr_copy = get_copy(obj)   # Get pointer copy`.
- *Precision* (good): `textHorizontalPadding = 4` commented as "blank space, in pixels, on left and right of each line" (units + both-sides), not "horizontal padding of each line."
- *Intuition* (good): a dense RPC-scanning loop commented low-level ("if there is a LOADING readRPC…") is replaced by "Try to append the current key hash onto an existing RPC to the desired server that hasn't been sent yet" - one line that explains almost everything the code does.
- *Interface vs. implementation*: `IndexLookup`'s original comment named internal RPCs (`LookupIndexKeys`, `IndexedRead`) and private constants; the rewrite describes only what users need ("range queries using indexes; each instance is one query"). `Buffer::copy`'s interface comment defines range errors *out of existence* (Ch 10) rather than throwing.
- *Cross-module*: a `Status` enum carries a comment listing every other file to touch when adding a value; a `designNotes` "Zombies" section holds the single source, referenced by short pointer comments.

## Key Takeaways
1. Comments describe what isn't obvious - from a first-time reader's view.
2. Comment at a different level than the code: lower for precision, higher for intuition.
3. Never repeat the code; use different words and add the info the declaration lacks.
4. Separate interface from implementation comments; if interface docs leak implementation, the class is shallow.
5. For cross-module decisions, find one central place (or a `designNotes` file) and reference it.

## Connects To
- **Ch 4**: interface comments define the abstraction; leaking implementation signals shallowness.
- **Ch 10**: good interface comments define errors out of existence (e.g. `Buffer::copy`).
- **Ch 12**: the "why" of comments; this chapter is the "how."
- **Ch 15**: writing these comments *first* makes them a design tool.
- **Ch 16**: keeping comments near code and de-duplicated so they stay accurate.
