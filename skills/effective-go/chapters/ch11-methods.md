# Chapter 11: Methods

## Core Idea
Methods can be defined for any named type (except a pointer or an interface) - the receiver need not be a struct. The central decision is **pointer vs. value receiver**: value methods can be invoked on both pointers and values, but pointer methods can be invoked only on pointers. Choosing a pointer receiver lets a method mutate the receiver and lets the type satisfy interfaces like `io.Writer`.

## Frameworks Introduced
- **Methods on any named type**: Bind a method to a named type by declaring a receiver of that type.
  - When to use: Adding behavior to a slice, number, function, or struct type.
  - How: `type ByteSlice []byte`; `func (slice ByteSlice) Append(data []byte) []byte`.
- **Pointer receiver to mutate / satisfy interfaces**: Redefine the method with a `*T` receiver so it can overwrite the caller's value.
  - When to use: The method must modify the receiver, or the type should satisfy an interface whose method is pointer-receiver.
  - How: `func (p *ByteSlice) Write(data []byte) (n int, err error)` - now `*ByteSlice` satisfies `io.Writer`, so `fmt.Fprintf(&b, ...)` works.
- **The pointer-vs-value rule**: Value methods can be invoked on pointers and values; pointer methods can be invoked only on pointers.
  - When to use: Deciding receiver type and reasoning about call sites.
  - How: Pointer methods can't run on a value (they'd mutate a discarded copy); the language disallows it. But when the value is *addressable*, the compiler inserts `&` automatically (`b.Write` becomes `(&b).Write`).

## Key Concepts
- **Addressable values**: a local variable like `var b ByteSlice` is addressable, so `b.Write(...)` is rewritten to `(&b).Write(...)`; a non-addressable value (e.g., a map element) is not.
- **`bytes.Buffer`**: its implementation is built on `Write` over a byte slice - the canonical application of this pattern.

## Mental Models
- Think of the receiver type as part of the method's contract: if you need to mutate or to satisfy a pointer-receiver interface, use `*T`.
- Think of the addressability exception as the compiler doing the obvious thing: if it can take the address, it will, so you write `b.Write` not `(&b).Write`.

## Anti-patterns
- **Value receiver on a method that must mutate the caller**: changes are lost; use `*T`.
- **Expecting to call a pointer method on a non-addressable value**: not allowed.
- **Thinking methods are only for structs**: any named type (except `*T` or an interface) can have methods.

## Code Examples
```go
type ByteSlice []byte

// Value receiver: must return the updated slice
func (slice ByteSlice) Append(data []byte) []byte { /* ... */ return slice }

// Pointer receiver: overwrites the caller's slice, and satisfies io.Writer
func (p *ByteSlice) Write(data []byte) (n int, err error) {
    slice := *p
    // ... append into slice ...
    *p = slice
    return len(data), nil
}

// *ByteSlice now satisfies io.Writer
var b ByteSlice
fmt.Fprintf(&b, "This hour has %d days\n", 7) // pass address; only *ByteSlice is a Writer
```
- **What it demonstrates**: the value-receiver vs. pointer-receiver choice and how a pointer receiver earns an interface.

## Worked Example
Turning `ByteSlice` into an `io.Writer`. Start with a value-receiver `Append` that returns the new slice - workable but clumsy (callers must reassign). Switch to a `*ByteSlice` receiver so `Append` can overwrite `*p` directly. Then rename the method to `Write` with signature `(n int, err error)`: `*ByteSlice` now satisfies `io.Writer`, and `fmt.Fprintf(&b, ...)` writes into the slice. The address is required because only `*ByteSlice` is a Writer - but because `b` is an addressable local, you can often call `b.Write(...)` and let the compiler insert `&`. Applied: pick the pointer receiver once you know the type should be writable/mutable, and you get interface satisfaction for free.

## Key Takeaways
1. Methods attach to any named type, not just structs.
2. Value methods run on values and pointers; pointer methods run only on pointers.
3. Use a pointer receiver to mutate the receiver or to satisfy interfaces like `io.Writer`.
4. The compiler auto-takes the address of addressable values for pointer-method calls.
5. `bytes.Buffer` is the canonical realization of `Write` on a byte slice.

## Connects To
- **Ch 9 (Data)**: the `Append`/`append` story motivates the slice-return problem solved by a pointer receiver.
- **Ch 12 (Interfaces)**: pointer receivers are how types satisfy `io.Writer` and friends.
- **Ch 14 (Embedding)**: embedded types' methods are promoted with their original receiver.
