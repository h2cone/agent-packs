# Cheatsheet

Decision rules, thresholds, and smell-tests from *Pixel Art for Game Developers*. Use this to *decide*, not just to look up terms. For definitions, see [glossary.md](glossary.md).

## Decide before you draw (lock these project-wide, early)

- **Palette size**: ask *"how few colors can I get away with?"* — color count costs exponentially.
- **Native resolution**: the viewport's pixel dims; a pixel is "here" or "there," so this caps motion/curve smoothness.
- **Tile size**: smallest power-of-two (8/16/32) that carries the detail.
- **Detail/quality bar**: set it deliberately *low* and sustain it — "start with crap," KISS.

## Line & shape rules

- 1-pixel line width by default.
- Diagonals: equal segments → else two alternating lengths → never irregular.
- Curves: no lone-wolf pixel; progressive segment lengths; clean up after the circle tool.
- Draw once: duplicate → flip → mirror → rotate.

See [lines.md](lines.md).

## Palette & color

- One ramp per material; slot 0 = transparency; fill with a midtone to enable shadow + highlight.
- Farther = lighter, bluer, less detail, less contrast, less saturation.
- Interactive layer = higher saturation + higher contrast than the background.
- Single biggest difference in a piece's success: **color choices** (Preston). Design against the neighbors, not in a bubble.

See [color.md](color.md) and [light-and-depth.md](light-and-depth.md).

## Tiles & transitions

- Need light direction preserved? → **9-slice** (~12 tiles). Else → **3-tile method** (2 + flip + corner).
- Tile must repeat invisibly: homogeneous, low-contrast, quasirandom, odd counts, no emphasized edges.
- Build interactive tiles to the collision-box edge (give 1–2px).
- Fill every parallax layer's bottom so it doesn't hover.

See [tiled-backgrounds.md](tiled-backgrounds.md).

## Animation

- Animate in place; the script moves the sprite.
- Simplify first (≤2 colors/hue, shadow a limb); animate in chunks, not redraws.
- Movement is ≥1px — at small scales that's a big fraction of the part, so idles are subtle (a 1px torso shift at ~2 fps works).
- Walk cycle ~8 frames (16 silky-smooth; 2–3 minimal).
- Squash next to stretch for contrast; always add anticipation + follow-through.
- **Dither + animation = mortal enemies.** Don't mix them.
- Flipped a sprite on the x-axis? Check its shading direction didn't become inconsistent.

See [animation.md](animation.md).

## Thresholds & numbers

- 32×32 head: 3 colors ≈ 5 min, 5 ≈ 10 min, 11 ≈ 30 min (body ~2× head).
- 8-frame walk: ~2 hr (3-color) / ~4 hr (5) / ~12 hr (11).
- Tile area: 8×8=1×, 16×16=4×, 32×32=16× (doubling the side quadruples effort).
- Idle ~2 fps (500 ms/frame); traditional anim 24 fps, games often 30.
- Chasm native res: 384×216.

## Pipeline: pixel art vs 3D

| Pixel art | 3D |
|---|---|
| Create animation → import | Model → UV → texture → hi-poly/normals → rig → skin → animate → import → wire up |

Pick pixel art for a shorter, cheaper, more reliable pipeline — not to save drawing time (it doesn't).

## Smell-tests (if you see this, you're in trouble)

- Pixel sticking out of a curve → lone wolf.
- Two transitions ending at the same coordinate → banding / super pixel (the cardinal sin).
- Blurry edges → too much anti-alias.
- Edges darkest, center lightest → flash/pillow shading.
- Background as saturated/detailed as the foreground → lost depth (fighting atmospheric perspective).
- Tile repetition painfully obvious → non-homogeneous tile (stuck-out element, gradient, clustering, emphasized edge).
- Pixels appear/disappear between frames → pixel flashing.
- A gorgeous first sprite → an unsustainable project-wide standard is being set.

See [anti-patterns.md](anti-patterns.md).

## Meta

- Understand a rule before you break it (the author breaks light-direction and banding rules regularly — on purpose).
- Think in 3D, draw in 2D (Skoglund).
- Constraints breed creativity; restraint is the medium's strength, not its limit.
