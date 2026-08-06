# Chapter 16: Errors

## Core Idea
Go's multiple-return-values feature makes detailed error reporting easy: return a value *and* an `error`. By convention errors implement the built-in `error` interface (`Error() string`), and library writers can wrap a richer model behind it so callers get context (operation, path, underlying cause). For truly unrecoverable situations there's `panic`, and `recover` (usable only inside deferred functions) can regain control - the basis for converting internal panics into clean error values.

## Frameworks Introduced
- **`(value, error)` return pattern**: Return a detailed error alongside the normal value.
  - When to use: Any call that can fail.
  - How: `os.Open` returns `*os.File` and `error` (nil on success). Provide detailed info, not just nil.
- **Rich error types behind the `error` interface**: Implement `error` with a struct that carries context.
  - When to use: When callers may want to inspect *why* it failed.
  - How: `type PathError struct { Op, Path string; Err error }` with `Error()` returning `"open /etc/passwx: no such file or directory"`. Error strings should identify origin (prefix like `"image: unknown format"`).
- **Type assertion to inspect a specific error**: Use a comma-ok assertion to branch on a concrete error type and its fields.
  - When to use: Recoverable failures that need the underlying cause.
  - How: `if e, ok := err.(*os.PathError); ok && e.Err == syscall.ENOSPC { deleteTempFiles(); continue }`.
- **`panic` for the unrecoverable**: `panic(arg)` creates a run-time error that stops the program (unless recovered).
  - When to use: Impossible states (e.g., a loop that can't converge), or init that truly can't set up.
  - How: `panic(fmt.Sprintf("CubeRoot(%g) did not converge", x))`. Real libraries should *avoid* panic - if a problem can be masked, keep running. Init-time setup failure is a reasonable exception.
- **`recover` to regain control**: `recover` stops the stack unwinding and returns the value passed to `panic`; it's only useful inside deferred functions.
  - When to use: Isolating a failing goroutine, or converting internal panics to error values.
  - How: `defer func() { if err := recover(); err != nil { log.Println("work failed:", err) } }()` - a failing goroutine logs and exits cleanly without disturbing others.
- **Parse/Compile panic-to-error pattern**: Use a local error type and internal `panic`, then `recover` in a deferred function to convert it to a returned `error`.
  - When to use: Deep call stacks where bubbling errors explicitly is awkward (keep it *within* a package).
  - How: `Compile` defers a recovery that sets the named return values; a non-matching panic type re-panics so unexpected bugs still crash. Never expose panics to clients.

## Key Concepts
- **`error` interface**: `type error interface { Error() string }`.
- **`recover` returns nil** unless called directly from a deferred function, so deferred code can call panicking libraries safely.
- **Named returns + `recover`**: a deferred function can set named return values before converting a panic to an error.
- **Re-panic idiom**: if the recovered value isn't your expected type, re-panic so genuine bugs surface; both original and new failures appear in the crash report.

## Mental Models
- Think of an `error` value as "the normal return, plus a story about what went wrong."
- Think of `panic`/`recover` as a *private* control-flow tool: panic deep inside a package, recover at its boundary, hand back an `error` - never let panics cross the package API.
- Think of `recover` in a server as a circuit breaker for one goroutine: log, clean up, keep serving.

## Anti-patterns
- **Returning bare nil/boolean instead of a descriptive `error`**: callers can't report or recover.
- **Using `panic` for ordinary, handleable errors in a library**: return an `error` instead.
- **Letting panics escape a package API**: violates the convention; clients can't rely on them.
- **Catching *every* panic silently**: re-panic unexpected types so real bugs aren't swallowed.

## Code Examples
```go
// Rich error type
type PathError struct {
    Op   string
    Path string
    Err  error
}
func (e *PathError) Error() string {
    return e.Op + " " + e.Path + ": " + e.Err.Error()
}

// Inspect a specific error and recover
for try := 0; try < 2; try++ {
    file, err = os.Create(filename)
    if err == nil {
        return
    }
    if e, ok := err.(*os.PathError); ok && e.Err == syscall.ENOSPC {
        deleteTempFiles()
        continue
    }
    return
}

// Isolate a failing goroutine
func safelyDo(work *Work) {
    defer func() {
        if err := recover(); err != nil {
            log.Println("work failed:", err)
        }
    }()
    do(work)
}
```
- **What it demonstrates**: a contextual error type, type-asserted recovery, and goroutine isolation via `recover`.

## Worked Example
The `Compile` panic-to-error pattern. A regex parser reports parse errors by `panic`-ing with a local `Error` type (`type Error string; func (e Error) Error() string { return string(e) }`). Deep in parsing, `re.error("'*' illegal at start of expression")` panics. `Compile` defers a recovery:
```go
func Compile(str string) (regexp *Regexp, err error) {
    regexp = new(Regexp)
    defer func() {
        if e := recover(); e != nil {
            regexp = nil          // clear return value
            err = e.(Error)       // re-panic if not a parse Error
        }
    }()
    return regexp.doParse(str), nil
}
```
If `doParse` panics with an `Error`, the deferred function sets the named returns and the client gets a clean `(nil, err)`. If something *else* panics (e.g., index out of bounds), the type assertion `e.(Error)` fails and re-panics - so genuine bugs still crash the program. Applied: keep `panic`/`recover` *inside* the package; at the API boundary, always hand back an `error`.

## Key Takeaways
1. Return `(value, error)`; make the error descriptive and origin-tagged.
2. Implement `error` with a richer struct when callers need to inspect cause.
3. Use comma-ok type assertions to branch on specific error types.
4. `panic` is for the unrecoverable (and rare init failures); libraries should otherwise avoid it.
5. `recover` works only in deferred functions - use it to isolate goroutines or convert internal panics to errors.
6. Never expose panics across a package API; re-panic unexpected types so bugs surface.

## Connects To
- **Ch 7 (Control structures)**: the early-return guard idiom is the natural shape for `(value, error)` checks.
- **Ch 8 (Functions)**: named returns + `defer` make the panic-to-error conversion possible.
- **Ch 15 (Concurrency)**: `recover` in a deferred function is the goroutine isolation pattern.
