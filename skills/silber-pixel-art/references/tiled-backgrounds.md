# Tiled backgrounds

Distilled from Chapter 9 of *Pixel Art for Game Developers* (Silber, 2016) — the book's largest chapter. Tiling is where pixel art earns its keep: a small set of reusable tiles covers a whole game world with tiny file sizes and fast iteration.

## Contents
- Tile sizes
- Work area setup
- Infinitely tiling textures
- Organic vs. man-made tiles
- Variation tiles
- Tile library
- Dithering
- Terrain transitions: 9-slice vs. 3-tile
- Worked example: top-down tile set
- Worked example: side-view environment
- Parallax and atmospheric color
- Reuse and mirroring
- Brick, windows, silhouettes
- Tile management

## Tile sizes

Tiles are square and **powers of two**: 8×8, 16×16, 32×32. The power-of-two sizing lets the engine handle images efficiently and avoids wasted memory.

**Doubling the side length quadruples the area.** A 32×32 tile holds sixteen 8×8 tiles — so working at 32×32 instead of 8×8 is **16× the area and effort**. Choose the smallest size that carries your detail. Agreeing to a "larger" tile size on a whim can multiply an art budget by 4–16×.

## Work area setup

- Show a **grid** at the tile size, and enable **snap to grid** (bind it to a hotkey — the book uses `g`; you'll use it constantly).
- Canvas should fit several rows and columns of tiles so you can test tiling in context (e.g., 256×256 for 16×16 or 32×32 work).

## Infinitely tiling textures

A tile that repeats in both directions must link up seamlessly on all four edges. Its composition should be **homogeneous** — anything that stands out becomes painfully obvious when repeated. Avoid:

- **Elements that stick out** — a single rock, a lone flower. Fine as an accent tile, fatal as a base tile.
- **Gradients across the tile** — they repeat into visible bands.
- **Dramatic shadows / high contrast** — contrast calls attention to the tile and makes repetition obvious; it also makes the environment fight the character for focus.
- **One item dominating the tile.**
- **Detail concentrated in one part of the tile.**
- **Emphasizing the tile edge** — too many pixels in a row along a border "pops" the grid out.

## Organic vs. man-made tiles

For **organic** textures (grass, sand, foliage):

- **No horizontal or vertical pixel alignment** — lined-up pixels read as man-made. Distribute pixels quasi-randomly.
- **No clustering** — a higher-density region stands out as a pattern when repeated. Aim for **uniform distribution**.
- **Low contrast** for background tiles, so they sit behind the character.
- **Odd counts** of features (3 rocks, not 4) — even numbers read as patterns; odd numbers read as organic. (This is a fine-art convention the book leans on throughout.)

For **man-made** textures (metal, plastic, brick), alignment and patterned dithering are appropriate.

## Variation tiles

A clean repeating base + a handful of variation tiles transforms a flat field into a scene. Variations can:

- Break monotony and hide the grid.
- **Imply a path** (a line of flowers or stones) and guide the player.
- **Hide secrets** — a subtle secondary path of off-color tiles leading somewhere most players miss.

## Tile library

Keep a **tile set** (a.k.a. tile map / tile palette) — the repository of every tile. Editors with an **auto-update** feature (PyxelEdit, ProMotion) propagate edits to every instance of a tile in real time, which eliminates seams when iterating tiling textures. If your editor lacks it, update tiles manually and consistently.

## Dithering

Dithering uses pixel placement to imply a blend between two colors, making a limited palette look like it has more colors. Two categories:

- **Organic dither** — quasi-random pixels, **density increasing toward the boundary** between the two colors. Two-step process: push color A into B's side (denser near the edge), then B into A's side. Good for skies, shadows, organic shading.
- **Patterned dither** — regular patterns like a checkerboard. Good for **man-made** surfaces (metal, plastic); reads as too static for foliage.

Most editors ship built-in dither patterns. Hand-drawn dither patterns can be striking and stylized.

> **Dithering and animation are mortal enemies** — a dithered texture that moves flashes badly. Don't dither anything that will animate. (See [animation.md](animation.md).)

## Terrain transitions: 9-slice vs. 3-tile

When two terrains meet (grass ↔ sand, grass ↔ water), you need transition tiles. Two methods:

**9-slice** — a transition tile for each of the 8 neighbors of a center tile, plus the center. Lets you keep a **genuine, consistent light direction** across the scene (you can color the dividing line and add cast shadow correctly). Full freedom of shapes needs ~12 transition tiles. **Precise, but slow** to build and scene-build with.

**3-tile** (the book's preferred default) — build **2 transition tiles** (split a tile on the diagonal; the top tile must divide evenly so it still aligns when flipped), flip them to cover all four sides, then **1 corner tile**. Three tiles emulate the 9-slice. **Faster to build, easier to scene-build, smaller files, fewer inconsistencies** — at the cost of not preserving a true light direction.

Default to 3-tile; reach for 9-slice only when directional lighting across transitions really matters.

## Worked example: top-down tile set

**Exercise 9.1** — 16×16 tiles, ~256×128 canvas, 8-bit / ~32 colors used. Build in this order; reuse and flip at every step:

1. **Palette** — magenta in slot 0 (transparency) + reserve slots; ramps per terrain (greens, blues, browns, grays, accent yellows/purples).
2. **Base grass tile** — middle green, quasi-random darker/lighter dots, uniform, low contrast. Duplicate 3×3 to check tiling; fix any H/V alignment you spot.
3. **Grass variation** — wilder tile, denser light/dark. Keep evenly distributed.
4. **Blend tile** — a single diagonal-softening tile between the two grasses (3-tile philosophy: one tile replaces two rounded-edge transition tiles).
5. **Sand** — base brown + grey pebble dots (similar value to the brown) + lighter reflections + darker brown variation.
6. **Grass↔sand transitions** — 3-tile method (2 flipped + 1 corner), or 9-slice if you need light direction.
7. **Variations** — flowers (stem + petals + cast shadow + outline to pop), built once then **palette-shifted** for free color variants. Cacti for sand. Stones in **odd counts**.
8. **Rock face** — outline like fish-scales; **wrap curves around the tile edges** to hide seams; continue top-of-arch lines into the bottom so it repeats uninterrupted. Add highlights (3rd dimension), then texture (grey variation, green moss in crevices, brown dirt). Build blend tiles where rock meets grass (top edge + side + corners); add cast shadow with a darkened-grass tile.
9. **Stairs** — 2 dark pixels (vertical/riser) + 3 light (horizontal/tread) per step; flip for the opposite side; add top/bottom tiles and optional light-direction tiles.
10. **Water** — repeating base + variation tiles; use the sand 3-tile as the edge guideline; push sand back to the tile middle, fill with water, soften corners, darken water near the beach, angle the water to echo the land.
11. **Compose** — arrange tiles into scenes; use flowers/stones as paths; shape lakes into secondary images (a key); build subtle secondary paths to secrets.

~12 tiles can create whole scenes; the full set is ~80 tiles.

## Worked example: side-view environment

**Exercise 9.2** — 32×32 tiles, ~640×480 work area, ~80 tiles, fewer than 50 colors. Work **back to front** (farthest layer first):

1. **Sky** — a ramp that shifts **hue AND value AND saturation** (e.g., purple→blue). Lay it as horizontal bands that **get smaller toward the top** (atmosphere). Tighter gradients blend better than high-contrast ones. Dither the bands together (organic dither, per-band 32×32).
2. **Distant mountains** — block out as rectangles in the second-lightest sky color (atmospheric perspective), then add **profile tiles** for the silhouette. Reuse the same tiles **two shades darker** for a closer range and add peak highlights with the in-between color.
3. **Foliage horizon** — low-saturation blue-green so it sits back; one tile + a position-shifted variation.
4. **Mid-ground trees** — sloppy outline → neutral fill → block dark → add light → clean lines. Fill the bottom with flat grass so the layer doesn't hover when it scrolls.
5. **Interactive layer** (platforms, walls — what the character collides with): **higher saturation and higher contrast** than the background so it stands out. Build tiles **out to the edge** of the tile (collision is a rectangular bounding box; the visual should match the collision). Build one side, mirror for the other; make an extension tile by duplicating a vertical strip to cap the middle.

## Parallax and atmospheric color

- Backgrounds scroll on **parallax layers** at different speeds for depth. Be aware engines may cap parallax layer count — merge the farthest (e.g., mountains) into the sky if needed.
- **Fill the bottom of every parallax layer** with opaque ground color, or the layer will visibly hover when it scrolls.
- Apply atmospheric perspective through **color, not just size**: background layers use **lighter, bluer, lower-saturation, lower-contrast** colors; foreground layers use **saturated, high-contrast** colors. **Reuse sky colors for distant buildings** so they recede.
- **Don't fight atmospheric perspective** — if you make the foreground muted and the background intense, the eye goes to the back and depth collapses.

## Reuse and mirroring

- Mirror tiles to get the opposite side for free (platforms, stairs, transitions).
- Duplicate a tile and **shift all its colors one slot darker** for a free shadow variant (faster than repainting; usually reads fine).
- A tile that can't be made to look good flipped gets its own dedicated tile — accept the cost when mirroring fails.
- Build **over** the background layer so you can tune colors and size in context.

## Brick, windows, silhouettes

- **Brick** — uniform height (e.g., 3 px brick + 1 px mortar), **wrap the pattern** so it repeats seamlessly, add light on top/left edges for depth, weather the mortar for variation. Make a **cast-shadow version** of each wall tile where a ledge falls.
- **Window** — bare frame + sill impression, recessed shadow, **diagonal shine lines** of varying thickness (context-independent, so no consistency issues), cast shadow to integrate.
- **Silhouette matters.** A parallax layer's outline is most of its appeal — a unique, complicated silhouette reads as more *believable* and more attractive than a dull one. Check your layers in pure silhouette.

## Tile management

Organize the tile set **by type** (all grass together, all sand together), not by layer priority. Type-organization makes the right tile easy to find; priority-order is efficient for the machine but unusable for the human.

**Masking** (when the editor supports it): lock drawing to one palette color so you can shade one material without disturbing others — useful for brick mortar, moss in crevices, and multi-ramp tiles.

The book's full side-view environment: **~80 tiles**, one 320×256 image, **fewer than 50 colors** — enough to build countless scenes.
