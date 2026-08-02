# Chapter 15: Write The Comments First (Comments as a Design Tool)

## Core Idea
Write comments at the *beginning*, as part of design - not at the end. Comments-first produces better comments, **better designs** (comments are a canary for complexity), and is more enjoyable. Delayed comments are bad comments.

## Frameworks Introduced
- **Delayed comments are bad comments**
  - When to use: resist the urge to document "once the code stabilizes."
  - How: delaying usually means comments never get written; even if written, they're done when you've mentally checked out, so they repeat the code and miss the design intent you've since forgotten.
- **Write the comments first** (workflow)
  - When to use: when starting a new class.
  - How: (1) write the class interface comment; (2) write interface comments + signatures for the most important public methods, bodies empty; iterate until the structure feels right; (3) write declarations + comments for the most important instance variables; (4) fill in method bodies, adding implementation comments. For each new method/var discovered along the way, write its comment *before* (or with) the declaration. When the code is done, the comments are done - no backlog.
- **Comments are a design tool** (most important benefit)
  - When to use: as you shape a class.
  - How: comments are the only way to fully capture abstractions; writing them early lets you review and tune abstractions *before* implementation. A comment forces you to identify the essence of a thing. **Comments are a canary in the coal mine of complexity**: a method/variable needing a *long* comment signals a poor abstraction. Compare a method's interface comment to its implementation to gauge depth - if the interface comment must describe the implementation, the method is shallow. A variable needing a long comment suggests wrong decomposition.
- **Hard to Describe** (red flag)
  - When to use: while writing an interface comment.
  - How: if you can't describe a method or variable simply *and* completely, the design is suspect - fix the design, not the comment. (Only valid if the comment is itself complete and clear.)
- **Early comments are fun**: the design phase is the enjoyable part; simple comments are a source of pride and the signal of a good design.
- **Are early comments expensive?** No: typing is ~10% of dev time and comments ~5%; delaying saves only a fraction of that, while comments-first stabilizes abstractions earlier and may save *coding* time overall.

## Key Concepts
- **Comments-first workflow**: interface comments before bodies; comment each new entity when it's born.
- **Canary for complexity**: long/hard comments reveal shallow abstractions.
- **Depth via comments**: interface-comment length vs. implementation length measures how deep a method is.
- **Hard to Describe** (red flag): can't write a simple, complete comment -> design problem.

## Mental Models
- Write the abstraction before the implementation; the comment *is* the design you're testing.
- If describing it is painful, the thing itself is the problem.
- "The simpler the comments, the better the design" - hunt for the fewest clear words.

## Anti-patterns
- **Deferring all comments to the end** - they vanish or degrade.
- **Writing comments that repeat code** because you're reconstructing forgotten design intent.
- **Treating a long, hard comment as a success** rather than a design smell.

## Worked Example
The comments-first loop in practice: sketch the class interface comment, then method interface comments with empty bodies, and *iterate* ("until the basic structure feels about right") *before* writing any implementation. The canary principle: a method whose interface comment must walk through all the implementation's major features is shallow (the comment and the implementation are nearly the same); a deep method has a short interface comment over a richer implementation. A variable that needs a paragraph to describe probably conflates several concerns and should be split. The "Hard to Describe" red flag turns comment-writing into a design review: struggle -> refactor.

## Key Takeaways
1. Write comments first, as part of design - never defer them to the end.
2. Comments-first yields better comments, better designs, and is more fun.
3. Comments are a canary: long or hard-to-write comments signal a poor abstraction.
4. Compare interface comments to implementations to judge depth.
5. Commenting is cheap; the "no time to comment early" argument doesn't hold.

## Connects To
- **Ch 3**: comments-first is a proactive strategic investment.
- **Ch 4**: comments reveal whether a class is deep or shallow.
- **Ch 12/13**: the why and how of comments; this chapter is the *when*.
- **Ch 16**: keep those early comments near the code and de-duplicated as the system evolves.
