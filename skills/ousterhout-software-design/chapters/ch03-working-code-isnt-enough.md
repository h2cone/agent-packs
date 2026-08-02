# Chapter 3: Working Code Isn't Enough (Strategic vs. Tactical Programming)

## Core Idea
Your primary goal is a great design that also works - not "working code." **Tactical programming** (get the current task done fastest) accumulates complexity; **strategic programming** invests continually in clean design and is actually cheaper over the long run. Good design pays for itself, sooner than you think.

## Frameworks Introduced
- **Tactical vs. strategic programming**
  - When to use: every time you approach a task.
  - How: tactical = short-sighted, "finish this fast," adds small complexities/kludges; strategic = "produce a great design that also works," invests time so future extensions are easy. Most code is written by *extending* existing code, so facilitating future extension is your real job.
- **The tactical tornado**
  - When to use: recognizing a harmful "hero."
  - How: a prolific, fast, purely tactical developer who leaves wreckage others must clean up; looks heroic to management but is costly to the team. Don't be one; don't reward one.
- **Investment mindset: proactive vs. reactive**
  - *Proactive*: take extra time up front (find a simple design, try alternatives, write docs, imagine future changes).
  - *Reactive*: when you discover a design problem, fix it instead of patching around it. Continually make small improvements.
- **How much to invest**
  - When to use: setting your daily/weekly design budget.
  - How: ~**10–20% of total development time**, continually, in small increments (not big up-front waterfall). Initial projects take 10–20% longer; within a few months you're 10–20% faster, after which investments become "free." Estimated payback ~**6–18 months**.
- **Technical debt**
  - Borrowing time from the future: faster now, slower later; you repay *more* than you borrowed, and most technical debt is *never fully repaid*.

## Key Concepts
- **Working code isn't enough**: it is not acceptable to introduce unnecessary complexity to finish faster.
- **Complexity is incremental** (Ch 2): each tactical shortcut adds a chunk; collectively they rot the codebase.
- **Slippery slope of delayed cleanup**: "I'll clean up after the crunch" becomes permanent because there's always another crunch.
- **Startups**: can succeed either way, but a spaghetti codebase is nearly impossible to fix and hurts recruiting of the best engineers (who care about design). Facebook ("move fast and break things") vs. Google/VMware (strategic).

## Mental Models
- Think of design investment like *compounding interest*: small continual deposits, not a giant up-front bet.
- Treat "I'll fix it later" as a lie - later has its own crunch; invest today.
- Strategic isn't waterfall - the ideal design *emerges* in pieces as you gain experience.

## Anti-patterns
- **Tactical tornado**: speed celebrated while leaving unmaintainable code.
- **Big up-front design (waterfall)**: a huge design investment before experience doesn't work; emerge the design incrementally instead.
- **Delaying all cleanup until "after the crunch"**: delays become permanent; problems grow and intimidate.

## Worked Example
The strategic-vs-tactical productivity curves (Fig 3.1): tactical progress is faster at first, but complexity accumulates faster, so productivity decays; the curves cross over (author's estimate: ~6–18 months, tied to how fast developers forget what they wrote) and strategic pulls ahead for the system's remaining life. Real-world contrast: Facebook's tactical early culture ("move fast and break things") produced unstable, lightly-commented/tested code and was eventually replaced with "move fast with solid infrastructure"; Google and VMware grew up alongside Facebook with a strategic emphasis on high-quality code and strong technical cultures that won recruiting.

## Key Takeaways
1. Your primary goal is a great design that also works - not merely working code.
2. Invest ~10–20% of dev time continually in design (proactive + reactive); it becomes free within months.
3. Technical debt is borrowing from the future and is mostly never repaid.
4. Be consistent: invest today, not "after the crunch" - delays compound.
5. Every engineer making continuous small investments beats occasional big cleanups.

## Connects To
- **Ch 2**: complexity is incremental → justifies zero-tolerance/strategic mindset.
- **Ch 11**: "design it twice" is a prime proactive investment.
- **Ch 16**: stay strategic even when modifying existing code.
