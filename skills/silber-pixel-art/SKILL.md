---
name: silber-pixel-art
description: Applies the universal pixel-art craft from Daniel Silber's *Pixel Art for Game Developers* (CRC Press, 2016) to a 2D game project — planning resolution, palette, and tile size up front; drawing sprites with clean lines and consistent light; building reusable tiled environments; animating with anticipation, follow-through, and squash-and-stretch; and avoiding the common defects (banding, super pixels, flash/pillow shading). Grounded in the book's chapters on lines, color, light and perspective, animation, tiled backgrounds, and anti-patterns, with the detailed core prompts in references/. Triggers on "pixel art for my game", "create pixel art sprites", "build a tile set", "pixel art animation", "palette for pixel art", "review my pixel art", or requests to apply pixel-art best practices to a 2D game.
---

Apply the craft from *Pixel Art for Game Developers* to a game project. The book's working definition is the through-line:

> **Pixel Art: an image where each pixel visible on screen is placed intentionally.**

That intent is what separates pixel art from 3D renders, vector art, scanned art, and paintings — none of which are pixel art even when displayed as pixels.

The detailed, chapter-by-chapter core prompts live in [`references/`](references/). Read the relevant one for the task at hand — don't reason from general knowledge when the book has a specific rule.

## Decide before you draw

Three decisions lock in the project's effort. Make them **early and deliberately**, because once a sprite sets the standard, consistency forces every other asset to match it.

1. **Native resolution** — the pixel dimensions of the viewport (e.g., 320×180, 384×216). Everything is drawn at this scale; a pixel is either "here" or "there," so this caps how smooth motion and curves can be.
2. **Palette size** — ask *"how few colors can I get away with?"* Color count costs exponentially: a 32×32 head takes ~5 min at 3 colors, ~10 min at 5, ~30 min at 11 — multiplied across a body, across 8+ frames, across every animation of every character. Pick small.
3. **Tile size** — powers of two only (8/16/32). Doubling the side length **quadruples** the area and effort (32×32 is 16× an 8×8). Pick the smallest size that carries your detail.

Keep the whole project consistent at the chosen level. **KISS — keep it simple, stupid.**

## Triage: which reference to read

| Task / request | Read |
|---|---|
| Quick decisions, thresholds, smell-tests | [`references/cheatsheet.md`](references/cheatsheet.md) |
| Term lookup (banding, palette swap, 3-tile, …) | [`references/glossary.md`](references/glossary.md) |
| Drawing outlines, diagonals, curves, anti-aliasing; sprite scaffold | [`references/lines.md`](references/lines.md) |
| Building a palette, ramps, palette swapping, hue/saturation/value/contrast, transparency | [`references/color.md`](references/color.md) |
| Shading form, cast shadows, atmospheric & linear perspective, depth | [`references/light-and-depth.md`](references/light-and-depth.md) |
| Walk/idle cycles, pixel flashing, anticipation, follow-through, squash & stretch, game-specific constraints | [`references/animation.md`](references/animation.md) |
| Tile sets, tiling textures, dithering, 9-slice vs 3-tile transitions, top-down & side-view builds, parallax | [`references/tiled-backgrounds.md`](references/tiled-backgrounds.md) |
| Reviewing art / spotting defects: banding, super pixels, flash shading, weak palettes, no texture | [`references/anti-patterns.md`](references/anti-patterns.md) |

Topic references include the book's key **worked examples** (line sprite → color → shade → idle; top-down and side-view tile sets). Prefer those sequences when teaching or building a first asset end-to-end.

## Always-relevant core rules

These apply to almost every pixel-art task; keep them in context:

