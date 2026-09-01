---
name: effective-go
description: "Knowledge base from \"Effective Go\" by The Go Authors, plus a 1.18–1.22 syntax/stdlib supplement. Use when writing idiomatic Go: formatting, naming, control structures, functions, data, concurrency, errors, embedding; or when choosing modern replacements (any, errors.Is, slices, range-over-int, loopvar, ServeMux patterns)."
---

<!-- argument-hint: [topic, framework name, or chapter number] -->

# Effective Go
**Author**: The Go Authors (Go team) | **Length**: ~33 pages / ~16.5k words | **Sections**: 17 | **Generated**: 2026-08-06

> Source: go.dev/doc/effective_go. The chapters distill the 2009 document (core language, not generics/modules). [references/modern.md](references/modern.md) covers the 1.18–1.22 syntax and stdlib that agents otherwise emit from outdated training data.

## How to Use This Skill

- **Writing or editing Go** - read [references/modern.md](references/modern.md) first. Apply every rule whose **Since** is ≤ the module `go` line. Those rules win over older snippets in the chapters.
- **Without arguments** - load core frameworks below. Do **not** load all 17 chapters.
- **With a topic** - ask about `slices`, `channels`, `interfaces`, `defer`, etc.; load only the matching chapter (and modern.md when the topic is syntax/stdlib).
- **With a chapter** - ask for `ch09` (Data) or `ch15` (Concurrency); load that chapter file.
- **Browse** - ask "what chapters do you have?" to see the full index.

When you ask about a topic not in Core Frameworks below, I read the relevant chapter file before answering.

---

## Core Frameworks & Mental Models

**Share memory by communicating.** Go's slogan: *"Do not communicate by sharing memory; instead, share memory by communicating."* Pass shared values on channels; only one goroutine owns a value at a time, so data races can't occur by design. Prefer this over mutex-guarded variables; reserve mutexes for cases like reference counts. (Ch 15)

**`gofmt` is the single source of truth for formatting.** Never hand-align; run `gofmt` (file) or `go fmt` (package). Tabs indent; no line-length limit; no parentheses on `if`/`for`/`switch`. If `gofmt`'s output looks wrong, restructure the code - don't work around it. (Ch 3)

**Capitalization *is* visibility.** First letter upper-case = exported; lower-case = package-private. This is semantic, not stylistic. (Ch 5)

**Name for how it reads at the call site.** Package names: lower-case, single word, match the directory base, favor brevity. Don't stutter - `bufio.Reader` not `BufReader`; `ring.New` when one exported type; `once.Do(setup)` not `DoOrWaitUntilDone`. Getters drop `Get` (`Owner` for field `owner`); setters use `Set` (`SetOwner`). One-method interfaces are `method`+`-er` (`Reader`, `Writer`); reuse canonical names/signatures (`String`, not `ToString`). Use `MixedCaps`, never underscores. (Ch 5)

**Keep the happy path down the page.** `if`/`switch` take an init statement (`if err := f(); err != nil`). When a guard body ends in `return`/`break`/`continue`, *drop the `else`* - eliminate error cases as they arise. `:=` lets one `err` flow through a chain of guards in the same scope. (Ch 7)

**`for` is the only loop; `switch` is a condition ladder.** `for init; cond; post {}` / `for cond {}` / `for {}`. On Go 1.22+, `for i := range n` replaces `for i := 0; i < n; i++`. `range` also iterates collections and decodes strings to runes; drop the second value for key-only, use `_` for value-only. Loop variables are per-iteration as of 1.22 — do not copy `v := v` before a goroutine. `switch {}` (no expression) switches on `true` - the idiomatic `if-else-if`. No fallthrough; comma-separated cases. Label a loop and `break Loop` to exit it from inside a `switch`. Type switch: `switch t := x.(type)` on `any`, not `interface{}`. (Ch 7, modern.md)

**Multiple returns replace in-band errors and out-params.** Return `(value, error)`. Named result parameters document the return and enable naked `return`. (Ch 8)

**`defer` guarantees cleanup.** `defer f.Close()` right after `os.Open` - never forgets a close on any return path, and keeps release next to acquire. Deferred args evaluate at the `defer`; calls run LIFO. It's function-scoped, not block-scoped - that's its power. (Ch 8)

