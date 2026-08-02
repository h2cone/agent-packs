# Chapter 21: Decide What Matters

## Core Idea
Separate **what matters** from what doesn't. Structure the system around what matters, **minimize** what matters (and where it matters), and **emphasize** what matters. Look for *leverage* - where one decision unlocks many. "Good taste" - distinguishing important from unimportant - is the core design skill, and it underlies almost every earlier chapter.

## Frameworks Introduced
- **Decide what matters**
  - When to use: at every design choice.
  - How: look for **leverage** - a solution/info that also solves many other problems or makes many things understandable (a general-purpose range `insert`/`delete` solves backspace, delete, and selection at once; an *invariant* predicts behavior in many situations). It's easier to see what matters with multiple options to compare (an instance of design-it-twice). If you can't tell, *make a hypothesis* ("I think X matters most"), commit to it, build, then learn why you were right or wrong.
- **Minimize what matters**
  - When to use: after identifying what matters.
  - How: make as little matter as possible - fewer construction parameters, sensible defaults; and fewer *places* where it matters. Information hidden in a module doesn't matter outside it; an exception handled low doesn't matter above; a config value the system auto-computes doesn't matter to administrators. Each module should solve its problem *completely*.
- **Emphasize what matters**
  - When to use: for the things that do matter.
  - How: three emphasis mechanisms - *prominence* (put important things where seen: interface docs, names, parameters of heavily-used methods), *repetition* (key ideas recur), *centrality* (the most important things sit at the heart and shape what's around them, e.g. an OS device-driver interface). De-emphasize what doesn't matter: hide it, make it infrequent, keep it from shaping structure. (Converse: if something is prominent, repeated, or structural, it *matters*.)
- **Two mistakes**
  1. *Treat too many things as important* -> unimportant things clutter the design, add cognitive load (methods with args irrelevant to most callers; Java I/O forcing the buffered/unbuffered distinction; shallow classes often result).
  2. *Fail to recognize something is important* -> important info hidden or functionality missing, forcing callers to recreate it; impedes productivity; creates unknown unknowns.
- **"Good taste"** = the ability to distinguish important from unimportant. It applies beyond software - to technical writing (a few key concepts up front, structure the rest around them) and to life.

## Key Concepts
- **Leverage point**: one decision/invariant that unlocks many solutions or makes much understandable.
- **Minimize then emphasize**: first shrink what matters, then make the remainder prominent.
- **Prominence / repetition / centrality**: the three emphasis levers.
- **Good taste**: the meta-skill that names what matters.
- **Complete module**: one that solves its problem fully rather than offloading decisions.

## Mental Models
- Every earlier principle is an instance of "decide what matters": abstractions expose what matters to users and hide the rest; names pick the few most informative words; performance design centers the critical path.
- When unsure what matters, hypothesize and learn - taste is built from feedback.
- Treating unimportant things as important is as damaging as missing the important ones.

## Anti-patterns
- **Over-exposing rarely-used concerns** to everyone (Java I/O buffering; constructor params most callers ignore).
- **Hiding important information/functionality** so callers must recreate it.
- **Failing to emphasize** what's central, leaving it as obscure as the incidental.
- **Letting unimportant details shape the system's structure.**

## Worked Example
- *Leverage*: a general-purpose text interface (`insert`/`delete` over ranges) handles backspace, delete-key, and selection deletion - one mechanism, many problems - vs. specialized `backspace()`/`delete()` methods that each solve one. An invariant ("the list always contains ≥1 entry") lets you reason about many situations from one fact.
- *Minimize*: provide defaults so most callers never specify a value; auto-compute config; handle exceptions at the lowest level that can.
- *Emphasize*: an OS device-driver interface is *central* - hundreds of drivers depend on it, so it shapes everything around it and must be prominent.
- *Two mistakes*: Java I/O made *buffering* (almost always wanted, rarely important to specify) a caller concern -> shallow, over-exposed. Conversely, hiding important functionality forces every caller to reimplement it -> unknown unknowns.
- *Naming as leverage/taste*: list the words relating to a variable, pick the most informative few (design-it-twice applied to names).

## Key Takeaways
1. Structure systems around what matters; minimize and hide what doesn't.
2. Look for leverage - one decision that solves or clarifies many things.
3. Emphasize what matters via prominence, repetition, and centrality.
4. Two failure modes: treating too much as important, or missing what is important.
5. "Good taste" - discerning the important from the unimportant - is the core of design.

## Connects To
- **Ch 4/5**: abstraction and information hiding are literally "expose what matters, hide what doesn't."
- **Ch 8/10**: pull complexity down and mask exceptions to *minimize what matters* outside a module.
- **Ch 14**: a name emphasizes the aspects of a variable that matter most.
- **Ch 20**: design around the critical path = make performance matter in the right place.
