# Cheatsheet — *A Philosophy of Software Design*

Decision aid, not a term list. Use it to *act* the way Ousterhout would.

## The 16 Design Principles (the author's own, as decision rules)
1. **Complexity is incremental** → sweat the small stuff; refuse "just one kludge."
2. **Working code isn't enough** → your goal is a great design that also works.
3. **Invest continually, in small amounts** → ~10–20% of dev time, every day.
4. **Make modules deep** → maximize functionality per unit of interface.
5. **Make the common case simplest** → design interfaces for the most common usage.
6. **Simple interface > simple implementation** → let the implementation suffer so callers don't.
7. **Prefer general-purpose modules** → "somewhat general": functionality for today, interface for many uses.
8. **Separate general-purpose from special-purpose code** → push specialization up or down.
9. **Different layer, different abstraction** → if a layer just forwards, it doesn't earn its keep.
10. **Pull complexity downward** → absorb it; don't punt to many callers.
11. **Define errors out of existence** → redefine semantics before throwing.
12. **Design it twice** → compare ≥2 radically different alternatives.
13. **Comments describe the non-obvious** → never repeat the code.
14. **Design for reading, not writing** → spend writer-minutes to save every reader.
15. **Develop in abstraction-sized increments** → not feature-sized.
16. **Decide what matters** → minimize it, then emphasize it.

## The 14 Red Flags (stop and redesign when you see one)
Shallow Module · Information Leakage · Temporal Decomposition · Overexposure · Pass-Through Method · Repetition · Special-General Mixture · Conjoined Methods · Comment Repeats Code · Implementation Docs Contaminate Interface · Vague Name · Hard to Pick Name · Hard to Describe · Nonobvious Code.

## Thresholds & defaults
- **Investment budget**: ~10–20% of dev time, continually (not big up-front).
- **Payback horizon**: ~6–18 months (tied to how fast devs forget what they wrote).
- **Comment-time budget**: typing is ~10% of dev time; comments ~5% — don't claim "no time."
- **Per-chapter design-it-twice cost**: ~1–2 hrs for a class vs. days/weeks implementing.
- **Exception handling**: mask *low*, aggregate *high*; crash for unrecoverable + infrequent.
- **Naming**: ≤2–3 words; booleans are predicates; name's length ∝ distance from declaration to use.
- **Performance**: measure before *and* after; back out changes with no measurable gain.

## Decision: together or apart?
Bring **together** if any: shared information · merging simplifies the interface · eliminates duplication.
Keep **apart** if: truly independent, or general-purpose mechanism vs. special-purpose use.
Split a method only if: it yields cleaner abstractions (factor out a subtask that's understandable alone) — **not** by length. Depth > length.

## Decision: how to handle a hard condition?
1. Can I **redefine semantics** so it isn't an error? → do that (best).
2. Can a **low level** fully handle it? → mask.
3. Do many errors share one response? → **aggregate** to one high handler.
4. Unrecoverable + infrequent? → **just crash**.
5. Caller genuinely needs the info? → expose the exception (don't mask).

## Decision: is this module deep enough?
- Draw the rectangle: area = functionality, top edge = interface. Tall = deep.
- If the interface is barely simpler than the implementation → **Shallow Module**.
- If the interface comment must describe the implementation → shallow.
- A simple interface is worth a more complex implementation.

## Tells (fast situation recognition)
- "Smallest possible change" mindset → you're being **tactical**; redesign.
- Same knowledge in two classes → **information leakage**; merge or extract.
- Module structure mirrors runtime order → **temporal decomposition**; restructure by knowledge.
- Method forwards a similar signature → **pass-through**; redistribute or merge.
- You can't name it cleanly → design is muddy; refactor.
- Comment is hard to write simply → **Hard to Describe**; fix the design.
- Reviewer says "not obvious" → it isn't; don't argue, clarify.
- A config knob for a value you could compute → punt; pull it down.

## The one-sentence test
**Does this reduce overall system complexity?** If not — for any "trend," pattern, split, abstraction, or optimization — don't do it.
