# Chapter 10: Define Errors Out Of Existence

## Core Idea
Exception handling is one of the worst sources of complexity - special-case code that's hard to write, read, and test ("code that hasn't been executed doesn't work"). Reduce the *number of places* exceptions must be handled. The four techniques, best first: **define errors out of existence**, **mask**, **aggregate**, or **just crash**.

## Frameworks Introduced
- **Why exceptions add complexity**
  - When to use: to resist adding exceptions.
  - How: exception code disrupts normal flow; recovery can introduce *secondary* exceptions (resending a "lost" packet that was merely delayed → duplicates); language mechanisms are verbose; handlers are hard to test and rarely run. >90% of catastrophic distributed-system failures come from *incorrect error handling*.
- **Too many exceptions** (over-defensive style)
  - When to use: reviewing a class's thrown exceptions.
  - How: "detect more errors" is a misread - thrown exceptions are part of the interface and propagate through stack levels, shallowing the class. Throwing is easy; handling is hard. (Author's own regret: Tcl's `unset` errored on a missing variable, forcing callers to wrap it in `catch`.)
- **1. Define errors out of existence** (best)
  - When to use: when semantics can be redefined so the condition isn't an error.
  - How: redefine the operation's contract. `unset` should "ensure the variable doesn't exist" (no-op if absent), not "delete the variable" (error if absent).
- **2. Mask exceptions**
  - When to use: when a low level can fully handle the condition so higher levels never see it.
  - How: detect and handle at a low level (TCP resends lost packets; NFS retries/hangs on server failure). Deepens the class - fewer exceptions in the interface, more functionality inside. (Opposite of aggregation, which handles high up.)
- **3. Aggregate exceptions**
  - When to use: when many distinct errors warrant the same response.
  - How: let exceptions propagate to one top-level handler rather than catching each locally. Web server: one dispatcher handler catches all `NoSuchParameter`/bad-value/permission errors and renders an error response using a message carried in the exception. **Promote** many small errors into one larger recovery (RAMCloud crashes a server on a corrupted object, reusing the crash-recovery path - one mechanism instead of many). Best when an exception propagates several levels.
- **4. Just crash**
  - When to use: for errors that are infrequent, unrecoverable, and not worth handling (out-of-memory, hard I/O errors, inconsistent internal state).
  - How: abort with a clear message rather than cascade. `malloc` returning `NULL` forces every caller to check - better a `ckalloc` wrapper that aborts. Whether crashing is OK depends on the app (a replicated storage system *must* recover; a CLI tool can crash).
- **Taking it too far**: only define-away/mask when the exception info *isn't needed outside* the module. A network module that swallowed *all* errors left callers unable to detect lost messages - essential info must be exposed.

## Key Concepts
- **Exception**: any uncommon condition altering normal control flow (formal throw, or a special return value).
- **Secondary exceptions**: handling an exception can create new ones (resends → duplicates).
- **Exception as interface element**: propagates across levels, more complex than a normal parameter.
- **Masking vs. aggregation**: mask *low* (one library method hides a condition from many callers); aggregate *high* (one handler serves many sources).
- **Error promotion**: convert many small errors into one bigger error handled by one existing mechanism.

## Mental Models
- "Throwing is easy; handling is hard" - so minimize handlers, not throw sites.
- Before throwing, ask: "Could I redefine the semantics so this isn't an error?"
- Replace several special-purpose handlers with one general-purpose mechanism (aggregation echoes Ch 6's generality).
- If callers can't do anything useful with an exception, don't make them handle it (mask or crash).

## Anti-patterns
- **Over-defensive throwing**: rejecting anything suspicious, bloating interfaces.
- **Per-call handlers** that duplicate the same recovery logic (aggregate instead).
- **Masking essential errors**: swallowing exceptions callers actually need.
- **Trying to handle unrecoverable errors** like out-of-memory, adding complexity for no benefit.

## Worked Example
- *Define away* — `unset`: contract "delete variable" errors if absent (callers wrap in `catch`); contract "ensure variable doesn't exist" is a no-op if absent → no error.
- *Define away* — file deletion: Windows errors if the file is open (users hunt processes or reboot); Unix *marks for deletion* and returns success, freeing data only after the last handle closes - defining away both the delete error and the in-use errors for other processes.
- *Define away* — `substring`: Java throws `IndexOutOfBoundsException`, forcing 5–10 lines of clamping; a clamped API ("return chars with index in [begin,end)") is deeper, like Python slices.
- *Aggregate* — web server: per-`getParameter` handlers (duplicated) → one top-level dispatcher handler rendering an error response from the exception's message.
- *Aggregate/promote* — RAMCloud: corrupted object → crash the server, reusing the (unavoidable) crash-recovery mechanism; fewer mechanisms, and recovery runs more often so its bugs surface.

## Key Takeaways
1. Exceptions are a major complexity source; reduce the number of places they're handled.
2. Best technique: redefine semantics so the error can't occur (define it out of existence).
3. Else: mask at a low level, aggregate many into one handler, or just crash for unrecoverable errors.
4. Don't over-throw; exceptions are part of your interface and shallows your class.
5. Expose exceptions when the information is genuinely needed outside the module.

## Connects To
- **Ch 6**: aggregation replaces special-purpose mechanisms with one general-purpose one; eliminating special cases.
- **Ch 8**: masking is pulling complexity downward.
- **Ch 2**: special-case code feeds obscurity and unknown unknowns.
- **Ch 21**: hide what doesn't matter, expose what does - the test for masking.
