# Chapter 9: Data

## Core Idea
Go has two allocation primitives, `new` and `make`, that look similar but do different things: `new` zeros memory and returns a pointer; `make` initializes slices, maps, and channels and returns a (non-pointer) value. Around them, Go leans on *composite literals* for construction, *slices* (not arrays) for sequences, *maps* with the comma-ok idiom for lookups, and a rich `fmt` verb set for printing. Designing types so their *zero value is usable* is the thread that makes `new` and literals feel effortless.

## Frameworks Introduced
- **`new(T)` - allocate zeroed, return `*T`**: Allocates memory but does not *initialize* it, only *zeros* it.
  - When to use: You want a pointer to a fresh zero value of `T`.
  - How: `new(T)` returns `*T` pointing at zeroed storage. (Go 1.26+: `new(int64(300))` can also take a value expression to set the initial value.)
- **Design for usable zero values**: Arrange that a type's zero value works without further initialization.
  - When to use: Designing any exported type.
  - How: `bytes.Buffer`'s zero value is ready to use; `sync.Mutex`'s zero value is an unlocked mutex. Works transitively: a struct embedding these is also ready on `new`.
- **Composite literals - construct in place**: An expression that creates a new instance each time it's evaluated.
  - When to use: Constructing structs/slices/maps/arrays with initial values.
  - How: `&File{fd, name, nil, 0}`; with `field:value` pairs the order is free and missing fields are zero (`&File{fd: fd, name: name}`); `&File{}` == `new(File)`. For arrays/slices/maps the labels are indices/keys: `[]string{Enone: "no error", ...}`.
- **`make(T, args)` - initialize slices/maps/channels, return `T`**: Returns an *initialized* (not zeroed) value of type `T` (not `*T`), because these types are references to internal structures that must be set up before use.
  - When to use: Creating slices, maps, channels.
  - How: `make([]int, 10, 100)` -> length 10, capacity 100. `make` only for these three types and never returns a pointer; use `new` or `&x` for a pointer.
- **Prefer slices over arrays**: Arrays are values (assigning copies all elements; size is part of the type), so they're mainly a building block for slices.
  - When to use: Almost always use slices; arrays only for fixed memory layout.
  - How: A slice is a 3-word descriptor (pointer, length, capacity); assigning a slice shares the underlying array, so element changes are visible to the caller (like passing a pointer).
- **`append` - grow a slice, reassign the result**: `append(slice, elems...)` appends and returns the (possibly reallocated) slice.
  - When to use: Adding elements to a slice.
  - How: Always reassign: `x = append(x, 4, 5, 6)`. To append a slice: `x = append(x, y...)`. The result must be returned because the slice descriptor is passed by value.
- **Map comma-ok idiom**: Distinguish a missing key from a zero value.
  - When to use: When a present key's value could legitimately be the zero value.
  - How: `seconds, ok := timeZone[tz]`; presence-only: `_, present := timeZone[tz]`. Missing keys return the zero value; `delete(m, key)` is safe even if the key is absent.

## Key Concepts
- **`cap`**: a slice's capacity (max length within the underlying array); `len`/`cap` are legal on a `nil` slice and return 0.
- **Slices passed by value**: the descriptor (pointer/len/cap) is copied, so a function that resizes must return the new slice.
- **Map keys**: any type with `==` defined (ints, strings, pointers, structs, arrays) - *not* slices.
- **`rune`**: Go's term for a single Unicode code point.
- **`Stringer`**: define `String() string` to control `%v`/`%s` formatting of a custom type.

## Mental Models
- `new` = "give me a pointer to zeroed memory"; `make` = "set up a ready-to-use slice/map/channel."
- Think of a slice as a view onto an array you usually don't name; growing it may move the backing array, so always take the returned slice.
- Think of a map lookup as always returning *something* (the zero value if absent); use comma-ok when "absent" matters.

## Anti-patterns
- **`new([]int)` then using it as a slice**: returns a pointer to a `nil` slice - rarely useful; use `make`.
- **`var p *[]int = new([]int); *p = make(...)` then `*p`**: unnecessarily complex; just `v := make([]int, 100)`.
- **Ignoring `append`'s return value**: the reallocation is lost.
- **`Sprintf("%s", m)` inside a `String()` method on a string type**: recurses forever - convert to `string` first.
- **Using arrays where you mean slices**: passing an array copies it; sizes are distinct types.

## Code Examples
```go
// new vs make
var p *[]int = new([]int)        // *p == nil; rarely useful
var v  []int = make([]int, 100)  // v refers to a new array of 100 ints

// Idiomatic: just make
v := make([]int, 100)

// Composite literal with field labels (order-free, missing = zero)
return &File{fd: fd, name: name}

// Map: comma-ok idiom and a set-as-bool
attended := map[string]bool{"Ann": true, "Joe": true}
if attended[person] { /* false if person absent */ }

if seconds, ok := timeZone[tz]; ok {
    return seconds
}

// append: reassign; append a slice with ...
x := []int{1, 2, 3}
y := []int{4, 5, 6}
x = append(x, y...)
```
- **What it demonstrates**: the `new`/`make` distinction, labeled literals, comma-ok, and slice-append reassignment.

## Reference Tables
| | `new(T)` | `make(T, args)` |
|---|---|---|
| Returns | `*T` (pointer) | `T` (value) |
| Memory | zeroed | initialized |
| Applies to | any type | slices, maps, channels only |
| Typical use | pointer to zero value | ready-to-use ref type |

| Verb | Meaning |
|---|---|
| `%v` | default value format |
| `%+v` | struct with field names |
| `%#v` | full Go syntax |
| `%T` | type of the value |
| `%q` | quoted string / `[]byte` / rune |
| `%#q` | back-quoted string if possible |
| `%x`, `% x` | hex of string/bytes/ints (with spaces) |

## Worked Example
Why `append` must return its slice - shown by a hand-written `Append` that reallocates when capacity is exceeded:
```go
func Append(slice, data []byte) []byte {
    l := len(slice)
    if l+len(data) > cap(slice) { // reallocate
        newSlice := make([]byte, (l+len(data))*2) // double for growth
        copy(newSlice, slice)
        slice = newSlice
    }
    slice = slice[0 : l+len(data)]
    copy(slice[l:], data)
    return slice
}
```
Although `Append` can modify the slice's *elements* (they share the backing array), the slice *descriptor* (pointer/len/cap) is passed by value, so the resize is lost unless the caller reassigns: `slice = Append(slice, data)`. This is exactly why the built-in `append` is built in (its `T` is caller-determined) and why you always write `x = append(x, ...)`.

## Key Takeaways
1. `new` zeros and returns a pointer; `make` initializes and returns a value, for slices/maps/channels only.
2. Design types whose zero value is immediately usable; it composes transitively.
3. Use composite literals (with `field:value` labels) for construction; `&T{}` == `new(T)`.
4. Prefer slices over arrays; always reassign the result of `append`.
5. Map lookups return the zero value for missing keys; use comma-ok when absence matters.
6. Master `fmt` verbs (`%v`, `%+v`, `%#v`, `%T`, `%q`) and the `Stringer` interface - but avoid the `String()` recursion trap.

## Connects To
- **Ch 10 (Initialization)**: composite literals and `make`/`new` feed into constant and variable initialization.
- **Ch 11 (Methods)**: `String()` and `Write` are methods defined on named types like `ByteSize`.
- **Ch 13 (The blank identifier)**: `_` discards the unwanted half of a range or comma-ok.
