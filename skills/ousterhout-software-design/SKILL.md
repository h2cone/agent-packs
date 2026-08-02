---
name: ousterhout-software-design
description: "Knowledge base from \"A Philosophy of Software Design, 2nd Edition\" by John K. Ousterhout. Use when applying Ousterhout's frameworks for managing complexity, deep modules, information hiding, strategic programming, comments, naming, and everyday software design decisions, or when studying/referencing the book's concepts."
---

<!-- argument-hint: [topic, framework name, or chapter number like ch04] -->

# A Philosophy of Software Design (2nd Edition)
**Author**: John K. Ousterhout (Stanford; creator of Tcl) | **Pages**: ~190 (210 PDF) | **Chapters**: 22 | **Generated**: 2026-08-02

## How to Use This Skill

- **Without arguments** - load the core frameworks below for reference.
- **With a topic** - ask about `complexity`, `deep modules`, `comments`, `errors`, `performance`, etc.; I find and read the relevant chapter file before answering.
- **With a chapter** - ask for `ch04` or "chapter 4"; I load that specific chapter summary.
- **Browse** - ask "what chapters do you have?" to see the full index.

When you ask about a topic not fully covered in Core Frameworks below, I read the relevant chapter file(s) before answering. For fast decisions, see [cheatsheet.md](cheatsheet.md) (the 16 principles + 14 red flags as decision rules).

---

## Core Frameworks & Mental Models

The book is about **one thing: complexity**. Complexity is anything that makes a system hard to understand and modify. Everything below is a lever against it.

**Complexity (the enemy).** Defined practically, not by size: C = Σ(cₚ × tₚ) - complexity of each part weighted by developer time spent there. Three symptoms: *change amplification* (one change touches many places), *cognitive load* (how much you must know), *unknown unknowns* (not obvious what to modify or what info you need - **the worst**). Two causes: *dependencies* (code not isolable) and *obscurity* (important info not obvious). Complexity is **incremental** - it accumulates in thousands of small chunks - so adopt **zero tolerance**. The positive goal is an *obvious* system. *(Ch 2, 18)*

**Strategic vs. tactical programming.** Tactical = "get it working now" (accumulates complexity); strategic = "produce a great design that also works" (invests continually). The **tactical tornado** ships fast and leaves wreckage. Invest ~10–20% of dev time continually (proactive + reactive); payback ~6–18 months; technical debt is mostly never repaid. *(Ch 3)*

**Modules should be deep.** Visualize a module as a rectangle: area = functionality, top edge = interface complexity. *Deep* = much functionality behind a simple interface. A simple interface matters more than a simple implementation. Interfaces have formal (code) and informal (comments) parts; informal is usually larger. An abstraction that omits *important* details is a **false abstraction**. Resist classitis. *(Ch 4)*

**Information hiding (and leakage).** Each module encapsulates design decisions invisible in its interface. The opposite - **information leakage**, a decision reflected in multiple modules - is a top red flag, often invisible (back-door leakage). Decompose around *knowledge*, not execution order (**temporal decomposition** is an anti-pattern). `private` ≠ hidden; getters/setters leak. Make the common case simple with defaults; "do the right thing without being asked." *(Ch 5)*

**General-purpose modules are deeper.** Over-specialization may be the single greatest cause of complexity. Make modules "somewhat general-purpose": functionality for today, interface not tied to today. Push specialization up (to callers) or down (to pluggable low-level modules). Eliminate special cases by designing the normal case to handle edges for free. *(Ch 6)*

**Different layer, different abstraction.** Each layer must earn its keep with a different abstraction. **Pass-through methods** (forward a similar signature, add nothing) and **decorators** signal confused responsibility - redistribute, expose, or merge. Same signatures are fine only for dispatchers and multiple implementations. Collect pass-through variables into a **context object**. *(Ch 7)*

**Pull complexity downward.** When a module has unavoidable, related complexity, absorb it internally rather than punting to many callers (a simple interface > a simple implementation). Avoid configuration parameters; auto-compute values and default them. Pull down only complexity that's related and simplifies elsewhere. *(Ch 8)*

