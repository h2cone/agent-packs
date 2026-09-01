# Patterns - Effective Go

Concrete techniques and idioms from the document. Apply by situation.

## Single-source formatting
**When to use**: Always.
**How**: Run `gofmt`/`go fmt`; never hand-align. If output looks wrong, restructure the code.
**Trade-offs**: Zero style arguments; gives up per-project formatting control.

## Doc comment above declaration
**When to use**: Exported declarations you want documented.
**How**: Comment on the line(s) immediately before, no blank line between.
**Trade-offs**: `godoc` associates it automatically; a blank line breaks the link.

## Package-name-aware naming (no stutter)
**When to use**: Naming exported symbols.
**How**: `bufio.Reader` not `BufReader`; `ring.New` when one exported type; `once.Do(setup)` not `DoOrWaitUntilDone`.
**Trade-offs**: A doc comment beats a long name.

## Getter without "Get"
**When to use**: Writing accessors.
**How**: field `owner` -> `Owner()`; setter `SetOwner(u)`.
**Trade-offs**: Capitalization distinguishes field from method; reads naturally.

## `-er` interface naming
**When to use**: Single-method interfaces.
**How**: `Reader`, `Writer`, `Formatter`; reuse canonical names/signatures (`String`, not `ToString`).

## Guard-clause happy path (omit `else`)
**When to use**: A sequence of error conditions.
**How**: Each guard `return`s early; success flow runs un-indented down the page.
**Trade-offs**: Flatter than nested `else`; only when the body terminates (`return`/`break`/`continue`).

## `:=` err reassignment
**When to use**: Chained calls sharing one `err`.
**How**: `f, err := os.Open(...); d, err := f.Stat()` - `err` is re-assigned if same scope + a new var is introduced.

## `range` with discards
**When to use**: Need only key or only value.
**How**: `for k := range x` (key only); `for _, v := range x` (value only).

## `switch` on `true`
**When to use**: Multi-branch boolean conditions.
**How**: `switch { case 'a'<=c && c<='f': ... }`; comma-separated cases; no fallthrough.

## Labeled `break`
**When to use**: Break an outer loop from inside a `switch`.
**How**: Label the loop (`Loop:`); `break Loop`.

## Type switch
**When to use**: Branch on an interface's concrete type.
**How**: `switch t := x.(type) { case int: ... }` - `t` is typed per clause.

## Named results + naked return
**When to use**: Short functions where names clarify the return.
**How**: `func f(...) (n int, err error) { ...; return }`.
**Trade-offs**: Overuse in long functions hides what's returned.

## `defer` for cleanup
**When to use**: Resource release on every return path.
**How**: `defer f.Close()` right after `os.Open`.
**Trade-offs**: Never forgets a close; keeps release next to acquire. Function-scoped, not block-scoped.

## `defer` arg evaluation for tracing
**When to use**: Pair enter/leave logging.
**How**: `defer un(trace("a"))` - `"a"` captured at defer time.

## Zero-value-is-useful design
**When to use**: Designing exported types.
**How**: Make the zero value ready (`bytes.Buffer`, `sync.Mutex`); composes transitively.

## `new` vs `make`
**When to use**: Allocating.
**How**: `new(T)` -> zeroed `*T` (any type); `make(T, args)` -> initialized `T` (slice/map/chan only).
**Trade-offs**: `new([]int)` gives a pointer to a nil slice - rarely useful; use `make`.

## Composite literal construction
**When to use**: Building structs/slices/maps.
**How**: `&File{fd: fd, name: name}` (field labels, order-free, missing=zero); `&File{}` == `new(File)`.

## `append` + reassign
**When to use**: Growing a slice.
**How**: `x = append(x, 4, 5, 6)`; append a slice `x = append(x, y...)`.
**Trade-offs**: Must reassign - the descriptor is passed by value.

## Comma-ok map idiom
**When to use**: A present key may hold the zero value.
**How**: `v, ok := m[k]`; presence-only `_, ok := m[k]`.

## Map-as-set
**When to use**: Set membership.
**How**: `map[T]bool`; `if m[x] { ... }`.

## Recursion-safe `Stringer`
**When to use**: Custom `String()` on a string-like type.
**How**: Avoid `%s`/`%v` on the receiver; use a non-string verb (`%f`, `%d`) or convert to `string` first.