**`new` zeros and returns a pointer; `make` initializes and returns a value.** `make` is for slices/maps/channels only. Design types whose *zero value is usable* (`bytes.Buffer`, `sync.Mutex`) - it composes transitively. Construct with composite literals (`&File{fd: fd}`; `&File{}` == `new(File)`). Prefer slices over arrays. `append` returns a (possibly reallocated) slice - **always reassign** (`x = append(x, ...)`). Map lookups return the zero value for missing keys; use the comma-ok idiom when absence matters. (Ch 9)

**Master `fmt` and avoid the `String()` recursion trap.** `%v`/`%+v`/`%#v`/`%T`/`%q`; define `String() string` (the `Stringer` interface) to control formatting. A `String()` that calls `Sprintf("%s", m)` on the same string-like type recurses forever - convert to `string` first or use a non-string verb. (Ch 9, 10)

**`iota` generates constant families; `init` verifies/registers.** `const ( _ = iota; KB = 1<<(10*iota); MB ... )`. `init` runs after vars and imports - use it for sanity checks and registration. (Ch 10)

**Pointer receiver to mutate or satisfy interfaces.** Value methods run on values and pointers; pointer methods run only on pointers (the compiler auto-takes the address of addressable values). A `*T` receiver is how `*ByteSlice` satisfies `io.Writer`. (Ch 11)

**Interfaces are implicit, small, and capability-shaped.** A type satisfies an interface by implementing its methods - no `implements`. Convert between same-underlying types to reuse method sets (no copy). Type-assert with comma-ok (`v, ok := x.(T)`); never bare. When a type only implements an interface, export the interface and return it from the constructor. Any type with methods - struct, int, channel, function - can satisfy one; `http.HandlerFunc(f)` adapts a function into an `http.Handler`. (Ch 12)

**`_` makes intent explicit.** Discard unwanted returns, do presence-only map checks, silence unused decls temporarily, import for side effects (`import _ "pkg"`), and enforce conformance at compile time (`var _ I = (*T)(nil)`). Never use it to discard an error. (Ch 13)

**Embedding is composition, not inheritance.** Embed a type to promote its methods and satisfy interfaces for free (`io.ReadWriter` = `Reader` + `Writer`; `bufio.ReadWriter` embeds `*Reader`/`*Writer`). The promoted method's receiver is the *inner* type - no virtual dispatch. Reach in via the type name to refine. (Ch 14)

**Channels synchronize; buffered channels limit throughput.** Unbuffered = synchronous handshake. `make(chan int, N)` is a semaphore of capacity N. Gate goroutine *creation* (or use a fixed pool) to bound resources - don't just limit running count. Channels are first-class - embed a reply channel for parallel demux. `select`/`default` gives non-blocking ops (leaky-buffer free lists). Concurrency (structure) ≠ parallelism (speed). (Ch 15)

**Return descriptive `error`s; reserve `panic` for the unrecoverable.** Implement `error` with a richer struct (`PathError{Op, Path, Err}`) when callers may inspect cause. Inspect with `errors.Is` / `errors.As` (wrap with `%w`); do not use `err == target` or a bare type-assert on a wrapped error. `recover` works only in deferred functions - isolate failing goroutines or convert internal panics to errors at the package boundary. Never expose panics to clients. (Ch 16, modern.md)

---

## Chapter Index