**Define errors out of existence.** Exceptions are a major complexity source; reduce the *places* they're handled. Best: redefine semantics so the error can't occur. Else: **mask** low (TCP resends), **aggregate** high (one top-level handler), or **just crash** for unrecoverable, infrequent errors. Expose exceptions only when the info is genuinely needed outside. *(Ch 10)*

**Design it twice.** For each major decision, sketch ≥2 *radically different* alternatives; compare on ease-of-use for higher-level code first; choose, combine, or let the weaknesses drive a new design. Costs ~1–2 hrs for a class; hard for smart people to embrace, but the problems are just hard. *(Ch 11)*

**Comments are a design tool.** Comments capture what code can't and are *fundamental to abstraction* - without them, complexity isn't hidden. Describe the **non-obvious** (a first-time reader's view) at a *different* level than the code: lower for precision, higher for intuition; never repeat the code. **Write comments first** - a long/hard comment is a red flag (Hard to Describe) signaling a bad abstraction, not a writing problem. *(Ch 12, 13, 15)*

**Choosing names.** Names are abstraction: precise and consistent. Booleans are predicates; avoid generic nouns and type-encoding. If a name is **hard to pick**, the design may be muddy - let naming drive refactoring. *(Ch 14)*

**Decide what matters.** Structure around what matters; *minimize* what matters (and where it matters); *emphasize* it via prominence, repetition, centrality. Look for **leverage** - one decision that solves or clarifies many. "Good taste" = distinguishing important from unimportant; it underlies every other principle. *(Ch 21)*

> The author's own distillation: **16 design principles** and **14 red flags** are in [cheatsheet.md](cheatsheet.md) as decision rules.

---

## Chapter Index

| # | Title | Key Frameworks |
|---|-------|----------------|
| [ch01](chapters/ch01-introduction.md) | Introduction (It's All About Complexity) | Two approaches to complexity; continuous design; red flags |
| [ch02](chapters/ch02-nature-of-complexity.md) | The Nature of Complexity | 3 symptoms; 2 causes; incremental; zero tolerance; obvious |
| [ch03](chapters/ch03-working-code-isnt-enough.md) | Working Code Isn't Enough | Strategic vs tactical; tactical tornado; 10–20% investment; technical debt |
| [ch04](chapters/ch04-modules-should-be-deep.md) | Modules Should Be Deep | Interface/impl; formal/informal; abstraction; deep vs shallow; classitis |
| [ch05](chapters/ch05-information-hiding.md) | Information Hiding (and Leakage) | Hiding; leakage; temporal decomposition; defaults; overexposure |
| [ch06](chapters/ch06-general-purpose-modules.md) | General-Purpose Modules are Deeper | Somewhat-general; push specialization; eliminate special cases; false abstraction |
| [ch07](chapters/ch07-different-layer-different-abstraction.md) | Different Layer, Different Abstraction | Pass-through methods/variables; decorators; context object |
| [ch08](chapters/ch08-pull-complexity-downwards.md) | Pull Complexity Downwards | Simple interface > simple impl; avoid config params |
| [ch09](chapters/ch09-better-together-or-better-apart.md) | Better Together Or Better Apart? | Costs of subdivision; bring-together rules; split/join methods; depth > length |
| [ch10](chapters/ch10-define-errors-out-of-existence.md) | Define Errors Out of Existence | Mask; aggregate; just crash; exception promotion |
| [ch11](chapters/ch11-design-it-twice.md) | Design it Twice | Multiple alternatives; compare; weakness-driven redesign |
| [ch12](chapters/ch12-why-write-comments.md) | Why Write Comments? The Four Excuses | Comments capture code-can't; fundamental to abstraction; refutes excuses |
| [ch13](chapters/ch13-comments-describe-non-obvious.md) | Comments Describe the Non-Obvious | Precision vs intuition; interface vs implementation docs; cross-module |
| [ch14](chapters/ch14-choosing-names.md) | Choosing Names | Precision; consistency; avoid extra words; Hard to Pick Name |
| [ch15](chapters/ch15-write-the-comments-first.md) | Write The Comments First | Comments-first workflow; comments as design tool; Hard to Describe |
| [ch16](chapters/ch16-modifying-existing-code.md) | Modifying Existing Code | Stay strategic; comments near code & once; check diffs |
| [ch17](chapters/ch17-consistency.md) | Consistency | Cognitive leverage; document/enforce/when-in-Rome; invariants |
| [ch18](chapters/ch18-code-should-be-obvious.md) | Code Should be Obvious | Whitespace; avoid generic containers; design for reading |
| [ch19](chapters/ch19-software-trends.md) | Software Trends | Interface vs impl inheritance; agile/TDD critique; patterns; getters/setters |
| [ch20](chapters/ch20-designing-for-performance.md) | Designing for Performance | Awareness; measure; design around the critical path |
| [ch21](chapters/ch21-decide-what-matters.md) | Decide What Matters | Leverage; minimize; emphasize (prominence/repetition/centrality); good taste |
| [ch22](chapters/ch22-conclusion.md) | Conclusion | Complexity as the one thing; investment compounds; design is fun |

## Topic Index

- **Abstraction / false abstraction** -> ch04, ch06
- **Agile development** -> ch01, ch19
- **Caching / performance** -> ch20
- **Change amplification** -> ch02
- **Classitis / shallow modules** -> ch04, ch19
- **Cognitive load** -> ch02
- **Comments (design tool, first, non-obvious)** -> ch12, ch13, ch15, ch16
- **Complexity (definition, causes, symptoms)** -> ch02
- **Composition vs inheritance** -> ch19
- **Configuration parameters** -> ch08
- **Conjoined methods** -> ch09
- **Consistency / invariants** -> ch17
- **Context object** -> ch07
- **Cross-module decisions / designNotes** -> ch13, ch16
- **Decorators** -> ch07, ch19
- **Deep modules** -> ch04, ch06, ch08
- **Defaults / "do the right thing"** -> ch05
- **Dependencies** -> ch02, ch07
- **Design it twice** -> ch11, ch21
- **Design patterns** -> ch17, ch19
- **Device drivers** -> ch06
- **Errors (define out / mask / aggregate / crash)** -> ch10
- **Exception handling** -> ch10
- **General-purpose modules** -> ch06
- **Getters/setters** -> ch19
- **Information hiding / leakage** -> ch05
- **Inheritance (interface vs implementation)** -> ch19
- **Investment mindset / technical debt** -> ch03
- **Leverage / decide what matters** -> ch21
- **Modifying existing code** -> ch16
- **Modular design** -> ch04
- **Naming** -> ch14, ch18
- **Obscurity / obviousness** -> ch02, ch18
- **Overexposure** -> ch05
- **Pass-through methods/variables** -> ch07
- **Performance** -> ch20
- **Pull complexity downward** -> ch08, ch10
- **Red flags** -> ch01, ch02, ch05, ch07, ch09, ch13, ch14, ch15, ch18 (full list: cheatsheet.md)
- **Repetition** -> ch09
- **Special cases** -> ch06, ch10, ch20
- **Strategic vs tactical programming** -> ch03, ch16, ch19
- **Temporal decomposition** -> ch05
- **Test-driven development / unit tests** -> ch19
- **Together vs apart** -> ch09
- **Unknown unknowns** -> ch02
- **Waterfall model** -> ch01
- **Zero tolerance** -> ch02, ch03

## Supporting Files

- [glossary.md](glossary.md) - all key terms with definitions and chapter refs
- [patterns.md](patterns.md) - the book's reusable techniques (when/how/trade-offs)
- [cheatsheet.md](cheatsheet.md) - the 16 design principles + 14 red flags as decision rules, thresholds, and decision trees

## Scope & Limits

This skill covers the book's content only. It is conceptual/design guidance, not a coding library - combine it with project-specific tools for hands-on implementation. For topics beyond this book (e.g. specific algorithms, domain architectures), check related skills or ask the agent directly. The book's examples are in Java/C++; the principles apply to any language and to non-class modules (functions, subsystems, services).
