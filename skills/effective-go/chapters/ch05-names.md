# Chapter 5: Names

## Core Idea
Names matter in Go and even have *semantic effect*: visibility outside a package is determined by whether the first character is upper case. Good Go naming follows conventions that let exported names avoid stutter, let one-method interfaces be recognized instantly, and let getters read naturally - all without underscores.

## Frameworks Introduced
- **Package names: short, lower-case, single word**: The package name is the accessor for its contents, so it must be good - short, concise, evocative.
  - When to use: Naming any package.
  - How: lower case, single word, no underscores or mixedCaps; equal to the base name of its source directory (`encoding/base64` -> package `base64`, not `encoding_base64`). Err on brevity; everyone types this name. Don't worry about collisions a priori - the import path disambiguates, and the importer can rename locally.
- **Don't repeat the package name in exported names**: Because users write `pkg.Name`, the name shouldn't restate the package.
  - When to use: Naming exported types/functions.
  - How: `bufio.Reader` (not `BufReader`); the constructor is `New` (seen as `ring.New`) when the package exports only one type, else `NewRing`. `once.Do(setup)` reads well; `once.DoOrWaitUntilDone(setup)` does not. A doc comment often beats a long name.
- **Getter naming: drop `Get`**: Go has no auto getters/setters; when you write them, don't put `Get` in the getter name.
  - When to use: Providing accessors for an unexported field.
  - How: field `owner` -> getter `Owner()` (upper-case = exported), setter `SetOwner(user)`. The capitalization distinguishes field from method.
- **Interface naming: method + `-er` suffix**: One-method interfaces are named by the method plus an `-er` (or similar) agent noun.
  - When to use: Naming a single-method interface.
  - How: `Reader`, `Writer`, `Formatter`, `CloseNotifier`. Honor canonical names/signatures (`Read`, `Write`, `Close`, `Flush`, `String`); give your method the same name and signature if it has the same meaning (`String`, not `ToString`).
- **MixedCaps, not underscores**: Multiword names use `MixedCaps` (exported) or `mixedCaps` (unexported), never underscores.

## Key Concepts
- **Export via capitalization**: First letter upper-case = exported; lower-case = package-private. This is the visibility rule, not just convention.
- **Package name = directory base name**: `src/encoding/base64` imports as `"encoding/base64"` with name `base64`.
- **`import .`**: Allowed for tests run outside the tested package, but otherwise avoided.

## Mental Models
- Read exported names *as the user types them*: `bufio.Reader`, `ring.New`, `once.Do`. If it stutters or reads awkwardly in that form, rename.
- Think of an interface name as "the doer of the method": a `Reader` is anything with `Read`.

## Anti-patterns
- **`GetOwner` for a getter**: Redundant; use `Owner`.
- **`BufReader` in package `bufio`**: Stutters as `bufio.BufReader`.
- **`ToString` instead of `String`**: Breaks the canonical contract readers expect.
- **Underscores in names**: Not Go style; use MixedCaps.
- **Avoiding collisions by inventing long unique package names**: Unnecessary; import paths handle uniqueness.

## Code Examples
```go
// Getter/setter without "Get"
owner := obj.Owner()
if owner != user {
    obj.SetOwner(user)
}

// Constructor collapses to New when the package exports one type
// package ring: clients call ring.New, not ring.NewRing
```
- **What it demonstrates**: Capitalization provides the field/method distinction, so `Owner` (method) is unambiguous next to `owner` (field).

## Worked Example
Naming a buffered reader in package `bufio`: the type is `Reader`, so users write `bufio.Reader` - clear and concise, and it doesn't conflict with `io.Reader` because the package name always qualifies it. The constructor for `ring.Ring` is just `New` (seen as `ring.New`) because `Ring` is the only exported type. Applied to your package: if you export a single primary type, name its constructor `New`; if you export several, qualify (`NewRing`, `NewBuffer`). Resist `DoOrWaitUntilDone`-style verbosity - a doc comment carries the nuance a long name cannot.

## Key Takeaways
1. Capitalization *is* visibility: upper-case first letter = exported.
2. Package names: lower-case, single word, match the directory base name, favor brevity.
3. Exported names should not repeat the package name (`bufio.Reader`, `ring.New`).
4. Getters drop `Get` (`Owner`); setters use `Set` (`SetOwner`).
5. One-method interfaces: method + `-er` (`Reader`, `Writer`); reuse canonical names/signatures.
6. MixedCaps, never underscores.

## Connects To
- **Ch 12 (Interfaces)**: the `-er` naming convention underpins Go's small interfaces.
- **Ch 3 (Formatting)** and **Ch 4 (Commentary)**: names, formatting, and comments together define conventional Go.