- **1-pixel line width** by default. Diagonals use **equal segment lengths**, or **two alternating lengths** when equal can't hit the angle — never irregular staircases.
- **Curves:** avoid the lone pixel; make each staircase step progressively longer or shorter; clean up after the circle tool; mirror/rotate for symmetry.
- **Light is directional.** Brightest where a surface faces the light, darker as it turns away. Pick one light source and keep shadow direction consistent — flipping a sprite on the x-axis flips its shading, so catch that.
- **Atmospheric perspective:** farther = lighter, bluer, less detail, less contrast, less saturation. It's what makes the interactive layer pop.
- **Palette organization = iteration speed.** One ramp per material; reserve slot 0 for transparency. Organized ramps unlock **palette swapping** (edit the end colors of a ramp → new time-of-day or enemy variant, no redrawing) — and the swap trick where colors different in one palette are duplicates in the next.
- **Reuse relentlessly.** Duplicate, flip, mirror, rotate, palette-shift. Effort once, benefit many times.
- **Tiles must be homogeneous** to repeat invisibly: no stuck-out elements, no edge emphasis, no clustering, no gradients across the tile. Organic tiles use quasi-random, uniformly distributed pixels in odd counts.
- **Animate in place** (the script moves the sprite), in **chunks** (move whole parts to avoid pixel flashing), on a **simplified** sprite. Dithering and animation don't mix.
- **Break rules on purpose, not by accident.** Understand the rule first (e.g., consistent light direction), then weigh the tradeoff against production speed.

## Software

The book teaches in **GraphicsGale** (Windows-only, free). Tools change; the principles don't. A modern tool-agnostic default is **Aseprite** (cross-platform); **PyxelEdit** and **ProMotion** have auto-updating tile features that eliminate seam work. Avoid Photoshop/GIMP and vector tools (Illustrator, Inkscape) — they aren't set up for intentional pixel placement. Whatever you use, **bind hotkeys** for grid, snap-to-grid, eyedropper, and palette ramping.

## Workflow for a game project

Copy this checklist and track progress:

```
Pixel-art production:
- [ ] 1. Lock native resolution, palette size, and tile size (decide before drawing)
- [ ] 2. Build the palette: ramps per material, slot 0 = transparency, reserve slots
- [ ] 3. Draw the sprite outline (lines.md) → color it (color.md) → shade it (light-and-depth.md)
- [ ] 4. Simplify the sprite for animation, then animate in chunks (animation.md)
- [ ] 5. Build the tile set: base tiles → variations → transitions → compose scenes (tiled-backgrounds.md)
- [ ] 6. Review every asset against the anti-patterns checklist (anti-patterns.md)
- [ ] 7. Keep detail level consistent across the whole project
```

## Source

The craft in `references/` is distilled from *Pixel Art for Game Developers* (Daniel Silber, CRC Press, 2016; ISBN 978-1-4822-5231-6). Decision rules live in [`cheatsheet.md`](references/cheatsheet.md); term definitions in [`glossary.md`](references/glossary.md).

## Principles

- **Grounded in the book, not memory.** When the book has a specific rule (3-tile vs 9-slice, the palette-swap duplicate trick, super pixels as the "most heinous crime"), cite it. Read the reference rather than improvising.
- **Intent over fidelity.** Pixel art is *intentional placement*, not high resolution. Restraint — few colors, small tiles, simple sprites — is the medium's strength, not a limitation.
- **Decide early, stay consistent.** Resolution, palette size, tile size, and detail level are project-wide commitments. Changing them late multiplies effort across every asset.
- **Reuse is the pipeline.** Mirror, flip, palette-swap, and tile. The shortest credible pipeline is the point: create art → import (versus the 3D model → UV → texture → rig → skin → animate chain).
- **Design in context, not in a bubble.** A sprite is read against its background and its neighbors. Color, value, and composition must make the interactive layer stand out and the background sit back. (Hyper Light Drifter's Alex Preston: the single biggest difference is color choices.)

## Edge cases

- **Very small sprites / low resolution:** banding and pixel flashing become hard to fully eliminate — mitigate, don't chase perfection. 1-pixel moves are valid idles.
- **Player customization / equipment variety:** hard in pixel art — you must hand-make a variation for every frame; you can't just rotate a sprite. Plan the cost, or restrict customization.
- **No-outline style:** solid colors need extra awareness of context (color, value, composition) to make subjects pop, since there's no black outline to separate them. Design against the backgrounds they'll appear on.
- **Mixed resolutions or modern conveniences (gradients, ambient lighting):** fine if intentional, but they break the authentic-retro read that many players expect. Decide your authenticity budget up front.
- **Existing art in the project:** match its resolution, palette size, tile size, and detail level before adding anything — consistency is non-negotiable, so align to the existing standard (or refactor the standard deliberately).
