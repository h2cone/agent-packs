# Chapter 17: Consistency

## Core Idea
**Consistency** - similar things done in similar ways, dissimilar things in different ways - reduces complexity and makes behavior obvious by creating *cognitive leverage*: once you learn one occurrence, you instantly understand the others. Establish, enforce, and follow conventions; don't change them lightly.

## Frameworks Introduced
- **Consistency (cognitive leverage)**
  - When to use: across names, style, interfaces, patterns, and invariants.
  - How: consistency lets readers make safe assumptions from familiar-looking patterns, so they work faster with fewer mistakes. Inconsistency makes two different things look the same (false assumptions) or the same thing look different (re-learning).
- **Examples of consistency**: *names* (Ch 14), *coding style* (indentation, brace placement, declarations), *interfaces* with multiple implementations (know one, know all), *design patterns* (a shared vocabulary), *invariants* (properties always true, e.g. "every line ends in a newline") that eliminate special cases.
- **Ensuring consistency**
  - *Document*: publish the key conventions in a conspicuous place (wiki); document localized conventions (like invariants) in the code. Unwritten conventions aren't followed.
  - *Enforce*: automated checkers that block commits on violation are best for low-level rules; code reviews enforce the rest and educate newcomers.
  - *"When in Rome"*: in a new file, look around and match existing structure (declaration order, casing, patterns). When making a decision, check if a similar one was made elsewhere and mimic it.
  - *Don't change existing conventions*: a "better idea" is rarely worth the inconsistency. Only change if (a) you have significant *new* information unavailable when the convention was set, and (b) the new approach is so much better it's worth updating *all* old uses - then leave no trace of the old way.
- **Taking it too far**: consistency *only* helps when "if it looks like an x, it really is an x." Forcing dissimilar things into the same name/pattern creates confusion. Consistency also means *dissimilar* things look different.

## Key Concepts
- **Cognitive leverage**: knowledge acquired once, reused everywhere.
- **Invariant**: a property always true of a variable/structure; reduces special cases and aids reasoning.
- **"When in Rome"**: follow local conventions before imposing your own.
- **Value of consistency > value of a marginally better approach.**

## Mental Models
- Consistency is an investment: extra work to set and enforce conventions pays off in obviousness.
- A convention is a contract - breaking it (even for something "better") taxes every reader thereafter.
- Consistency cuts both ways: same things same, different things different.

## Anti-patterns
- **Unwritten conventions** that newcomers unknowingly violate.
- **"Improving" on an established convention** mid-project, fragmenting the codebase.
- **Forcing dissimilar things into one pattern** (overzealous consistency) - destroys the "looks like an x ⇒ is an x" guarantee.

## Worked Example
The line-termination problem: developers on Unix (newline) and Windows (CRLF) edited the same files; editors sometimes rewrote every line terminator, making diffs look like the whole file changed. The convention "files contain newlines only" was hard to enforce by hand - every new developer triggered a rash of violations. The fix was a **pre-commit hook script** that aborted any commit containing carriage returns (and could repair damaged files). This eliminated the problem instantly and trained newcomers. Code reviews served as the secondary enforcement and teaching channel.

## Key Takeaways
1. Consistency creates cognitive leverage and reduces mistakes.
2. Apply it to names, style, interfaces, patterns, and invariants.
3. Document conventions; enforce them with tools and reviews; "when in Rome, do as the Romans do."
4. Don't change established conventions without strong new evidence and a plan to update all uses.
5. Don't overdo it - dissimilar things must look different, or the "looks-like-an-x" guarantee breaks.

## Connects To
- **Ch 14**: consistent naming is a primary form of consistency.
- **Ch 18**: consistency makes code obvious.
- **Ch 19**: design patterns are a consistency mechanism (and can be over-applied).
