# Chapter 8: Functions

## Core Idea
Go functions and methods can return multiple values - a feature that replaces C's clumsy in-band error returns and pointer-out-parameters. Result parameters can be named (acting as documentation and enabling "naked" returns), and `defer` schedules a call to run just before the function returns, making resource cleanup reliable and keeping it next to the acquisition.

## Frameworks Introduced
- **Multiple return values**: Return a value *and* an error (or a value *and* a position), instead of signaling errors in-band or mutating via pointers.
  - When to use: Whenever a call can partially succeed or needs to return extra context.
  - How: `func (file *File) Write(b []byte) (n int, err error)` - returns bytes written and an error that is non-nil when `n != len(b)`.
- **Named result parameters**: Name the return values; they're initialized to zero values and act as regular variables. A `return` with no arguments returns their current values.
  - When to use: When the names clarify which result is which, or when naked returns simplify a function.
  - How: `func nextInt(b []byte, pos int) (value, nextPos int)`. Names are documentation.
- **`defer`**: Schedules a function call to run immediately before the enclosing function returns.
  - When to use: Resource release that must happen on every return path - closing files, unlocking mutexes.
  - How: `defer f.Close()` right after `os.Open`. Two advantages: (1) you never forget to close, even after adding new return paths; (2) the close sits next to the open, not buried at the end.
- **Deferred arguments are evaluated at the `defer`**: The arguments (and receiver) are evaluated when `defer` executes, not when the call runs. Deferred calls run in LIFO order.
  - When to use: Building tracing/cleanup that captures values at defer time.
  - How: `defer un(trace("a"))` captures `"a"` at the `defer`, so the leaving message matches the entering one.

## Key Concepts
- **Naked return**: `return` with no args returns the current named result values. Best in short functions; overuse in long ones hurts readability.
- **LIFO ordering**: deferred calls run last-in-first-out; `for i := 0; i < 5; i++ { defer fmt.Printf("%d ", i) }` prints `4 3 2 1 0`.
- **`defer` is function-based, not block-based**: Its power comes from spanning the whole function, unlike block-scoped cleanup in other languages.

## Mental Models
- Think of multiple returns as "tell the caller both *what happened* and *how far it got*."
- Think of named results as self-documenting signatures: `(value, nextPos int)` says which is which without a comment.
- Think of `defer` as "acquire here, release guaranteed on every exit, and keep them adjacent."

## Anti-patterns
- **In-band error returns (`-1` for EOF)**: Use a separate error value instead.
- **Passing a pointer to a return value to simulate reference parameters**: Return the value directly.
- **Closing resources manually at every return site**: Fragile; use `defer`.
- **Overusing naked returns in long functions**: Hides what's being returned; name them but `return` explicitly.

## Code Examples
```go
// Multiple return values: grab a number and the next scan position
func nextInt(b []byte, i int) (int, int) {
    for ; i < len(b) && !isDigit(b[i]); i++ {
    }
    x := 0
    for ; i < len(b) && isDigit(b[i]); i++ {
        x = x*10 + int(b[i]) - '0'
    }
    return x, i
}

// Named results + naked return: ReadFull
func ReadFull(r Reader, buf []byte) (n int, err error) {
    for len(buf) > 0 && err == nil {
        var nr int
        nr, err = r.Read(buf)
        n += nr
        buf = buf[nr:]
    }
    return
}
```
- **What it demonstrates**: multiple returns replace pointer-out params; named results document and enable a naked `return`.

## Worked Example
The `Contents` function shows `defer` guaranteeing cleanup across multiple return paths:
```go
func Contents(filename string) (string, error) {
    f, err := os.Open(filename)
    if err != nil {
        return "", err
    }
    defer f.Close() // f.Close runs on every return path below

    var result []byte
    buf := make([]byte, 100)
    for {
        n, err := f.Read(buf[0:])
        result = append(result, buf[0:n]...)
        if err != nil {
            if err == io.EOF {
                break
            }
            return "", err // f closed here
        }
    }
    return string(result), nil // and here
}
```
Applied: the moment you `os.Open`, write `defer f.Close()` on the next line. Whether the function returns the error from `Open`, a mid-read error, or the final result, the file is closed - and the close lives next to the open, not at the function's end. The tracing variant (`defer un(trace("a"))`) shows the second lever: because args evaluate at `defer`-time, you can pair enter/leave logging in one line.

## Key Takeaways
1. Return multiple values to replace in-band errors and pointer-out parameters.
2. Named result parameters document the return values and enable naked returns.
3. `defer` guarantees cleanup on every return path; keep it next to the acquisition.
4. Deferred arguments evaluate at the `defer`; deferred calls run LIFO.
5. `defer` is function-scoped, which is the source of its power (and its difference from block-scoped cleanup).

## Connects To
- **Ch 7 (Control structures)**: the `:=` reassignment of `err` chains these multi-return calls.
- **Ch 16 (Errors)**: the `(value, error)` pattern is the foundation of Go error handling.
- **Ch 15 (Concurrency)**: `defer` + `recover` together build safe goroutine handlers.
