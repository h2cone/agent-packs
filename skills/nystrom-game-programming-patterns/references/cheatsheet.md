# Cheatsheet — *Game Programming Patterns*

Fast decision aid for triage and trade-offs. For full pattern lenses (Recognize / Why / When / Application), use [`patterns.md`](patterns.md). For whether structure is warranted at all, use [`architecture.md`](architecture.md).

## Decision rules (when X → do Y)

1. **Architecture is ease of change** → shrink the learn-code set; decouple so one side doesn't force the other.
2. **YAGNI** → don't pay for extensibility you don't confidently need; unused seams fill mental cache.
3. **Flexibility first, then tear out** → hardcode/templates/virtuals bind later as design settles; premature hard opts calcify.
4. **Prototype, then rewrite** → slapdash answers fun questions; shipping "temp" code is the failure mode.
5. **Simplicity is the solvent** → distilled general solution over special-case piles; often less code *and* faster.
6. **Reify when calls are too early/coupled** → Command for delay/queue/undo/remap; Event for "already happened."
7. **Need who-listens decoupling only** → Observer (sync). **Also need when** → Event Queue.
8. **N huge, most fields shared** → Flyweight (immutable intrinsic). **Kinds as data** → Type Object (intent differs).
9. **Mutually exclusive modes + flag soup** → FSM / State. Orthogonal axes → concurrent machines, not product states. Need history → pushdown.
10. **Readers must never see WIP** → Double Buffer (read current / write next / swap).
11. **World moves without input** → Game Loop. Prefer **fixed sim + free render**; residual lag for interp.
12. **Many live actors** → Update Method; behavior resumes each frame (State/components hold resume).
13. **Behavior variety scale** → Subclass Sandbox (code, constrained API) → Type Object (kinds as data) → Bytecode (sandboxed scripts + front-end).
14. **God class / diamond mix** → Component by **domain**, not file size; fixed update order for shared state.
15. **Ambient service after DI fails the noise test** → Service Locator (interface + register); default null or assert.
16. **Singleton urge** → split the two asks: one instance ≠ global access. Prefer pass-in, one root, locator, or delete the manager.
17. **Optimize only measured bottlenecks** → cache misses → Data Locality; redundant derived work → Dirty Flag; alloc/fragmentation → Object Pool; proximity O(n²) → Spatial Partition.
18. **Primary changes more than derived is read** → Dirty Flag; if always need after every edit, skip it; if incremental is trivial, maintain totals instead.

## Smell → pattern triage

| Smell | First try |
|---|---|
| Input hard-wired; need remap/AI/undo/replay | Command |
| Thousands of heavy similar objects | Flyweight |
| Physics knows achievements / UI | Observer (or Event Queue if async) |
| Parallel GhostSpawner × Ghost classes | Prototype alt (callback/template) or Type Object |
| `Foo::instance()` everywhere | DI / root / Locator; assert-one if needed |
| Boolean mode pile; illegal combos | State / FSM |
| Tearing / order-dependent same-frame interactions | Double Buffer |
| Speed = hardware; physics "blows up" on dt | Game Loop (fixed step) |
| All AI stuffed in the loop | Update Method (+ Component) |
| 100 power subclasses each include audio | Subclass Sandbox |
| Recompile to tune troll HP / hundreds of kinds | Type Object |
| Entity is input+physics+render+sound | Component |
| `playSound` blocks / wrong thread / double-play | Event Queue (+ aggregate) |
| Pass Audio through every signature | Service Locator (last resort) |
| Cache misses in hot loops | Data Locality |
| Scene graph recomputes every ancestor move | Dirty Flag |
| new/delete particles fragment heap | Object Pool |
| Pairwise "who's near?" every frame | Spatial Partition |

## Trade-off matrices

### Timestep

| Style | Use when | Avoid when |
|---|---|---|
| Fixed + sleep/sync | Simple; power; won't run too fast | Frame overruns (plays slow; no catch-up) |
| Variable `update(dt)` | Soft non-physics motion | Physics, netcode, determinism |
| Fixed update + variable render | Default for sim stability | Untuned `MS_PER_UPDATE` vs low-end; uncapped catch-up |

**Default**: fixed physics/sim step; free render; cap catch-up iterations; pass residual for smooth draw.

### Singleton alternatives

| Actual need | Prefer |
|---|---|
| Convenient access | Pass argument (DI) |
| Shared toys for many subclasses | Subclass Sandbox protected ops |
| A few ambient systems | One `Game`/`World` root |
| Replaceable global find | Service Locator |
| Only "exactly one" | Assert on second ctor / statics — no `instance()` |
| "Manager" babysitter | Delete manager; methods on objects |

### Optimization (measure first)

| Bottleneck | Pattern | Pay with |
|---|---|---|
| Memory stalls | Data Locality | Less hot-path OOP flexibility |
| Same derived math many times | Dirty Flag | Extra state; stale if miss a set |
| Alloc churn / fragmentation | Object Pool | Fixed caps; full re-init discipline |
| Proximity O(n²) | Spatial Partition | Memory + move rebucket cost |

## Thresholds & defaults

- **Game loop**: non-blocking input always; fixed sim preferred for physics/net; **max catch-up** so lag can't infinite-loop.
- **Mobile power**: clamp FPS then sleep; desktop/console may race max FPS.
- **Observer**: keep notify handlers short; many observers, not single slot; unregister on teardown.
- **Flyweight**: shared objects **immutable**; N must be large enough to matter.
- **Bytecode**: stack VM is the simple default; **no front-end = incomplete**; cap stack + instruction count.
- **Type inheritance**: single parent sweet spot; multiple rare.
- **Pool**: size from real peaks; separate pools isolate failure; poison-clear in debug; GC null refs on release.
- **Spatial**: start fixed **grid** for dynamic units; hierarchy when clumps/empty space dominate; skip if *n* is tiny.
- **Data Locality**: only hot paths; pack actives; count `->` in inner loops.
- **Dirty Flag**: only if primary changes **more often** than derived is used.
- **Component**: adopt when multi-domain pain is real — not as aesthetic.

## Tells & red flags

- "Just one tiny hack" every day → death by a thousand hacks; weed continuously.
- Abstraction layers with no shipping game → engine-for-its-own-sake.
- Prototype "cleaned up in a few hours" that ships → prototype laundering.
- `notify` doing load/IO → should be queue/worker.
- Mid-frame first use of Audio/FS → lazy-init hitch.
- Update list mutate forward → skipped entities.
- Handlers enqueue without cycle rules → async thrash forever.
- Global event bus by default → Singleton-class pain, wider blast radius.
- Pool acquire without overflow policy → silent wrong behavior.
- Optimize before profile → complexity, less flexibility, often zero win.
- FSM for all advanced AI → underpowered; keep FSMs for modes/input/UI.
- Variable timestep bullet positions differ across machines → FP step-count drift.
