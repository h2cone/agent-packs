# Architecture judgment (Nystrom, Ch 2)

Use this when deciding *whether* more structure helps — before naming a pattern. Source: *Game Programming Patterns*, Chapter 2.

## Core idea

**Good architecture = ease of change**, not interface count. Most change cost is the *learning* phase (loading enough code to act safely). Decoupling shrinks that mental working set and limits ripples. Abstraction is not free: wrong guesses (**YAGNI**) fill the cache with empty scaffolding.

## Principles for recommendations

| Principle | Practice during diagnosis |
|-----------|---------------------------|
| Architecture is ease of change | Prefer the change that shrinks what must be loaded next time |
| YAGNI | Don't recommend seams nobody will use this milestone |
| Flexibility first, then tear out | Soft structure while design moves; hard opts only after measured pain |
| Prototype, then rewrite | Slapdash is fine to answer fun; shipping temp code is the failure |
| Simplicity is the solvent | Distilled general solution over special-case piles |
| Patterns are tools, not goals | Apply only when When-to-Use holds |
| Decoupling has a cost | Every indirection taxes learning *and* performance |
| Optimization is evidence-based | Profile → hot path → structural pattern |

## Three speeds (balance; no free winner)

| Goal | Improves | Typical cost |
|------|----------|--------------|
| Nice architecture | Long-term understanding & change | Design/cleanup effort |
| Runtime performance | Frame time / throughput | Engineering time; inflexibility |
| Ship today's feature | Short-term velocity | Mess and future drag if never cleaned |

## Binding time (flexibility vs cost)

| When bound | Mechanism | Flexibility | Runtime cost |
|------------|-----------|-------------|--------------|
| Author time | Concrete call | Lowest | Lowest |
| Compile time | Templates / generics | Medium | Often zero |
| Runtime | Virtuals, messages, interfaces | Highest | Some overhead |

Prefer flexible binding while the design is still moving; lock assumption-heavy opts late.

## Anti-patterns (reject or flag)

- **Engine for its own sake** — interfaces/plugins with no shipping gameplay
- **Death by a thousand hacks** — "just one tiny hack" every day; never weed
- **Premature hard optimization** — calcifies assumptions while design still moves
- **Prototype laundering** — temp code that ships after "a few hours of cleanup"
- **Use-case laundry lists** — one conditional path per imagined case

## One-sentence tests

1. **Does this reduce what I must load to change the code?** If not, the "architecture" isn't helping.
2. **Is the bottleneck measured and matched?** If not, don't apply an optimization pattern.
3. **Am I buying both single-instance and global access?** If you only need one, don't take Singleton.
