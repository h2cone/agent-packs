# Chapter 6: General-Purpose Modules are Deeper

## Core Idea
Over-specialization may be the single greatest cause of complexity. Make modules **"somewhat general-purpose"**: the *functionality* reflects your current needs, but the *interface* does not tie to them. Generality yields deeper modules, better information hiding, and - counterintuitively - less code.

## Frameworks Introduced
- **"Somewhat general-purpose" sweet spot**
  - When to use: designing any new class/module.
  - How: functionality covers current needs, but the interface is general enough for multiple uses and easy for today's needs without being tied to them. "Somewhat" matters - don't build something so general it's hard to use now. General-purpose interfaces turn out simpler, deeper, *and* shorter than special-purpose ones - even with no reuse.
- **Generality ⇒ better information hiding**
  - When to use: separating a module from its callers.
  - How: a general interface (e.g. `insert`/`delete` at a `Position`) keeps caller-specific concepts (e.g. the backspace key) out of the module; new caller features need no new module methods. The special-purpose `backspace()` method is a **false abstraction** - it pretends to hide which chars are deleted, but the caller actually needs to know.
- **Push specialization upwards (and downwards)**
  - When to use: when specialization can't be eliminated.
  - How: *Upwards* - push special-purpose logic into top-level/caller classes, leaving lower layers general (e.g. UI key behavior stays in the UI, not the text class). *Downwards* - push specialization into pluggable low-level modules behind a general interface (e.g. device drivers implementing "read/write a block" so the OS core stays device-agnostic).
- **Separate general-purpose from special-purpose code** (for a given mechanism): e.g. extract the general undo-history mechanism into a `History` class; keep special-purpose "undo a text insertion" handlers in the modules that own those actions.
- **Eliminate special cases in code**
  - When to use: when method bodies sprout `if`s for edge cases.
  - How: design the normal case so it handles edge conditions with no extra code (e.g. represent "no selection" as an *empty* selection whose start==end; copy/delete then work without a special-case check).

## Key Concepts
- **Three self-check questions** for an interface:
  1. What is the *simplest* interface covering all current needs? (Fewer methods without losing capability ⇒ more general.)
  2. In how many situations will this method be used? (One situation ⇒ too special-purpose.)
  3. Is this API easy to use for my current needs? (Needing lots of glue code ⇒ gone too general.)
- **Dispatcher / multiple-implementations** are *not* over-specialization - same signature is fine when each provides distinct functionality.
- **Special case**: a form of specialization inside method bodies, eliminated by design, not by `if`.

## Mental Models
- Specialization breeds complexity; generality breeds simplicity - invert the instinct to "build exactly what I need today."
- Reducing the number of methods *without reducing capability* is a sign you're generalizing correctly.
- Design the normal path so edge cases fall out for free.

## Anti-patterns
- **Special-purpose methods tied to one caller feature** (e.g. `backspace(Cursor)`) - shallow, leaky, false abstractions.
- **Special-General Mixture** (red flag): special-purpose code not cleanly separated from general-purpose code.
- **Too-general API**: e.g. single-character `insert`/`delete` forcing callers into loops - simple and general but not usable/efficient.
- **Special cases handled with `if` ladders** instead of unified normal-case design.

## Worked Example
The GUI text editor's text class, redesigned three ways:
1. *Specialized*: `backspace(Cursor)`, `delete(Cursor)`, `deleteSelection(Selection)` - tied to UI keys, a false abstraction, leakage between UI and text class, many shallow single-use methods.
2. *General-purpose*: `insert(Position, String)`, `delete(Position start, Position end)`, `changePosition(Position, int)` - the backspace key becomes `text.delete(text.changePosition(cursor,-1), cursor)`. Slightly longer per call but more obvious, less code overall, reusable beyond an editor.
3. *Undo mechanism*: students crammed the general action-list manager *and* special-purpose handlers (text, selection, cursor) into the text class → leakage. Fix: a `History` class manages a list of `Action` objects (`redo()`/`undo()`); each action type lives in the module that owns it; grouping policy lives in high-level UI code. Three concerns, three homes, each independent.
Also: the "no selection" special case eliminated by always having a selection (empty when start==end).

## Key Takeaways
1. Make modules somewhat general-purpose: functionality for today, interface for many uses.
2. Generality improves information hiding and *reduces* total code.
3. Push specialization up to callers or down to pluggable low-level modules.
4. Separate general-purpose from special-purpose code for each mechanism.
5. Eliminate special cases by designing the normal case to handle edges for free.

## Connects To
- **Ch 4**: general-purpose modules are deeper.
- **Ch 5**: generality hides more information.
- **Ch 7**: each layer should offer a different (general) abstraction.
- **Ch 10**: defining errors out of existence eliminates special cases.
- **Ch 20**: eliminating special cases can also improve performance.
