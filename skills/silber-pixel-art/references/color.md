# Color

Distilled from Chapter 6 of *Pixel Art for Game Developers* (Silber, 2016). Pixel art does a lot with a little; an organized palette is what makes the "little" fast to work with and easy to change.

## Contents
- Bit depth
- Ramps (gradients)
- Palette swapping
- Palette size: decide early
- Hue, saturation, value, contrast
- Choosing colors per element
- Transparency
- Worked example: coloring the line sprite

## Bit depth

Each bit doubles the color count: 1-bit = 2, 4-bit = 16, 8-bit = 256. Pick the smallest bit depth that supports the detail you need. Restraint is the point of the medium.

## Ramps (gradients)

A **ramp** (the book uses *ramp* and *gradient* interchangeably) is an ordered set of colors blending from one to another. Build the palette as **one ramp per material/element** — a green ramp for grass, a blue ramp for water, a brown ramp for sand, a skin ramp, a hair ramp.

Organized ramps are what make everything below possible.

## Palette swapping

If ramps are organized, you can change a whole scene by editing only the **end colors of a ramp** and re-gradienting between them. Same art, different palette → different time of day (day / sunset / night) or a different enemy variant.

**The trick for dramatic swaps:** colors that are *different* on one palette must be *duplicates of the same color* on the next palette. A beard and a skin tone that differ in palette A become the same color in palette B, so the beard "disappears" into the face without redrawing a single pixel. One sprite, four characters.

Swapping reuses the entire asset — including every animation frame — at no drawing cost.

## Palette size: decide early

Ask first: **"How few colors can I get away with?"** More colors cost exponentially, not linearly.

The book's measured example (a 32×32 head): 3 colors → 5 min; 5 colors → 10 min; 11 colors → 30 min. Carried across a body (roughly double) and an 8-frame walk cycle: 2 hr → 4 hr → 12 hr — for *one* animation of *one* character. A real character needs idle, jump, attack, damage, death…

**Decide your palette size and detail level at the start of the project**, before any sprite sets the standard. Once one high-detail sprite exists, consistency forces every other asset to match it. Picking small early can be the difference between finishing the game and not.

## Hue, saturation, value, contrast

Three independent axes, from the color picker:

- **Hue** — the color itself (left ↔ right on the picker). A ramp can shift hue (blue→pink) instead of value, which often looks lovelier than a plain dark→light run.
- **Saturation / intensity** — how vivid (up = intense, down = grey). High saturation draws the eye. To make one element pop, raise its saturation and **mute everything around it**.
- **Value** — lightness (the side slider). The amount of dark→light change across an image is its **contrast**.
  - Low contrast → homogenous, nothing pops, probably needed fewer colors anyway.
  - High contrast → harsh, values jump, the eye can't find the focus.
  - **Medium contrast is usually right.** Ramps blend naturally and one ramp's light contrasts another's dark.

## Choosing colors per element

- **Skin tones** benefit from a *tighter* gradient (less change between steps) and *more* colors. This holds regardless of the actual skin type.
- Reuse colors across elements where it reads correctly (e.g., one purple for both shoes and eyes) to keep the count down.
- Don't build every ramp dark→light by habit — try a hue-shift ramp for skies and large surfaces.

## Transparency

Reserve the **first slot in the palette for transparency** (the book's convention is magenta; any color works). Sprites are always rectangular files — the space around the object is the transparent color. The engine composites sprites over backgrounds by **layer priority**; transparency is what lets a non-rectangular character sit on a rectangular sprite sheet.

## Worked example: coloring the line sprite

**Exercise 6.1** — color the line-drawing sprite from [lines.md](lines.md).

1. Build **one ramp per material** and lay ramps adjacently in the palette (e.g., jeans blues, shirt reds, flesh tones, hair browns).
2. Flood-fill closed regions. Example read: saturated dark-red shirt, greyish-blue jeans, flesh tones, dark-brown hair, **one purple reused** for shoes + eyes (keeps the count down).
3. Fill each region with a **midtone** base so shadow and highlight can be added later — not the darkest or lightest step.
4. Adjust the drawing as needed (e.g., break a line that wrongly divides ear from head).

Result: a flat-but-colored sprite ready for shading ([light-and-depth.md](light-and-depth.md)). Shapes must be closed or the fill tool leaks into the background.
