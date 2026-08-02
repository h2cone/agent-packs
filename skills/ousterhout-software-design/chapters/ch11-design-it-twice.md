# Chapter 11: Design it Twice

## Core Idea
Software design is hard, so your first idea won't be the best. For each major design decision, consider **at least two radically different alternatives**, compare their pros and cons, then choose one - or synthesize a new design from the comparison. It costs little and pays back in implementation.

## Frameworks Introduced
- **Design it twice**
  - When to use: at every major design decision - a module interface, an implementation, a system decomposition, even a UI feature set.
  - How:
    1. Sketch ≥2 alternatives (you needn't pin down every method - just the most important ones).
    2. Make them *radically different*; even if you're sure only one is reasonable, design a second no matter how bad - its weaknesses are instructive.
    3. List pros/cons. The **top criterion for an interface is ease of use for higher-level code**; also weigh interface simplicity, generality, and implementation efficiency.
    4. Pick the best, *combine* features of several, or - if none satisfy - let the identified weaknesses *drive a new design*.
- **Apply at multiple levels**
  - Interface first, then implementation (e.g. text class interface, then implementation: linked list of lines, fixed-size blocks, or gap buffer - where the goals are simplicity and performance).
  - Higher levels: choosing features, decomposing into major modules.
- **Cost is small**: ~1–2 hours for a class versus days/weeks of implementation; the better design more than pays for it.
- **It's hard for smart people**: the "first quick idea is enough" habit from school fails on genuinely hard problems. Considering multiple designs isn't a sign you're not smart - it's that the problems are hard. It also *improves your design skills* over time.

## Key Concepts
- **Radically different alternatives**: maximize what you learn; don't pick two variants of the same idea.
- **Ease of use for higher-level code**: the dominant criterion for interface design.
- **Weakness-driven redesign**: when no alternative is good, the reasons they're bad point to a better design.
- **Design-it-twice as a learning loop**: comparing alternatives teaches what makes designs good or bad.

## Mental Models
- Assume your first design is wrong; the question is what the second and third teach you.
- A bad alternative is still useful - articulating *why* it's bad sharpens the criteria for the good one.
- If every alternative forces higher-level code to do extra work, that's a red flag pointing at a missing design.

## Anti-patterns
- **Implementing the first idea that comes to mind** - especially tempting for smart people; underperforms potential.
- **Choosing two near-identical alternatives** - learns nothing.
- **Believing "smart people get it right first time"** so that trying multiple designs feels like an admission of inadequacy.

## Worked Example
Designing the text class for a GUI editor - three interface alternatives:
1. *Line-oriented* (insert/modify/delete whole lines).
2. *Character-oriented* (single-character insert/delete).
3. *String/range-oriented* (insert/delete arbitrary ranges, possibly crossing lines).

Comparing them: both line- and character-oriented force higher-level UI code to do extra work (splitting/joining lines, or looping per character; character-oriented is also slow). That *shared weakness* is the red flag - a text class should handle all text manipulation - and it points to the range-oriented API, which eliminates the extra manipulations. The range-oriented design wasn't one of the first two; it *emerged* from analyzing why the first two were awkward. (Then "design it twice" recurs at the implementation level: linked list of lines vs. fixed-size blocks vs. gap buffer.)

## Key Takeaways
1. For each major decision, design at least two radically different alternatives.
2. Compare on ease-of-use for higher-level code first, then simplicity, generality, efficiency.
3. Choose, combine, or let the weaknesses drive a brand-new design.
4. Apply at interface, implementation, and system-decomposition levels.
5. It's cheap, it improves the result, and it sharpens your design skill - especially for smart people who must unlearn the "first idea is enough" habit.

## Connects To
- **Ch 3**: design-it-twice is a proactive strategic investment.
- **Ch 6**: comparing alternatives surfaces the "somewhat general-purpose" sweet spot.
- **Ch 9**: the together/apart decision benefits from comparing decompositions.
- **Ch 21**: choosing among options is how you discover what matters (leverage).
