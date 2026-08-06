# Chapter 3: Formatting

## Core Idea
Formatting issues are the most contentious but least consequential. Go's unusual approach: let the machine handle formatting. `gofmt` reads a Go program and emits it in a standard style (indentation, vertical alignment, reformatted comments), so the whole community adheres to one style without a long prescriptive guide. If `gofmt`'s answer seems wrong, rearrange your program (or file a bug) - don't work around it.

## Frameworks Introduced
- **`gofmt` (and `go fmt`)**: The canonical formatter.
  - When to use: Always - it is the single source of truth for layout.
  - How: Run `gofmt` on a source file, or `go fmt` at the package level. All standard package code is `gofmt`-formatted.
- **Don't fight the formatter**: If a layout looks wrong, the fix is to restructure the code, not to hand-align.
  - When to use: When `gofmt` produces surprising output.
  - How: Rearrange the declaration so the natural formatting reads well.

## Key Concepts
- **Indentation**: Tabs by default (what `gofmt` emits). Use spaces only if you must.
- **Line length**: Go has *no* line length limit. If a line feels too long, wrap it and indent with an extra tab.
- **Parentheses**: Go needs fewer than C/Java. Control structures (`if`, `for`, `switch`) take no parentheses; the operator-precedence hierarchy is shorter and clearer.

## Mental Models
- Think of formatting as *solved*: the only winning move is to delegate to `gofmt` and never argue about it in code review.
- Think of `x<<8 + y<<16` as meaning exactly what the spacing implies - spacing is meaningful because precedence is minimal.

## Anti-patterns
- **Hand-aligning comments or columns**: `gofmt` does this for you; manual alignment is wasted effort and will be overwritten.
- **Adding parentheses to `if`/`for`/`switch`**: Not idiomatic; they aren't in the syntax.

## Code Examples
```go
// What you write:
type T struct {
    name string // name of the object
    value int // its value
}

// What gofmt emits (columns aligned):
type T struct {
    name    string // name of the object
    value   int    // its value
}
```
- **What it demonstrates**: `gofmt` aligns field types and comments into clean columns - you never align these by hand.

## Worked Example
A field-alignment decision: you write a struct with unaligned trailing comments and run `gofmt`. The tool inserts whitespace so `string`/`int` and the comments line up vertically. The lesson applied to *your* code: write the fields in any spacing, run `gofmt` (or save with format-on-save), and stop thinking about alignment entirely. If you dislike the result (e.g., a struct feels too wide), the response is to *split or rename fields*, not to override the formatter.

## Key Takeaways
1. Run `gofmt`; never hand-format. `go fmt` does it at package level.
2. Tabs for indentation; no line-length limit; no parentheses on control structures.
3. If `gofmt`'s output looks wrong, change the code structure - don't work around the tool.
4. Minimal operator precedence means spacing reflects grouping; `x<<8 + y<<16` reads as written.

## Connects To
- **Ch 4 (Commentary)**: `gofmt` retains and reformats comments, so comment placement matters.
- **Ch 5 (Names)**: formatting and naming together define the conventional look of Go code.
