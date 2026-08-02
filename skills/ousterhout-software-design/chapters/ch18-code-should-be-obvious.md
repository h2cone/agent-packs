# Chapter 18: Code Should be Obvious

## Core Idea
Obscurity is a root cause of complexity (Ch 2). Make code **obvious**: readable quickly, with correct first guesses and little effort. "Obvious" is judged by the *reader* (use code reviews), not the author. Three levers: reduce the information readers need, reuse conventions they already know, and present the rest via names and comments.

## Frameworks Introduced
- **Obviousness (definition)**
  - When to use: evaluating any code's readability.
  - How: obvious code can be read quickly without much thought, and a reader's first guess about behavior is correct. Nonobvious code forces effort and invites misunderstanding/bugs. Obvious code needs fewer comments. If a reviewer says it's not obvious, it's not - don't argue, learn what confused them.
- **Things that make code more obvious**
  - *Good names* (Ch 14) and *consistency* (Ch 17) - the two biggest levers.
  - *Judicious whitespace*: structure parameter docs with blank alignment so boundaries are visible; blank lines between major blocks (especially when each starts with a comment); spacing *within* statements (`for (int pass = 1; pass >= 0 && !empty; pass--)` beats `for(int pass=1;pass>=0&&!empty;pass--)`).
  - *Comments* to compensate when code can't be made obvious directly.
- **Things that make code less obvious**
  - *Event-driven programming*: control flow is indirect (handlers invoked via pointers/interfaces at runtime) - document *when* each handler is invoked in its interface comment.
  - *Generic containers* (`Pair`, `std::pair`): elements get meaningless names (`getKey()`, `getValue()`) - define a specialized class with meaningful names and docs instead. Illustrates "design for ease of **reading**, not ease of writing."
  - *Different types for declaration and allocation* (`List` declared, `ArrayList` allocated): can mislead readers about performance/thread-safety - match them.
  - *Code that violates reader expectations* (e.g. a constructor that spawns threads outliving `main`): document the surprise at the point it happens, not just in a far-off interface comment.
- **Nonobvious Code** (red flag): meaning/behavior can't be grasped with a quick read - important info isn't immediately clear.
- **Three ways to make code obvious** (synthesis): (1) *reduce* the info needed (abstraction, eliminate special cases); (2) *reuse* info readers already have (conventions, expectations); (3) *present* the rest (good names, strategic comments).

## Key Concepts
- **Obvious is the reader's call**: code reviews are the detection mechanism.
- **Design for reading, not writing**: spend a writer's few minutes to save every reader's time.
- **Nonobvious = missing information** the reader needs (the threads spawned; what `getKey()` returns).

## Mental Models
- If a reader must expend effort to gather needed info, the code isn't obvious - fix the design or add the comment.
- Surprise is the enemy of obviousness: when behavior defies convention, document at the point of surprise.
- Prefer a named structure over a generic tuple, even though the tuple is faster to write.

## Anti-patterns
- **Squeezed formatting** that hides structure.
- **Generic containers** (`Pair`) returning multiple values with meaningless accessors.
- **Declaration/allocation type mismatch** that obscures real properties.
- **Unspoken surprises** (threads, side effects) that violate expectations.
- **Arguing with a reviewer** who finds your code nonobvious.

## Worked Example
- *Whitespace*: a `@param` block with no alignment hides where one parameter's docs end and the next begins; adding whitespace makes the parameter list scannable. Blank lines plus a leading comment per block make `Buffer::allocAux`'s three phases readable at a glance.
- *Generic container*: `return new Pair<Integer, Boolean>(currentTerm, false)` forces callers to write `result.getKey()` / `result.getValue()` - meaningless. A small named class with `currentTerm` and a well-named boolean is obvious and documentable.
- *Violated expectation*: `new RaftClient(...)` in `main` looks like it returns and exits, but the constructor spawns threads that keep the app alive - this needs a comment at the end of `main`, not just in the constructor's interface doc.
- *Event-driven*: `Transport::RpcNotifier::failed()` is never called directly - its interface comment must say when the dispatch thread invokes it.

## Key Takeaways
1. Obscurity drives complexity; aim for obvious code - quick reads, correct first guesses.
2. "Obvious" is the reader's judgment; use code reviews to find nonobviousness.
3. Biggest levers: good names and consistency; plus whitespace and compensating comments.
4. Avoid generic containers, type mismatches, and unspoken surprises; design for readers, not writers.
5. Make code obvious by reducing needed info, reusing conventions, and presenting the rest clearly.

## Connects To
- **Ch 2**: "obvious" is the positive opposite of cognitive load and unknown unknowns.
- **Ch 14/17**: names and consistency are the top two obviousness techniques.
- **Ch 13**: comments compensate when code can't be made obvious directly.
