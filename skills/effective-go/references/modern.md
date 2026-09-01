# Modern Go (1.18–1.22)

High-ROI syntax and stdlib replacements that coding agents get wrong because training data still prefers pre-modules Go. Philosophy, naming, embedding, CSP, and panic policy stay in the chapters. This file is which API to *emit*.

## Protocol

1. Read the module's `go` line (`go.mod` / `go.work`). If missing, assume a current stable toolchain and still prefer these defaults.
2. Apply every rule below whose **Since** is ≤ that version. Treat them as authoritative even when nearby code is older.
3. Skip a rule only when it would not compile on that version.
4. Do **not** load all 17 chapters to apply these. Load a chapter only when the topic index says so.
5. Do **not** invent 1.23+ APIs here (iterators, `WaitGroup.Go`, `json/v2`, …). Stay in 1.18–1.22.

| ID | Since | Impact | `go fix` / modernize |
|---|---|---|---|
| `any` | 1.18 | Critical | yes |
| `errors_is` | 1.13 | Critical | yes |
| `slices_contains` | 1.21 | Critical | yes |
| `range_over_int` | 1.22 | Critical | yes |
| `loopvar_capture` | 1.22 | High | yes (deletes the copy) |
| `http_servemux_patterns` | 1.22 | High | no |

---

## `any` (1.18, Critical)

Write `any`, not `interface{}`. Same type; `any` is the name.

```go
// before
var t interface{}
t = functionOfSomeType()
switch t := t.(type) {
case bool:
    fmt.Printf("boolean %t\n", t)
}

// after
var t any
t = functionOfSomeType()
switch t := t.(type) {
case bool:
    fmt.Printf("boolean %t\n", t)
}
```

---

## `errors_is` (1.13, Critical)

Compare errors with `errors.Is` / `errors.As`. Wrap with `fmt.Errorf("…: %w", err)` so those work. Do not use `err == target` or a bare type-assert on a wrapped `error`.

```go
// before
if err == os.ErrNotExist {
    return nil
}
if e, ok := err.(*os.PathError); ok && e.Err == syscall.ENOSPC {
    deleteTempFiles()
}

// after
if errors.Is(err, fs.ErrNotExist) {
    return nil
}
var pathErr *os.PathError
if errors.As(err, &pathErr) && errors.Is(pathErr.Err, syscall.ENOSPC) {
    deleteTempFiles()
}
```

Defining a rich error struct (`PathError{Op, Path, Err}`) is still right (ch16). Inspection is what changed. Implement `Unwrap() error` (or wrap with `%w`) so `Is`/`As` can see the cause.

---

## `slices_contains` (1.21, Critical)

Membership tests go through `slices`, not a handwritten loop.

```go
// before
found := false
for _, v := range items {
    if v == want {
        found = true
        break
    }
}

// after
found := slices.Contains(items, want)
```

Also prefer `slices.Index`, `slices.Sort`, `slices.Clone`, `slices.Compact` over the equivalent for-loops when the module is ≥ 1.21. Import `"slices"`.

---

## `range_over_int` (1.22, Critical)

Integer ranges use `for i := range n`, not a C-style counter.

```go
// before
for i := 0; i < n; i++ {
    work(i)
}

// after
for i := range n {
    work(i)
}
```

Keep `for init; cond; post` when the index does not run `0..n-1` (stride, reverse, early-stop on a non-range condition). `range` over arrays/slices/strings/maps/channels is unchanged (ch07).

---

## `loopvar_capture` (1.22, High)

Go 1.22 gives each iteration its own variables. **Do not** write `v := v` / `item := item` before launching a goroutine.

```go
// before (pre-1.22 workaround — do not emit on 1.22+)
for _, item := range items {
    item := item
    go func() { process(item) }()
}

// after
for _, item := range items {
    go func() { process(item) }()
}
```

Pre-1.22, the loop variable was reused and closures captured one variable; that copy was required. Teach it as history, not current practice. If `go` in `go.mod` is older than 1.22, keep the copy.

---

## `http_servemux_patterns` (1.22, High)

Register method + path patterns on a `ServeMux`. Wildcard segments come from `r.PathValue`. Do not default to `http.Handle("/", http.HandlerFunc(f))` on 1.22+.

```go
// before
http.Handle("/", http.HandlerFunc(QR))
log.Fatal(http.ListenAndServe(*addr, nil))

// after
mux := http.NewServeMux()
mux.HandleFunc("GET /{$}", QR)
mux.HandleFunc("GET /item/{id}", item)
log.Fatal(http.ListenAndServe(*addr, mux))

func item(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    // ...
}
```

`http.HandlerFunc` as an interface adapter is still the right idea (ch12). What changed is *how you register* the route. `{$}` matches the end of the path; `"GET /"` without it also matches descendants.

The 2009 skeleton in ch17 is history of how the document's example was wired, not the pattern to emit.
