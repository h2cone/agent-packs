# Chapter 7: Different Layer, Different Abstraction

## Core Idea
In a well-designed system each layer provides a *different* abstraction from the layers above and below. Adjacent layers with similar abstractions - **pass-through methods**, **decorators**, **pass-through variables** - are a red flag: the infrastructure isn't earning its complexity.

## Frameworks Introduced
- **Different layer, different abstraction**
  - When to use: reviewing a layered design.
  - How: follow one operation up and down the layers; the abstraction should change at each call. If two adjacent layers expose the same abstraction, one layer probably isn't paying for itself.
- **Pass-through methods** (red flag)
  - When to use: when a method just forwards to another with a similar/identical signature.
  - How: they add interface complexity and inter-class dependencies without adding functionality → indicates confused division of responsibility. Fixes (Fig 7.1): (b) expose the lower class directly and drop the responsibility; (c) redistribute functionality between the classes; (d) merge the classes.
- **When interface duplication is OK**
  - *Dispatchers*: a method that selects among same-signature methods - contributes the *choice* functionality.
  - *Multiple implementations of one interface* (e.g. disk drivers): each provides distinct functionality; same signature *reduces* cognitive load. These sit in the same layer and don't call each other.
- **Decorators (wrappers)**
  - When to use: cautiously; they tend to be shallow and full of pass-through methods.
  - How: a decorator extends an object with a similar/identical API. Overuse → explosion of shallow classes (e.g. Java I/O's `BufferedInputStream`). Before creating one, ask: add the feature to the underlying class? merge with the use case? merge with an existing decorator? implement standalone? Wrappers are mainly justified when adapting an unmodifiable external class to a different interface.
- **Interface ≠ implementation**: a class's internal representation should differ from its interface abstraction; if they match, the class is probably shallow (e.g. line-stored text exposed via line-oriented `getLine`/`putLine` → shallow; a character-oriented `insert`/`delete` over line storage → deep).
- **Pass-through variables & the context object**
  - When to use: a value threaded through many methods that don't use it.
  - How: options are (a) find an already-shared object to hold it, (b) global variable (creates instance/test problems), (c) **context object** holding all system-global state, one per system instance, referenced by major objects so it appears only in constructors. Contexts unify global state and ease testing but share globals' downsides - keep context vars immutable to avoid thread-safety issues.

## Key Concepts
- **Net-complexity test**: every design element (interface, argument, class) must eliminate *more* complexity than it adds, or omit it.
- **Dispatcher**: legitimate same-signature forwarding because it adds selection logic.
- **Context object**: the least-bad solution to pass-through variables.

## Mental Models
- "Does this layer earn its keep?" - if it forwards without transforming, fold it away.
- Prefer merging a feature into the underlying class when nearly everyone uses both (e.g. buffering into `InputStream`).
- A variable that passes through layers it doesn't touch is a smell; collect such values into a context.

## Anti-patterns
- **Pass-through method**: forwards a similar signature, adds nothing.
- **Decorator explosion**: many shallow wrapper classes.
- **Pass-through variable**: threaded through methods that ignore it.
- **Interface mirroring implementation**: same abstraction inside and out → shallow class.
- **Undisciplined context**: a grab-bag creating nonobvious dependencies.

## Worked Example
A student `TextDocument` class where 13 of 15 public methods were pass-throughs to `TextArea` (`getLastTypedCharacter`, `getCursorOffset`, `insertString`, ...) - the class added almost no functionality and created a signature-change dependency on `TextArea`. Refactor: redistribute methods and collapse `TextDocument`/`TextArea`/`TextDocumentListener` into two classes with distinct responsibilities. Contrast: Java's `BufferedInputStream` decorator wraps `InputStream` with the same API just to add buffering that almost everyone wants - it should have been merged into `InputStream`. And a `cert` argument threaded from `main` through `m1`, `m2` to `m3` (which actually needs it) becomes a **context object** storing certs, timeouts, and counters, referenced only via constructors.

## Key Takeaways
1. Each layer must offer a different abstraction; similar adjacent layers don't earn their complexity.
2. Pass-through methods signal confused responsibility - redistribute, expose, or merge.
3. Same signatures are fine only when each method adds functionality (dispatchers, multiple implementations).
4. Be skeptical of decorators; prefer folding general features into the underlying class.
5. Collect pass-through variables into a context object rather than threading them everywhere.

## Connects To
- **Ch 4**: pass-throughs and shallow decorators make modules shallow.
- **Ch 6**: separate general-purpose from special-purpose code (decorators often violate this).
- **Ch 8**: an alternative to leaking complexity upward is pulling it downward.
- **Ch 19**: critical take on design patterns (decorators) and getters/setters.
