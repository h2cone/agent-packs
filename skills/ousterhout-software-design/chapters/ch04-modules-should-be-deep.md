# Chapter 4: Modules Should Be Deep

## Core Idea
Manage complexity with **modular design**: each module has an interface (what callers must know) and an implementation (the code). The best modules are **deep** - much functionality behind a simple interface. Visualize each module as a rectangle whose area is functionality and whose top edge is interface complexity; maximize depth.

## Frameworks Introduced
- **Modular design (interface + implementation)**
  - When to use: any unit of code with an interface (class, method, subsystem, service).
  - How: minimize dependencies between modules; a developer working in a module understands its interface+implementation plus only the *interfaces* of modules it calls.
- **Formal vs. informal interface**
  - *Formal*: explicitly in code, partly compiler-checkable (signatures, types, thrown exceptions).
  - *Informal*: high-level behavior, usage constraints/ordering - expressible only in comments; usually *larger and more complex* than the formal part. A clear informal interface kills unknown unknowns.
- **Abstraction (and false abstraction)**
  - When to use: whenever you expose an interface.
  - How: a simplified view omitting *unimportant* details. Goes wrong two ways: includes unimportant details (bloats cognitive load) or omits important ones (**false abstraction** → obscurity). The art is knowing what is important.
- **Deep vs. shallow modules (rectangle metaphor)**
  - *Deep*: powerful functionality, simple interface (e.g. Unix I/O).
  - *Shallow*: complex interface, little functionality - hides little complexity.
- **Classitis**: over-decomposition into many shallow classes; the false belief that more/smaller classes are always better.

## Key Concepts
- **Module**: any unit of code with an interface and implementation - a class, a method/function, a subsystem, or a service.
- **Interface complexity** ≈ the length of the rectangle's top edge; the goal is small interface, large implementation.
- A simple interface (a) minimizes complexity imposed on the rest of the system and (b) leaves many aspects free to change without affecting other modules.
- The informal aspects of an interface are where most documentation effort belongs.

## Mental Models
- Draw the rectangle: area = functionality, top edge = interface. Deep = tall; shallow = wide and thin. Refactor toward tall.
- If a module's interface is barely simpler than its implementation, it's shallow - ask what complexity it actually hides.
- When details are *important*, don't hide them behind an interface - make them explicit (prevents false abstraction).

## Anti-patterns
- **Shallow module**: interface nearly as complex as implementation (red flag).
- **Classitis**: splitting code into many shallow classes that leak information to each other.
- **False abstraction**: an interface that looks simple by omitting details callers actually need.

## Worked Example
Two I/O designs contrasted. **Unix I/O is deep**: five basic system calls (`open`, `read`, `write`, `lseek`, `close`) hide an enormous machinery of disk scheduling, block layout, caching, and device drivers - callers never see it. **Java's `FileInputStream` + `BufferedInputStream` is shallow/awkward**: it forces callers to know about and explicitly request buffering, even though buffering is almost always wanted - a classic case of classitis where the decorator adds boilerplate for little hidden complexity. (Also: a balanced-tree module whose `insert(key, value)` hides all rebalancing traversal/splitting - deep.)

## Key Takeaways
1. Every module = interface (what callers must know) + implementation.
2. Interfaces have formal (code) and informal (comments) parts; informal is usually the bigger one.
3. Best modules are deep: lots of functionality, simple interface.
4. Abstractions must omit only *unimportant* details; omitting important ones is a false abstraction.
5. Resist classitis - more classes isn't automatically better.

## Connects To
- **Ch 5**: information hiding is *how* you make modules deep.
- **Ch 6**: general-purpose modules tend to be deeper.
- **Ch 7**: pass-through methods make modules shallow.
- **Ch 9**: when it *is* right to split modules apart.
