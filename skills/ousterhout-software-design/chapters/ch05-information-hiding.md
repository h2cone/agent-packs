# Chapter 5: Information Hiding (and Leakage)

## Core Idea
Each module should **encapsulate** a few design decisions so they don't appear in its interface (**information hiding**, Parnas). The opposite - **information leakage**, a design decision reflected in multiple modules - is one of the most important red flags, even when interfaces look clean. Decompose around *knowledge*, not around execution order.

## Frameworks Introduced
- **Information hiding**
  - When to use: designing any module.
  - How: embed design decisions (mechanisms, data structures, algorithms, even assumptions like "most files are small") in the implementation, invisible in the interface. Reduces complexity two ways: simpler interface (less cognitive load) and easier evolution (changes touch one module). *Note: `private` fields ≠ hidden - getters/setters can leak just as much.*
- **Information leakage**
  - When to use: reviewing a decomposition.
  - How: a design decision appears in multiple modules → a dependency; changing it forces changes everywhere. **Back-door leakage** (knowledge shared without appearing in any interface, e.g. two classes both knowing a file format) is worse because it's invisible. Fixes: merge the affected classes, or extract the knowledge into one new class with a simple abstracting interface.
- **Temporal decomposition** (anti-pattern)
  - When to use: spot it when module structure mirrors runtime order ("first read, then parse, then write").
  - How: structure follows the order operations occur; the same knowledge (e.g. a file format) is encoded in each phase → leakage. Instead, design modules around the *knowledge* needed, not the order tasks occur.
- **Partial information hiding / defaults**
  - When to use: features only a few callers need, or common-case values.
  - How: separate methods keep rarely-needed info out of common paths; defaults "do the right thing" so callers needn't know a value exists (e.g. HTTP version, Date header, buffering). The best features are the ones you get without knowing they exist.
- **Information hiding within a class**: design private methods to each encapsulate something; minimize the number of places each instance variable is used.

## Key Concepts
- **Design decision** as the unit of encapsulation: what knowledge should live in exactly one place.
- **Overexposure** (red flag): an API forces callers to learn rarely-used features to use common ones.
- **Common-case simplicity**: design interfaces so the most common usage is simplest.
- **Taking it too far**: hide only information *not needed outside* the module; if callers must tune it (e.g. perf config), expose it.

## Mental Models
- Ask, when splitting modules: "How can I reorganize so this knowledge affects a single class?"
- Don't let execution order dictate module structure - let *knowledge* dictate it.
- Prefer `getParameter(name)` (hides internal representation) over `getParams()` returning the internal `Map` (leaks it).

## Anti-patterns
- **Information leakage**: same knowledge in multiple modules (worst red flag).
- **Temporal decomposition**: structure mirrors time order.
- **Overexposure**: forcing awareness of rare features to reach common ones.
- **Hiding information callers actually need**: creates a false abstraction / obscurity.

## Worked Example
Student HTTP-server projects illustrated several traps and fixes:
1. **Temporal decomposition** split "read request" and "parse request" into two classes - but an HTTP request can't be read without parsing (e.g. `Content-Length` determines body length), so both classes duplicated parsing knowledge. Fix: merge into one class that owns the request format; one method instead of two.
2. **Overexposure**: `getParams()` returned the internal `Map`, exposing representation and forcing two-step calls (and a "don't modify this" rule). Fix: `getParameter(String)` / `getIntParameter(String)` hide the representation and fold in conversion.
3. **Defaults**: a team required callers to specify the HTTP response version explicitly, but it must match the request - leakage. Fix: the library supplies the version (and Date) automatically; the common case needs no knowledge of them.

## Key Takeaways
1. Encapsulate each design decision in one module; keep it out of interfaces.
2. Information leakage - even invisible back-door leakage - is a top red flag.
3. Don't decompose by execution order (temporal decomposition); decompose by knowledge.
4. `private` ≠ hidden; getters/setters can leak.
5. Make the common case simple with defaults; hide rarely-needed features on separate paths.

## Connects To
- **Ch 4**: hiding more information makes a module deeper.
- **Ch 6**: general-purpose interfaces hide more.
- **Ch 9**: when merging classes improves hiding (vs. when to split).
- **Ch 14**: vague names can leak design decisions.
