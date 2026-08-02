# Chapter 19: Software Trends

## Core Idea
Evaluate every development trend by one test: does it actually *minimize complexity* in large systems? OOP/inheritance, agile, unit tests, TDD, design patterns, and getters/setters each offer leverage - and each has a failure mode that, unchecked, makes complexity worse.

## Frameworks Introduced
- **OOP & inheritance** (two forms)
  - *Interface inheritance* (parent defines signatures, subclasses implement): good - reuses one interface for many purposes; more implementations ⇒ deeper interface ⇒ better abstraction.
  - *Implementation inheritance* (parent provides default implementations subclasses override): use with caution - it creates parent/subclass *dependencies* and *information leakage* (shared instance variables); changing a parent may require inspecting every subclass. Prefer **composition** (small helper classes) where possible; if you must use it, separate state managed by the parent from subclass state (subclasses touch parent vars read-only or via parent methods). OOP mechanisms don't *guarantee* good design.
- **Agile development**: its incremental/iterative nature matches this book's philosophy (design can't be fully visualized up front). *Risk*: it can slide into tactical programming - focusing on features, deferring design, building minimal special-purpose mechanisms to "refactor later." **The increments of development should be abstractions, not features.** Once an abstraction is needed, design it cleanly (somewhat general-purpose) all at once.
- **Unit tests**: valuable because they *facilitate refactoring* - without a good test suite, developers avoid structural changes, so complexity accumulates and design mistakes go uncorrected. Unit tests give higher coverage than system tests. (Tcl's interpreter→bytecode-compiler rewrite was validated by unit tests; only one bug surfaced after alpha.)
- **Test-driven development**: Ousterhout is *not* a fan - it focuses attention on getting features working (tactical), is too incremental, and offers no natural moment for design, so "it's easy to end up with a mess." Write tests *first* only when fixing a bug (a failing test that the fix makes pass proves the fix).
- **Design patterns**: good when they genuinely fit (hard to beat a clean, well-known solution). Greatest risk is **over-application** - forcing a problem into a pattern when a custom approach is cleaner. More patterns ≠ better.
- **Getters/setters**: expose instance variables ⇒ violate information hiding and add shallow (one-line) methods that clutter the interface. Better not to expose implementation data at all; if you must, getters/setters are the least-bad way, but their overuse in Java is a cautionary tale about pattern over-application.
- **Conclusion**: challenge every paradigm - "does it really help minimize complexity?" Some sound good but make it worse.

## Key Concepts
- **Interface vs. implementation inheritance**: the former adds depth; the latter adds dependencies.
- **Composition over implementation inheritance**: share functionality via helper classes, not inheritance.
- **Abstractions as increments**: develop abstraction-by-abstraction, not feature-by-feature.
- **Tests enable refactoring**: the design value of tests is structural freedom, not just correctness.
- **Over-application**: the recurring failure mode of every "good idea" trend.

## Mental Models
- "More of a good thing isn't better" - patterns, getters/setters, and OOP all over-apply.
- Tests buy you the freedom to refactor; without them, fear freezes the design.
- Develop in *abstraction*-sized increments, not feature-sized ones.

## Anti-patterns
- **Deep implementation-inheritance hierarchies** with shared mutable state across levels.
- **Tactical agile/TDD**: build the smallest thing that passes, defer all design.
- **Forcing a design pattern** where a custom design is cleaner.
- **Getters/setters for every field**, exposing implementation and bloating interfaces.

## Worked Example
- *Implementation inheritance leakage*: a parent class's instance variables accessed by both parent and subclasses mean a change to the parent can break any subclass - the developer may need full knowledge of the hierarchy to change one class. Composition (each class built on small helpers) avoids this.
- *Tests enabling refactoring*: the Tcl byte-code compiler rewrite touched almost the entire core engine, yet the existing unit suite found so many bugs that only one escaped to alpha - the tests made a scary refactor safe.
- *TDD's trap*: "at any point it's tempting to just hack in the next feature to make the next test pass... there's no obvious time to do design."
- *Getter/setter bloat*: one-line `getFoo`/`setFoo` for fields that didn't need exposing, adding interface clutter with no functionality.

## Key Takeaways
1. Judge every trend by whether it truly minimizes complexity.
2. Interface inheritance is good; prefer composition over implementation inheritance.
3. Develop in abstraction-sized increments; agile/TDD risk tactical sprawl.
4. Unit tests' design value is enabling refactoring; TDD is optional (write tests first only for bug fixes).
5. Design patterns and getters/setters are good only when they fit - beware over-application.

## Connects To
- **Ch 2**: the test for any trend is reducing complexity and its symptoms.
- **Ch 4/5**: implementation inheritance leaks information; composition preserves hiding.
- **Ch 6**: abstractions (not features) are the right increment of development.
- **Ch 16**: tests make strategic refactoring safe when modifying code.
