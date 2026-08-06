# Chapter 7: Control structures

## Core Idea
Go's control structures resemble C's but differ in important ways: no `do` or `while` (only a generalized `for`); a more flexible `switch`; `if` and `switch` accept an optional initialization statement; `break`/`continue` take an optional label; and there are new structures - the type switch and the multiway `select`. Syntax: no parentheses around conditions, and braces are always mandatory.

## Frameworks Introduced
- **`if`/`switch` with init statement**: A short statement before the condition, scoped to the control structure.
  - When to use: Setting up a local (often `err`) right where it's tested.
  - How: `if err := file.Chmod(0664); err != nil { ... }`.
- **Omit `else` when the body terminates**: If the body ends in `break`/`continue`/`goto`/`return`, drop the `else` - let the successful flow run down the page, eliminating error cases as they arise.
  - When to use: Guarding a sequence of error conditions.
  - How: Each guard returns early; the "happy path" is the un-indented tail of the function.
- **`for` unifies `for`/`while`/`do-while`**: Three forms, only one with semicolons.
  - When to use: Every loop.
  - How: `for init; cond; post {}` (C for), `for cond {}` (C while), `for {}` (C `for(;;)`).
- **`range` for iteration**: Over array, slice, string, map, or channel.
  - When to use: Walking a collection.
  - How: `for k, v := range x {}`; drop the second to get only key/index; use `_` to discard the first and keep only the value.
- **`switch` on `true`**: A switch with no expression switches on `true` - the idiomatic `if-else-if` chain.
  - When to use: Multi-branch conditions.
  - How: `switch { case 'a' <= c && c <= 'f': ... }`. No automatic fallthrough; cases can be comma-separated lists.
- **Labeled `break`/`continue`**: A label lets `break` exit an *outer* loop, not the inner `switch`.
  - When to use: Breaking out of a loop from inside a `switch`.
  - How: Put a label on the loop; `break Loop`.
- **Type switch**: Discovers the dynamic type of an interface value.
  - When to use: Branching on an interface's concrete type.
  - How: `switch t := t.(type) { case bool: ... case int: ... }` - in each clause `t` has that clause's type.

## Key Concepts
- **`:=` redeclaration**: In a `:=` declaration a variable may appear even if already declared, provided it's the same scope, the value is assignable to it, and at least one *other* variable is newly created. This lets one `err` flow through an `if-else` chain.
- **`range` over a string** decodes UTF-8, yielding `pos, rune`; bad encodings consume one byte and yield `U+FFFD`.
- **No comma operator; `++`/`--` are statements, not expressions**: To advance multiple loop vars, use parallel assignment (`i, j = i+1, j-1`).

## Mental Models
- Think of error handling as "peel off the bad cases at the top, return, and let the good code flow straight down" - no nested `else`.
- Think of `switch { ... }` as a cleaner `if-else-if` ladder where each `case` is a boolean expression.
- Think of `break` inside a `switch` as breaking the *switch*; to break the loop, label it.

## Anti-patterns
- **Nesting happy-path code inside `else` after a guard that returns**: Drop the `else`.
- **Using `if-else-if` chains where a `switch {}` reads better**.
- **Expecting fallthrough in `switch`**: Go has none (use comma-separated cases instead).
- **Forgetting the loop-variable capture bug**: pre-1.22, the loop variable is shared across goroutines (closures capture one variable).

## Code Examples
```go
// Omit else: error cases return early, happy path runs down the page
f, err := os.Open(name)
if err != nil {
    return err
}
d, err := f.Stat() // err is re-assigned, not redeclared
if err != nil {
    f.Close()
    return err
}
codeUsing(f, d)

// switch on true (idiomatic if-else-if), comma-separated cases, no fallthrough
func shouldEscape(c byte) bool {
    switch c {
    case ' ', '?', '&', '=', '#', '+', '%':
        return true
    }
    return false
}

// Labeled break to escape an outer loop from inside a switch
Loop:
    for n := 0; n < len(src); n += size {
        switch {
        case src[n] < sizeTwo:
            if n+1 >= len(src) {
                err = errShortInput
                break Loop // breaks the for, not the switch
            }
        }
    }
```
- **What it demonstrates**: early-return guards, `switch` as condition ladder, and labeled `break` disambiguating switch-vs-loop.

## Reference Tables
| `for` form | Equivalent | Semicolons? |
|---|---|---|
| `for init; cond; post {}` | C `for` | yes |
| `for cond {}` | C `while` | no |
| `for {}` | C `for(;;)` | no |

| `range` need | Syntax |
|---|---|
| key + value | `for k, v := range x` |
| key only | `for k := range x` |
| value only | `for _, v := range x` |

## Worked Example
Turning an `if-else-if` chain into a `switch` and using a type switch. The `unhex` function maps a hex byte to its value:
```go
func unhex(c byte) byte {
    switch {
    case '0' <= c && c <= '9':
        return c - '0'
    case 'a' <= c && c <= 'f':
        return c - 'a' + 10
    case 'A' <= c && c <= 'F':
        return c - 'A' + 10
    }
    return 0
}
```
And a type switch that gives each clause a typed variable:
```go
var t interface{}
t = functionOfSomeType()
switch t := t.(type) {
case bool:
    fmt.Printf("boolean %t\n", t)   // t has type bool here
case int:
    fmt.Printf("integer %d\n", t)   // t has type int here
default:
    fmt.Printf("unexpected type %T\n", t)
}
```
Applied: prefer `switch {}` over a long `if-else-if`; prefer a type switch over a chain of `value.(type)` assertions when you branch on more than one concrete type.

## Key Takeaways
1. `if`/`switch` take an init statement; use it to scope `err` to its test.
2. Drop `else` when the guard returns - keep the happy path un-indented.
3. `for` is the only loop; `range` iterates collections and decodes strings to runes.
4. `switch` switches on `true` when given no expression; no fallthrough; comma-separated cases.
5. Use a label to `break` an outer loop from inside a `switch`.
6. `:=` lets one `err` be reused across successive guards in the same scope.

## Connects To
- **Ch 6 (Semicolons)**: the brace-on-same-line rule shapes how these structures are written.
- **Ch 8 (Functions)**: the `:=` reassignment of `err` pairs with multiple-return-value functions.
- **Ch 12 (Interfaces)**: type switches and type assertions operate on interface values.
