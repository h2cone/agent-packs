# Chapter 17: A web server

## Core Idea
The book closes with a complete, runnable Go program: a small web server that wraps Google's chart API to produce QR codes from short text. It's a capstone that ties together the document's themes - `net/http`'s handler interfaces, `flag` for configuration, `html/template` for rendering, and idiomatic error handling - in one file.

## Frameworks Introduced
- **`http.HandlerFunc` adapter as the entry point**: Register a plain function as the root handler using the adapter from Ch 12.
  - When to use: Wiring a function to a URL.
  - How: `http.Handle("/", http.HandlerFunc(QR))` - `QR` has signature `func(http.ResponseWriter, *http.Request)`.
- **`flag` for configuration**: Define and parse command-line flags before serving.
  - When to use: Any server with configurable options.
  - How: `var addr = flag.String("addr", ":1718", "http service address")`; `flag.Parse()` in `main`; dereference `*addr`.
- **`http.ListenAndServe` + fatal-on-error**: Start the server; treat a bind failure as fatal.
  - When to use: The server's main loop.
  - How: `err := http.ListenAndServe(*addr, nil); if err != nil { log.Fatal("ListenAndServe:", err) }`.
- **`html/template` + `template.Must`**: Parse a template at init time, panicking on parse error (acceptable at startup).
  - When to use: Static templates known at compile time.
  - How: `var templ = template.Must(template.New("qr").Parse(templateStr))`.

## Key Concepts
- **`ResponseWriter` is an `io.Writer`**: so `fmt.Fprint`/`Fprintf` write responses directly (Ch 9 + Ch 12).
- **`HandlerFunc`**: the adapter that lets an ordinary function satisfy `http.Handler` (Ch 12).
- **Startup `panic` is OK**: `template.Must` panicking during init is the legitimate "library can't set itself up" exception from Ch 16.

## Mental Models
- Think of a Go web server as: parse flags -> register handlers (functions, via `HandlerFunc`) -> `ListenAndServe` -> `log.Fatal` on error. That's the whole skeleton.
- Think of `template.Must` as "this template is a compile-time constant; if it's broken, fail loudly at startup, not per-request."

## Anti-patterns
- **Ignoring `ListenAndServe`'s error**: it returns only on failure; check it.
- **Re-parsing templates per request**: parse once at init with `template.Must`.
- **Building handlers as heavyweight structs when a function + `HandlerFunc` suffices** (Ch 12).

## Code Examples
```go
package main

import (
    "flag"
    "html/template"
    "log"
    "net/http"
)

var addr = flag.String("addr", ":1718", "http service address")
var templ = template.Must(template.New("qr").Parse(templateStr))

func main() {
    flag.Parse()
    http.Handle("/", http.HandlerFunc(QR))
    err := http.ListenAndServe(*addr, nil)
    if err != nil {
        log.Fatal("ListenAndServe:", err)
    }
}
```
- **What it demonstrates**: the canonical Go HTTP server skeleton - flags, a `HandlerFunc`-registered handler, `ListenAndServe`, and fatal error handling.

## Worked Example
The whole program is the worked example: a "web re-server" that takes a short piece of text, calls Google's chart service to render a QR code, and returns the image. The flow: `main` parses `-addr`, registers `QR` (a plain function adapted by `http.HandlerFunc`) at `/`, and serves. `QR` reads the request, builds the chart-API URL with the user's text, and uses `templ` (parsed once at startup via `template.Must`) to render an HTML page that embeds that URL - so a phone's camera can read the resulting QR code as a URL. The program exercises nearly every prior chapter: formatting/naming conventions in its layout, `flag` and `init`-style setup, `io.Writer` via `ResponseWriter`, the `HandlerFunc` interface adapter, and `log.Fatal` error handling. Lesson: a real Go server is short because the idioms compose.

## Key Takeaways
1. Register a plain function as a handler with `http.HandlerFunc(f)`.
2. Configure with `flag`; parse in `main`; start with `http.ListenAndServe`.
3. Treat `ListenAndServe`'s returned error as fatal (`log.Fatal`).
4. Parse templates once at init with `template.Must`; never per request.
5. `ResponseWriter` is an `io.Writer` - `fmt.Fprint` writes responses.

## Connects To
- **Ch 12 (Interfaces)**: `HandlerFunc` adapts a function into an `http.Handler`.
- **Ch 9 (Data)**: `ResponseWriter` satisfies `io.Writer`, so `fmt.Fprint` works on it.
- **Ch 16 (Errors)**: `log.Fatal` on server failure; `template.Must`'s startup `panic` is the legitimate init exception.
- **Ch 10 (Initialization)**: package-level `var` declarations (`addr`, `templ`) run before `main`.
