# Chapter 12: Interfaces and other types

## Core Idea
Interfaces specify behavior - "if something can do *this*, it can be used *here*." Go interfaces are small (often one or two methods), implemented implicitly, and named after the method (`io.Writer`). Because almost anything can have methods, almost anything can satisfy an interface - a struct, an integer, a channel, even a function. Conversion and type assertions let you switch a value between its concrete type and the interfaces it satisfies.

## Frameworks Introduced
- **Small, implicitly-satisfied interfaces**: A type implements an interface by implementing its methods - no `implements` keyword.
  - When to use: Defining the boundary between components.
  - How: One-method interfaces named `method`+`-er` (`io.Writer` for `Write`). A type can implement several (e.g., `sort.Interface` = `Len`/`Less`/`Swap`, plus `Stringer`).
- **Conversion to access a different method set**: Convert a named type to another (same-underlying) type to reuse its methods.
  - When to use: When another type already does part of the job.
  - How: `fmt.Sprint([]int(s))` instead of hand-rolling `Sequence.String`; `sort.IntSlice(s).Sort()`. Conversion between same-underlying types doesn't create a new value.
- **Type switch**: Branch on the dynamic type of an interface value; the variable has each clause's type.
  - When to use: Handling multiple concrete types behind an interface.
  - How: `switch t := value.(type) { case string: ...; case Stringer: return t.String() }`. Mix concrete types and interfaces freely.
- **Type assertion**: Extract a concrete type from an interface, with comma-ok safety.
  - When to use: When you expect one specific type.
  - How: `str, ok := value.(string)` - on failure `str` is the zero value and `ok` is false. Bare `value.(string)` panics on mismatch.
- **Export the interface, not the type, when there's no extra behavior**: If a type exists only to implement an interface and has no exported methods beyond it, export just the interface and have the constructor return the interface.
  - When to use: Library design where the implementation is interchangeable.
  - How: `crc32.NewIEEE` and `adler32.New` both return `hash.Hash32`; swapping algorithms is a one-line constructor change. `crypto/cipher`'s `NewCTR(block Block, iv []byte) Stream` abstracts the block cipher behind the `Block`/`Stream` interfaces.
- **Functions as interface satisfiers via adapter types**: An ordinary function can satisfy an interface through an adapter type whose method calls the function.
  - When to use: Turning a bare function into a handler/interface implementer.
  - How: `http.HandlerFunc` is `func(ResponseWriter, *Request)` with a `ServeHTTP` method that calls `f`; `http.HandlerFunc(ArgServer)` adapts `ArgServer` into an `http.Handler`.

## Key Concepts
- **`Stringer`**: `interface { String() string }` - the custom-formatting interface used by `fmt`.
- **`http.Handler`**: `interface { ServeHTTP(ResponseWriter, *Request) }` - anything implementing it can serve HTTP.
- **`ResponseWriter` satisfies `io.Writer`**: so `fmt.Fprintf` can write HTTP responses.
- **Concrete vs. interface in a type switch**: a `case` can match a concrete type (`string`) or another interface (`Stringer`).

## Mental Models
- Think of an interface as a *capability*, not a class hierarchy: "can it `Write`?" not "is it a `Writer` subclass?"
- Think of conversion as "borrow the method set of another type for a moment" - cheap when the underlying type is the same.
- Think of `HandlerFunc` as the bridge that lets a plain function live in an interface-shaped hole.

## Anti-patterns
- **Reimplementing what another type's methods already do**: convert and delegate instead.
- **Bare type assertions without `ok`**: panics on the unexpected type.
- **Exporting an implementation type that has no behavior beyond an interface**: export the interface and return it from the constructor.
- **Large interfaces**: Go favors one- or two-method interfaces.

## Code Examples
```go
// Type switch mixing concrete and interface cases
switch str := value.(type) {
case string:
    return str
case Stringer:
    return str.String()
}

// Safe single-type assertion
str, ok := value.(string)
if ok {
    fmt.Printf("string value is: %q\n", str)
}

// A function adapted into an http.Handler
func ArgServer(w http.ResponseWriter, req *http.Request) {
    fmt.Fprintln(w, os.Args)
}
http.Handle("/args", http.HandlerFunc(ArgServer))
```
- **What it demonstrates**: type switch, comma-ok assertion, and the function-to-handler adapter.

## Worked Example
Building an HTTP server four ways, all because interfaces are just method sets. A struct: `type Counter struct{ n int }` with `func (ctr *Counter) ServeHTTP(...)`. Even simpler, an integer: `type Counter int` with a pointer receiver `ServeHTTP` that does `*ctr++`. A channel: `type Chan chan *http.Request` whose `ServeHTTP` sends `req` on the channel. And a function: `ArgServer` adapted via `http.HandlerFunc(ArgServer)`. Each satisfies `http.Handler` and can be registered with `http.Handle`. The lesson: don't reach for a struct + interface boilerplate when a number, channel, or function will do - if it has the method, it's a handler.

## Key Takeaways
1. Interfaces are small and satisfied implicitly; name one-method interfaces `method`+`-er`.
2. Convert between same-underlying types to reuse method sets (no copy).
3. Use type switches for multi-type dispatch; use comma-ok assertions for single types.
4. When a type only implements an interface, export the interface and return it from the constructor.
5. Any type with methods - struct, int, channel, function - can satisfy an interface.

## Connects To
- **Ch 11 (Methods)**: pointer receivers are what make types satisfy interfaces like `io.Writer`.
- **Ch 14 (Embedding)**: embedding promotes methods, automatically satisfying composed interfaces.
- **Ch 17 (A web server)**: the `Handler`/`HandlerFunc` patterns power the final example program.
