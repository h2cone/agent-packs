# Chapter 10: Initialization

## Core Idea
Go initialization looks like C's but is more powerful: complex structures can be built during initialization, and ordering - even across packages - is handled correctly. Constants are compile-time; variables may use runtime expressions; and each source file can define `init` functions that run after all variable initializers (and after imported packages are initialized), making them the place to verify or repair program state before execution.

## Frameworks Introduced
- **Constants are compile-time**: Created at compile time (even locals), restricted to number, rune, string, or bool, and must be constant expressions.
  - When to use: Fixed values known at compile time.
  - How: `1<<3` is constant; `math.Sin(math.Pi/4)` is not (runtime call).
- **`iota` enumerator**: Enumerated constants via `iota`, which can be part of an expression and implicitly repeated.
  - When to use: Related sets of constants (sizes, flags, bit positions).
  - How: In a `const (...)` block, `iota` starts at 0 and increments per line; skip the first with `_ = iota`.
- **Variables allow runtime initializers**: Like constants, but the initializer can be a general runtime expression.
  - When to use: Package-level values computed from environment, etc.
  - How: `var ( home = os.Getenv("HOME"); user = os.Getenv("USER") )`.
- **`init` functions**: Each source file may define niladic `init` functions (multiple per file allowed) that run after all the package's variable initializers, which run only after all imported packages are initialized.
  - When to use: Setup that can't be a declaration - verifying or repairing state before real execution begins.
  - How: `func init() { ... }` - e.g., sanity-check env vars, register flags.

## Key Concepts
- **`ByteSize` pattern**: a named float type with an `iota`-generated scale (KB, MB, GB...) and a `String()` method that formats itself - illustrating constants + methods together.
- **`iota` + blank identifier**: `_ = iota` discards the first (0) value so the scale starts at the second line.
- **`String()` safety via `%f`**: `ByteSize.String` uses `%f`, which wants a float, so `Sprintf` won't recurse into `String()`.

## Mental Models
- Think of initialization order as: imported packages first, then this package's `var` initializers, then `init` - deterministic and cross-package safe.
- Think of `iota` as a per-`const`-block line counter you can fold into an expression to generate a whole family of values.

## Anti-patterns
- **Putting a runtime call in a `const`**: `const x = math.Sin(...)` won't compile; use `var`.
- **Using `init` for things expressible as declarations**: prefer `var` initializers; reserve `init` for verification/repair or registration.
- **Recurring `String()` via `%s`/`%v` on the same string type**: use a non-string verb (`%f`, `%d`) or convert to `string` first.

## Code Examples
```go
type ByteSize float64

const (
    _           = iota // ignore first value (0)
    KB ByteSize = 1 << (10 * iota)
    MB
    GB
    TB
    PB
    EB
    ZB
    YB
)

func (b ByteSize) String() string {
    switch {
    case b >= YB:
        return fmt.Sprintf("%.2fYB", b/YB)
    case b >= ZB:
        return fmt.Sprintf("%.2fZB", b/ZB)
    // ... down to B
    }
    return fmt.Sprintf("%.2fB", b)
}

// Variables with runtime initializers
var (
    home   = os.Getenv("HOME")
    user   = os.Getenv("USER")
    gopath = os.Getenv("GOPATH")
)

// init: verify/repair state before execution
func init() {
    if user == "" {
        log.Fatal("$USER not set")
    }
    if home == "" {
        home = "/home/" + user
    }
    flag.StringVar(&gopath, "gopath", gopath, "override default GOPATH")
}
```
- **What it demonstrates**: `iota`-generated constants with a `String()` method, runtime `var` initializers, and an `init` that repairs env defaults and registers a flag.

## Worked Example
The `ByteSize` type ties the chapter together. `const` block uses `_ = iota` to skip 0, then `KB ByteSize = 1 << (10 * iota)` makes KB = `1<<10`, MB = `1<<20`, and so on - the expression repeats with an incrementing `iota`, so one line seeds the whole scale. The `String()` method switches on thresholds and formats with `%.2f`. Because `%f` wants a float (not a string), `Sprintf` never calls back into `String()` - the recursion trap from Ch 9 is avoided by *verb choice*, not a type conversion. `ByteSize(1e13)` prints `9.09TB`; `YB` prints `1.00YB`.

## Key Takeaways
1. Constants are compile-time, typed as number/rune/string/bool, and need constant expressions.
2. `iota` generates enumerated families; fold it into an expression and skip values with `_`.
3. Variables accept runtime initializers; group related ones in a `var (...)` block.
4. `init` runs after vars and imported packages - use it to verify/repair state or register.
5. Combine `iota` constants with a `String()` method for self-formatting scalar types.

## Connects To
- **Ch 9 (Data)**: the `String()` recursion pitfall and `Stringer` interface originate here.
- **Ch 11 (Methods)**: `String()` is a method on a named (non-struct) type - methods aren't just for structs.
- **Ch 13 (The blank identifier)**: `_ = iota` is a blank-identifier use case.
