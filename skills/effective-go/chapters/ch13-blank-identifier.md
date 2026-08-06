# Chapter 13: The blank identifier

## Core Idea
The blank identifier `_` is a write-only placeholder - "like writing to `/dev/null`" - used wherever a variable is required but the value is irrelevant. It makes intent explicit (a value is deliberately discarded), silences "unused" errors during development, imports packages for their side effects, and - via a compile-time assignment - guarantees a type satisfies an interface.

## Frameworks Introduced
- **Discard an unwanted return value**: In multiple assignment, use `_` for a value you won't use, instead of a dummy variable.
  - When to use: When a function returns several values and you need only some.
  - How: `if _, err := os.Stat(path); os.IsNotExist(err) { ... }`. For presence-only map lookups: `_, present := timeZone[tz]`.
- **Silence unused-import / unused-variable errors**: Unused imports and initialized-but-unused vars are compile errors; `_` is a temporary escape during development.
  - When to use: Half-written code that must compile to test.
  - How: `var _ = fmt.Printf` and `var _ io.Reader` after the imports; `_ = fd` in the body. Comment them as work-in-progress and delete when done.
- **Import for side effects**: `import _ "pkg/path"` imports a package only for its `init` side effects, giving it no usable name in this file.
  - When to use: Packages whose `init` registers handlers (e.g., `net/http/pprof` registering debug endpoints).
  - How: `import _ "net/http/pprof"` - the `_` makes the side-effect-only intent unmistakable.
- **Compile-time interface check**: `var _ I = (*T)(nil)` forces the compiler to verify `*T` satisfies `I`.
  - When to use: When no static conversion in the code already checks conformance (a rare situation), to catch interface drift at compile time.
  - How: `var _ json.Marshaler = (*RawMessage)(nil)` - if `*RawMessage` ever fails to implement `Marshaler`, this stops compiling.

## Key Concepts
- **Never discard errors**: discarding an error return is "terrible practice"; always check them.
- **Convention for silencing decls**: global `_` assignments go right after imports, commented, so they're easy to find and remove.
- **Side-effect imports have no name**: `import _ "x"` means the package can't be referenced - its only effect is `init`.

## Mental Models
- Think of `_` as a statement of intent: "I know this value is here and I'm choosing not to use it."
- Think of `var _ I = (*T)(nil)` as a *type-level assertion* - it creates no variable, it just asks the compiler to prove conformance.

## Anti-patterns
- **`fi, _ := os.Stat(path)` then using `fi`**: crashes if the path doesn't exist; never ignore the error.
- **Leaving `var _ = ...` silencing decls in shipped code**: they're scaffolding; remove them.
- **Using `var _ I = (*T)(nil)` everywhere**: only do it when no static conversion already enforces conformance.

## Code Examples
```go
// Discard the value, keep the error
if _, err := os.Stat(path); os.IsNotExist(err) {
    fmt.Printf("%s does not exist\n", path)
}

// BAD - discarding the error
fi, _ := os.Stat(path)
if fi.IsDir() { /* crashes if path absent */ }

// Side-effect import
import _ "net/http/pprof"

// Compile-time interface conformance
var _ json.Marshaler = (*RawMessage)(nil)
```
- **What it demonstrates**: safe discard, the error-discard anti-pattern, side-effect import, and the interface-check assertion.

## Worked Example
Two uses of `_` in the same codebase. First, a presence-only check: `_, present := timeZone[tz]` - you care whether the key exists, not its (possibly zero) value, so the value goes to `_`. Second, a compile-time guarantee that `*RawMessage` implements `json.Marshaler`. Because `RawMessage`'s custom JSON representation is dispatched at *run time* by the encoder, no static conversion in the package forces conformance - if the method signature drifts, the custom marshaler silently stops being used. Adding `var _ json.Marshaler = (*RawMessage)(nil)` turns that silent failure into a compile error. The blank identifier in the declaration signals "this exists for type checking, not to make a variable."

## Key Takeaways
1. `_` discards a value deliberately - use it for unwanted returns and presence-only map checks.
2. Never discard an error return; always check it.
3. Silence unused-import/var errors with `_`-assignments, commented as temporary.
4. `import _ "pkg"` imports for `init` side effects only, with no usable name.
5. `var _ I = (*T)(nil)` is a compile-time interface-conformance check for the rare case no static conversion covers it.

## Connects To
- **Ch 7 (Control structures)**: `for _, v := range x` discards the index in range loops.
- **Ch 9 (Data)**: `_, present := m[k]` is the presence-only map idiom.
- **Ch 12 (Interfaces)**: the conformance-check idiom guards interface satisfaction.
- **Ch 10 (Initialization)**: `_ = iota` skips a constant value.