## `iota` constant families
**When to use**: Related enumerated constants.
**How**: `const ( _ = iota; KB = 1<<(10*iota); MB; GB ... )`; skip with `_`.

## `init` for verify/register
**When to use**: Setup not expressible as a declaration.
**How**: `func init() { ... }` runs after vars/imports; register flags, sanity-check env.

## Pointer receiver for mutation/interface
**When to use**: Method must mutate, or type must satisfy a pointer-receiver interface.
**How**: `func (p *T) Write(...) (...)` -> `*T` satisfies `io.Writer`.

## Compile-time interface check
**When to use**: No static conversion already enforces conformance (rare).
**How**: `var _ I = (*T)(nil)`.

## Side-effect import
**When to use**: Import only for `init` registration.
**How**: `import _ "net/http/pprof"` - no usable name.

## Interface/struct embedding
**When to use**: Composing interfaces or borrowing implementation.
**How**: `interface { Reader; Writer }`; `struct { *Reader; *Writer }` - methods promoted, interfaces satisfied.
**Trade-offs**: Not subclassing - promoted method's receiver is the inner type.

## Share by communicating
**When to use**: Default concurrent-access strategy.
**How**: Pass values on channels; only one goroutine owns a value at a time.
**Trade-offs**: Reference counts may still warrant a mutex.

## Channel completion signal
**When to use**: Wait for a goroutine to finish.
**How**: `c := make(chan int); go func(){ work(); c<-1 }(); <-c`.

## Buffered-channel semaphore
**When to use**: Limit concurrent operations.
**How**: `sem := make(chan int, N)`; `sem<-1` before, `<-sem` after.

## Fixed handler pool
**When to use**: Bounding total goroutine count under load.
**How**: N goroutines all `range` the request channel; a `quit` channel stops them.

## Channel-of-channels RPC
**When to use**: Parallel demux / per-client reply path.
**How**: Embed `resultChan` in the request; handler replies on it.

## Parallelization with completion drain
**When to use**: Independent CPU-bound sub-computations.
**How**: One goroutine per CPU; drain `numCPU` signals. `numCPU = runtime.GOMAXPROCS(0)`.

## Leaky buffer free list
**When to use**: Reuse buffers across goroutines without locks.
**How**: `select { case b = <-freeList: default: b = new(Buffer) }`; return with `select { case freeList<-b: default: }`.

## Rich error wrapping
**When to use**: Callers may inspect cause.
**How**: `type PathError struct{ Op, Path string; Err error }` implementing `Error()`; wrap with `fmt.Errorf("open %s: %w", path, err)` so `errors.Is`/`errors.As` see the cause.
**Trade-offs**: `errors.As` recovers the concrete type; `==` and a bare type-assert miss wrapped errors.

## `any` instead of `interface{}`
**When to use**: Empty interface (Go 1.18+).
**How**: `var t any`; type switch `switch t := t.(type)`.
**Trade-offs**: Same type as `interface{}`; `any` is the name to emit.

## `slices.Contains` instead of a search loop
**When to use**: Membership test on a slice (Go 1.21+).
**How**: `found := slices.Contains(items, want)`.
**Trade-offs**: Extra `"slices"` import; prefer this over a handwritten `for`.

## Range over integer
**When to use**: Index runs `0..n-1` (Go 1.22+).
**How**: `for i := range n { work(i) }`.
**Trade-offs**: Keep C-style `for` for strides, reverse, or a non-range stop condition.

## Loopvar: do not copy on 1.22+
**When to use**: Goroutine/closure launched from a `for`.
**How**: `for _, item := range items { go func() { process(item) }() }`.
**Trade-offs**: Pre-1.22 required `item := item`; keep that only when go.mod is older than 1.22.

## ServeMux method+path patterns
**When to use**: HTTP routes on Go 1.22+.
**How**: `mux.HandleFunc("GET /item/{id}", item)` then `id := r.PathValue("id")`.
**Trade-offs**: `http.Handle("/", http.HandlerFunc(f))` is the 2009 default-mux skeleton, not the 1.22+ default.

## `panic`/`recover` isolation
**When to use**: Keep one failing goroutine from killing the program.
**How**: `defer func(){ if err := recover(); err != nil { log... } }()`.

## Panic-to-error boundary
**When to use**: Deep internal errors, kept within a package.
**How**: `panic` a local error type; `defer` `recover` and set named returns; re-panic unexpected types. Never expose panics to clients.
