# Chapter 6: Semicolons

## Core Idea
Go's formal grammar uses semicolons to terminate statements, but they do not appear in the source. The lexer inserts them automatically using a simple rule. The practical consequence: idiomatic Go is almost semicolon-free, and the opening brace of a control structure *must* be on the same line as the keyword.

## Frameworks Introduced
- **Automatic semicolon insertion**: The lexer inserts a semicolon when the last token before a newline is an identifier, a basic literal (number/string), or one of `break continue fallthrough return ++ -- ) }`.
  - When to use: Understanding why your code does/doesn't need semicolons.
  - How: Rule of thumb - "if the newline comes after a token that could end a statement, insert a semicolon."
- **Brace-on-same-line (forced by the rule)**: Because a semicolon is inserted before a `}` ... actually before a brace placed on the next line, you cannot put the opening brace of `if`/`for`/`switch`/`select` on the next line.
  - When to use: Writing any control structure.
  - How: Always open the brace on the same line as the keyword.

## Key Concepts
- **Semicolon before closing brace can be omitted**: e.g. `go func() { for { dst <- <-src } }()` needs no semicolons.
- **Where semicolons *do* appear in idiomatic Go**: `for` loop clauses (separating init/condition/post), and separating multiple statements on one line.

## Mental Models
- Think of the newline as a potential statement terminator: the lexer ends a statement when the line ends with something that "could" end one.
- Think of brace placement as *non-negotiable*: it falls out of the insertion rule, not mere style.

## Anti-patterns
- **Opening brace on the next line (C/Java style)**:
```go
if i < f()  // wrong!
{           // wrong! - semicolon inserted before brace
    g()
}
```
- **Sprinkling semicolons everywhere**: Unnecessary; let the lexer handle it.

## Code Examples
```go
// Correct: brace on the same line
if i < f() {
    g()
}

// Semicolons only where the grammar needs them: for-loop clauses
for i := 0; i < 10; i++ {
    sum += i
}
```
- **What it demonstrates**: braces share the keyword's line; semicolons appear only inside `for`.

## Worked Example
The "wrong" brace placement, explained mechanically. You write `if i < f()` on one line and `{` on the next. The line `if i < f()` ends with `)` - a token in the insertion list - so the lexer inserts a semicolon, turning it into `if i < f();`. The compiler now sees `if` with an unexpected `;` and a stray block, which "could cause unwanted effects." The fix is purely structural: move `{` to the end of the `if` line. Lesson: this isn't a style preference you can override - the insertion rule makes next-line braces a syntax hazard.

## Key Takeaways
1. Semicolons are inserted automatically; don't write them.
2. Insertion rule: a `;` follows a newline ending in an identifier, literal, or `break continue fallthrough return ++ -- ) }`.
3. Opening braces of `if`/`for`/`switch`/`select` must be on the keyword's line.
4. Idiomatic semicolons live only in `for` clauses or between statements on one line.

## Connects To
- **Ch 7 (Control structures)**: the brace-placement rule directly shapes how control structures are written.
- **Ch 3 (Formatting)**: `gofmt` enforces the resulting layout automatically.