| # | Title | Key Frameworks |
|---|-------|----------------|
| [ch01](chapters/ch01-introduction.md) | Introduction | Think from a Go perspective, not by translation |
| [ch02](chapters/ch02-examples.md) | Examples | Standard library as reference implementation |
| [ch03](chapters/ch03-formatting.md) | Formatting | `gofmt`, tabs, no line limit, no parens |
| [ch04](chapters/ch04-commentary.md) | Commentary | `//` vs `/* */`, doc comments precede decl |
| [ch05](chapters/ch05-names.md) | Names | Capitalization=visibility, no stutter, `Owner` not `GetOwner`, `-er` interfaces, MixedCaps |
| [ch06](chapters/ch06-semicolons.md) | Semicolons | Automatic insertion, brace-on-same-line |
| [ch07](chapters/ch07-control-structures.md) | Control structures | `if`-init, omit `else`, `for`/`range`/`range n`, `switch{}`, type switch, labeled break |
| [ch08](chapters/ch08-functions.md) | Functions | Multiple returns, named results, `defer` |
| [ch09](chapters/ch09-data.md) | Data | `new`/`make`, composite literals, slices, `append`, maps, comma-ok, `fmt`, Stringer |
| [ch10](chapters/ch10-initialization.md) | Initialization | Constants, `iota`, runtime `var`, `init` |
| [ch11](chapters/ch11-methods.md) | Methods | Pointer vs value receiver, methods on any named type |
| [ch12](chapters/ch12-interfaces.md) | Interfaces | Implicit satisfaction, conversion, type switch/assertion, `HandlerFunc` |
| [ch13](chapters/ch13-blank-identifier.md) | The blank identifier | Discard returns, side-effect import, compile-time interface check |
| [ch14](chapters/ch14-embedding.md) | Embedding | Interface/struct embedding, method promotion, not subclassing |
| [ch15](chapters/ch15-concurrency.md) | Concurrency | Share by communicating, goroutines, channels, semaphore, fixed pool, leaky buffer |
| [ch16](chapters/ch16-errors.md) | Errors | `error` interface, `PathError`, `errors.Is`/`As`, `panic`/`recover`, panic-to-error boundary |
| [ch17](chapters/ch17-web-server.md) | A web server | `flag`, ServeMux patterns, `HandlerFunc`, `ListenAndServe`, `template.Must` |

## Topic Index

- **append** -> ch09
- **blank identifier (`_`)** -> ch07, ch09, ch10, ch13
- **buffered channel / semaphore** -> ch15
- **channel** -> ch15
- **comma-ok idiom** -> ch09, ch12
- **composite literal** -> ch09
- **concurrency vs parallelism** -> ch15
- **constant / iota** -> ch10
- **conversion** -> ch12
- **defer** -> ch08, ch16
- **doc comment** -> ch04
- **embedding** -> ch14
- **error** -> ch16, [modern.md](references/modern.md)
- **errors.Is / errors.As** -> [modern.md](references/modern.md)
- **exported / capitalization** -> ch05
- **fmt verbs** -> ch09
- **for / range / range-over-int** -> ch07, [modern.md](references/modern.md)
- **function literal / closure** -> ch15
- **getter** -> ch05
- **gofmt** -> ch03
- **goroutine** -> ch15
- **Handler / HandlerFunc / ServeMux patterns** -> ch12, ch17, [modern.md](references/modern.md)
- **loopvar (1.22 per-iteration)** -> ch07, ch15, [modern.md](references/modern.md)
- **if (init, omit else)** -> ch07
- **init function** -> ch10
- **interface** -> ch12
- **make vs new** -> ch09
- **map** -> ch09
- **method (pointer/value receiver)** -> ch11
- **MixedCaps** -> ch05
- **multiple return values** -> ch08
- **named results / naked return** -> ch08
- **panic / recover** -> ch16
- **package names** -> ch05
- **rune** -> ch07, ch09
- **select** -> ch15
- **semicolons** -> ch06
- **slice / slices.Contains** -> ch09, [modern.md](references/modern.md)
- **Stringer** -> ch09
- **switch (on true / type switch)** -> ch07, ch12
- **type assertion** -> ch12, ch16
- **zero value** -> ch09, ch10

## Supporting Files

- [references/modern.md](references/modern.md) - 1.18–1.22 emit rules (`any`, `errors.Is`, `slices`, `range n`, loopvar, ServeMux)
- [glossary.md](glossary.md) - all key terms with definitions
- [patterns.md](patterns.md) - all techniques and idioms, by situation
- [cheatsheet.md](cheatsheet.md) - decision rules, quick tables, and tells

---

## Scope & Limits

Chapters cover *Effective Go* - how to think, name, and structure Go as of the 2009 document. [references/modern.md](references/modern.md) covers the small 1.18–1.22 set that agents otherwise generate from outdated training data. This skill still does **not** cover generics-as-language (constraints, type sets), module authoring, slog, iterators, or anything 1.23+. Honor the module `go` line: do not emit APIs newer than it. For hands-on work, use this skill alongside the project's own conventions.
