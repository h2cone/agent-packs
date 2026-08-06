# Cheatsheet - Effective Go

Decision rules for acting the way the document advises. Not a term list - every line helps you *decide*.

## `new` vs `make`
- Need a **slice, map, or channel** ready to use → `make`. (Returns `T`, initialized.)
- Need a **pointer to a zero value** of any type → `new` (or `&T{}`).
- Want a pointer to a `nil` slice → `new([]int)` — almost never what you want; use `make`.

## Value vs. pointer receiver
- Must the method **mutate** the receiver? → pointer.
- Must the type satisfy an **interface with a pointer-receiver method** (e.g. `io.Writer`)? → pointer.
- Large struct, copied per call? → pointer (efficiency).
- Small value type, read-only method, no interface need → value is fine.
- Rule of thumb: **one choice per type** — don't mix value and pointer receivers.

## When to use `_` (blank identifier)
- Discarding an unwanted return (`_, err := os.Stat(path)`).
- Presence-only map check (`_, ok := m[k]`).
- Skipping a range value (`for _, v := range x`) or an `iota` value (`_ = iota`).
- Side-effect import (`import _ "pkg"`).
- Compile-time interface check (`var _ I = (*T)(nil)`).
- **Never** to discard an **error**.

## `panic` vs. return `error`
- Ordinary, handleable failure in a library → **return `error`**.
- Impossible state / non-convergence → `panic`.
- Init that truly can't set up → `panic` (acceptable).
- Internal deep-stack errors, recovered at the package boundary → `panic` + `recover`, return `error` to clients.
- **Never** let panics cross a package API.

## Channel: buffered or not?
- Need a **synchronization handshake** (sender knows receiver got it) → unbuffered.
- Limiting **throughput** (semaphore) → buffered, capacity = max concurrent.
- Decoupling producer/consumer rate → buffered.
- Free list / non-blocking peek → buffered + `select`/`default`.

## Control-flow quick rules
- Body ends in `return`/`break`/`continue`? → **drop the `else`**; happy path runs down the page.
- ≥3 boolean branches? → `switch { case ... }` (switch on `true`), not `if-else-if`.
- Need to break an **outer loop** from inside a `switch`? → label the loop, `break Loop`.
- Branch on an interface's concrete type? → type switch, not a chain of assertions.
- Need one specific type out of an interface? → comma-ok assertion (`v, ok := x.(T)`), never bare `x.(T)`.

## Naming quick rules
- First letter upper = **exported**; lower = package-private.
- Package: lower-case, single word, = directory base name, favor brevity.
- Don't stutter: `bufio.Reader`, `ring.New`.
- Getter `Owner` (no `Get`); setter `SetOwner`.
- One-method interface: method + `-er` (`Reader`).
- `MixedCaps`, never underscores.

## Allocation/construction quick rules
- Design types whose **zero value is usable** (`bytes.Buffer`, `sync.Mutex`).
- Construct with composite literals: `&File{fd: fd}` (labels = order-free, missing = zero).
- `append` → **always reassign**: `x = append(x, ...)`.
- Map missing key → returns zero value; use comma-ok when absence matters.
- `delete(m, k)` is safe even if `k` is absent.

## `fmt` verb quick table
| Verb | Use |
|---|---|
| `%v` / `%+v` / `%#v` | default / +field names / Go syntax |
| `%T` | type of value |
| `%q` / `%#q` | quoted string or rune / back-quoted |
| `%x`, `% x` | hex (with spaces) |
| `%d %f %s` | typed - chosen by argument, no size flags |

## Concurrency tells (you're probably doing it wrong)
- Sharing a variable + mutex where a **channel** would do.
- One goroutine per request while only limiting *running* count (leak) → gate **creation** or use a **fixed pool**.
- Calling "concurrency" what is really "parallelism" — Go is concurrent, not parallel.
- Blocking on a channel when you wanted non-blocking → add `select`/`default`.

## Formatting tells
- Hand-aligning comments/columns → let `gofmt` do it.
- Parentheses on `if`/`for`/`switch` → remove them.
- Opening brace on its own line → move it up (semicolon-insertion hazard).

## `String()` recursion tell
- `String()` calls `Sprintf("%s", m)` on the same string-like type → **infinite recursion**. Fix: convert to `string` first, or use a non-string verb (`%f`, `%d`).
