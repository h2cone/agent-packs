# Chapter 8: Pull Complexity Downwards

## Core Idea
When a module contains unavoidable complexity, handle it *inside* the module rather than pushing it onto users. Modules have more users than developers, so it's better for the few developers to suffer than the many users. **A simple interface matters more than a simple implementation.**

## Frameworks Introduced
- **Pull complexity downward**
  - When to use: whenever a module faces a hard problem related to its own functionality.
  - How: absorb the hard part into the module's implementation so callers get a simple interface. The tempting opposite - throwing an exception or exporting a config parameter - amplifies the problem across every caller/admin.
- **"Simple interface > simple implementation"**
  - When to use: choosing where a hard case lives.
  - How: it's fine (good, even) for the implementation to get more complex if that simplifies the interface and the rest of the system. Overall system complexity is what matters.
- **Avoid configuration parameters** (complexity pushed *upward*)
  - When to use: before exposing a knob.
  - How: config params force every user/admin to learn and set values they often can't determine. Prefer auto-computing the value (e.g. retry interval from measured response time) and providing defaults so callers act only in exceptional cases. Ask: "Can the user really pick a better value than we can here?" Each module should solve a problem *completely*; config params are an incomplete solution.
- **Taking it too far**
  - When to use: before absorbing complexity.
  - How: pull complexity down only if (a) it's closely related to the class's existing functionality, (b) it simplifies things elsewhere, and (c) it simplifies the class's interface. Pulling *unrelated* complexity down (e.g. UI backspace behavior into the text class) just causes information leakage.

## Key Concepts
- **Developers suffer so users don't**: the asymmetry (few developers, many users) justifies extra implementation work.
- **Config parameter**: an exported value controlling behavior; often punted complexity.
- **Auto-computed/defaulted behavior**: the module "does the right thing" without being asked.
- **Incomplete solution**: a module that offloads decisions to its callers.

## Mental Models
- When unsure how to handle a condition, the easy move (throw/punt) is usually the wrong one - it multiplies the problem.
- A knob is a confession: "I couldn't decide, so I'm making N callers decide."
- Optimize for the system, not for your own module's implementation simplicity.

## Anti-patterns
- **Exporting config parameters** that the module could compute or default itself.
- **Throwing exceptions** for conditions the module could reasonably handle.
- **Pulling down unrelated complexity**: absorbing logic that doesn't belong to the module, creating leakage.

## Worked Example
The editor text class, two interfaces:
- *Line-oriented* (simple implementation, complexity pushed *up*): methods read/insert/delete whole lines. Implementation is easy, but UI keystrokes and selections rarely align to whole lines, so higher-level code must constantly split and join lines.
- *Character/range-oriented* (complexity pulled *down*): `insert`/`delete` on arbitrary ranges. The UI gets simpler; the text class implementation gets harder (it must split/merge lines internally) - but that complexity is now encapsulated in one place instead of scattered across the UI.

Config-parameter contrast: a network protocol's retry interval could be a config parameter (every deployer must guess), or *computed* from the measured response time of successful requests (pulled downward, dynamically self-tuning, never stale).

## Key Takeaways
1. Absorb unavoidable complexity into the module; don't punt it to many callers.
2. A simple interface is worth a more complex implementation.
3. Avoid config parameters; auto-compute or default wherever possible.
4. Pull complexity down only when it's related and actually simplifies the system.
5. Take a little extra suffering on yourself to reduce your users' suffering.

## Connects To
- **Ch 4**: pulling complexity down is how modules get deep.
- **Ch 5**: pulling *unrelated* complexity down causes information leakage (taking it too far).
- **Ch 10**: masking exceptions is pulling complexity downward.
- **Ch 21**: expose what matters, hide what doesn't - the criterion for what to pull down.
