# Chapter 12: Why Write Comments? The Four Excuses

## Core Idea
Comments are essential, not optional: they capture design information code can't express, they are *fundamental to abstraction* (without them you can't hide complexity), and - done well - they improve the design itself. The four common excuses for skipping comments are all wrong.

## Frameworks Introduced
- **Comments capture what code can't**
  - When to use: whenever you expose an interface or make a nontrivial decision.
  - How: the *informal* aspects of an interface (high-level behavior, preconditions, what a result means, design rationale) can't be represented in code - only in comments. Good names help but cannot replace comments.
- **Comments are fundamental to abstraction**
  - When to use: any time you intend to hide complexity.
  - How: an abstraction is a simplified view omitting ignorable details. If users must read a method's implementation to use it, there is *no* abstraction - all complexity is exposed. Comments complete the simplified view; human language gives expressive power code lacks.
- **The Four Excuses (refuted)**
  1. *"Good code is self-documenting"* - false; much design info can't be in code. Expecting readers to read implementations pushes you toward many shallow methods and still forces readers to chase nested behavior.
  2. *"I don't have time"* - investment mindset; typing (code+comments) is ~10% of dev time, so even equal comment time adds ~10%, which pays back fast in maintainability.
  3. *"Comments get out of date"* - manageable: large doc changes only follow large code changes (which take longer); keep docs near code, avoid duplication, use code reviews to catch staleness.
  4. *"Comments I've seen are worthless"* - the one with merit; bad comments are common but the problem is solvable by learning to write good ones (Ch 13).
- **Benefits**: good docs reduce **cognitive load** (provide needed info, let readers ignore the irrelevant) and **unknown unknowns** (clarify system structure and what's relevant to a change); they clarify dependencies and fill obscurity gaps.
- **A different opinion: "comments are failures"** (Clean Code): Ousterhout rejects this. Comments carry information *different* from code, not expressible in code; they are not failures. Replacing comments with long method names (`isLeastRelevantMultipleOfNextLargerPrimeFactor`) is cryptic and forces callers to retype documentation at every call site. The "comments are failures" attitude discourages good documentation and mislabels good designers.

## Key Concepts
- **Informal interface**: the part of an interface (behavior, constraints, rationale) that only comments can express - usually larger than the formal part.
- **Comment as abstraction-completer**: code + comments together form the simplified view; code alone exposes everything.
- **Investment mindset applied to docs**: a little up-front comment time pays back in maintainability.

## Mental Models
- "Without comments, you have no abstraction - only a declaration too sparse to use."
- Comments and code each suit different information; neither replaces the other.
- Don't let "comments are failures" shame you out of documenting.

## Anti-patterns
- **Skipping comments** because code "should speak for itself."
- **Reading implementations to learn behavior** - a sign the abstractions aren't documented (or don't exist).
- **Treating comments as drudge work** deferred to the end (see Ch 15).

## Worked Example
`substring(start, end)`: the declaration alone can't tell you whether `end` is inclusive, or what happens if `start > end` - only a comment can. This is the smallest case of the general rule: the formal interface is missing essential information that comments must supply. Against Clean Code's "replace comments with code," Ousterhout notes that extracting a commented block into a method named `isLeastRelevantMultipleOfNextLargerPrimeFactor` is *less* informative than a comment and forces every caller to retype that documentation.

## Key Takeaways
1. Comments capture design information that code fundamentally cannot represent.
2. Comments are required for abstraction - without them, complexity isn't hidden.
3. All four excuses for skipping comments fail; the "worthless comments" problem is fixable.
4. Good documentation reduces cognitive load and unknown unknowns.
5. Comments are not failures; treating them as such degrades design.

## Connects To
- **Ch 4**: comments complete the abstraction; no comments -> no hiding.
- **Ch 13**: *how* to write good comments (describe the non-obvious).
- **Ch 15**: write comments *first*, as a design tool.
- **Ch 19**: disagrees with Clean Code on comments (and on function length, Ch 9).
