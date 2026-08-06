# Chapter 14: Embedding

## Core Idea
Go has no type-driven subclassing, but it supports **embedding** - listing a type within a struct or interface without a field name - to "borrow" an implementation. Embedded methods are promoted to the outer type, so composition satisfies interfaces for free. Crucially, embedding is *not* subclassing: when a promoted method runs, its receiver is the inner type, not the outer one.

## Frameworks Introduced
- **Interface embedding - compose interfaces**: Embed interfaces inside an interface to union their methods.
  - When to use: Defining an interface that combines others.
  - How: `type ReadWriter interface { Reader; Writer }` - only interfaces embed in interfaces. `io.ReadWriter` is exactly this.
- **Struct embedding - promote methods**: Embed a type (often a pointer) in a struct; its methods become methods of the outer struct, no forwarding boilerplate.
  - When to use: Composing capabilities (reader + writer) or borrowing a service (logger).
  - How: `type ReadWriter struct { *Reader; *Writer }` - `bufio.ReadWriter` now has `Read`/`Write` and satisfies `io.Reader`, `io.Writer`, and `io.ReadWriter`. Initialize embedded pointers to valid structs before use.
- **Embedding is not subclassing**: The promoted method's receiver is the inner type, not the outer.
  - When to use: Reasoning about what `self`/receiver a method sees.
  - How: Calling `bufio.ReadWriter.Read` runs `bufio.Reader.Read` with the inner `reader` as receiver - identical in effect to a hand-written forwarding method, but free.
- **Convenience embedding + refinement**: Embed a type to inherit its methods, then refer to it by its type name to override or refine.
  - When to use: Adding logging to a type, or wrapping an embedded method.
  - How: `type Job struct { Command string; *log.Logger }` gives `Job` `Print`/`Printf`/`Println`. Access the embed via `job.Logger`; override by defining a method on `*Job` that calls `job.Logger.Printf(...)`.

## Key Concepts
- **Name resolution - depth wins**: A field/method `X` at a shallower level hides any `X` deeper in the type.
- **Same-level conflict**: The same name at the same nesting level is usually an error - *unless* it's never referenced, in which case it's allowed (protects against upstream additions).
- **Embedded field name = type name**: refer to an embedded field by its type name (minus package qualifier), e.g., `job.Logger`.

## Mental Models
- Think of embedding as "delegate for free": the outer type gains the inner type's methods without writing forwarding stubs.
- Think of the receiver as staying with the inner type - there's no `super` and no virtual dispatch; overrides are just a name-resolution preference.

## Anti-patterns
- **Writing forwarding methods that embedding already provides**: e.g., hand-rolled `func (rw *ReadWriter) Read(...) { return rw.reader.Read(...) }` - the embed does this.
- **Expecting subclassing semantics** (override-and-dispatch-to-child): the receiver is the inner type; overriding doesn't change what a borrowed method calls.
- **Embedding two types with a clashing method name and then using it**: compile error.

## Code Examples
```go
// Interface embedding
type ReadWriter interface {
    Reader
    Writer
}

// Struct embedding: methods promoted, interfaces satisfied
type ReadWriter struct {
    *Reader // *bufio.Reader
    *Writer // *bufio.Writer
}

// Convenience embedding + refinement
type Job struct {
    Command string
    *log.Logger
}

func NewJob(command string, logger *log.Logger) *Job {
    return &Job{command, logger}
}

// Override/refine a promoted method
func (job *Job) Printf(format string, args ...interface{}) {
    job.Logger.Printf("%q: %s", job.Command, fmt.Sprintf(format, args...))
}
```
- **What it demonstrates**: interface union, struct method promotion, and overriding a promoted method via the embedded field.

## Worked Example
Giving `Job` a logger by embedding. Declare `type Job struct { Command string; *log.Logger }`. Once initialized (`&Job{command, log.New(os.Stderr, "Job: ", log.Ldate)}`), `job.Println("starting now...")` works immediately - `Println` is promoted from `*log.Logger`, with the `Logger` as receiver. To customize, define `(*Job).Printf`, which *shadows* the promoted `Printf` at a shallower depth; inside it, reach the original via `job.Logger.Printf(...)`. The contrast with subclassing: `Job.Printf` doesn't "override" a virtual method that `log.Logger` would dispatch to - it's simply the name resolution winner for `*Job` values, while the inner `*log.Logger` keeps its own behavior. Lesson: embed to borrow, reach in via the type name to refine.

## Key Takeaways
1. Embedding borrows implementation; it is composition, not inheritance.
2. Interface embedding unions methods (`io.ReadWriter`); only interfaces embed in interfaces.
3. Struct embedding promotes methods and satisfies interfaces without forwarding stubs.
4. A promoted method's receiver is the inner type, not the outer - no virtual dispatch.
5. Name conflicts: shallower wins; same-level clash is an error unless never used.

## Connects To
- **Ch 11 (Methods)**: promoted methods carry their original (inner) receiver.
- **Ch 12 (Interfaces)**: embedding is how composed types satisfy several interfaces at once.
- **Ch 10 (Initialization)**: embedded pointers must be initialized before use, like any pointer field.
