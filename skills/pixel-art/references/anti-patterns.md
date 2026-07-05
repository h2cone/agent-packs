# Anti-patterns

Distilled from Chapter 10 of *Pixel Art for Game Developers* (Silber, 2016) — "You're Doing It Wrong." Each entry is a smell to spot in your own work or in a review, with the fix.

## Contents
- Banding and "super pixels"
- Too much anti-alias
- Poor line/shape quality
- Weak palette choices
- Too much complexity
- Flash (pillow) shading
- No texture

## Banding and "super pixels"

**Smell:** sets of colors or shapes *end in the same place*, producing an imaginary line that bands unrelated items together. Most often: shading steps line up exactly with the outline of the same object.

**Super pixel** — the worst case: multiple lines of shading line up exactly along a diagonal, so the staircase offers no more fidelity than a single large pixel. The opportunity to imply a smoother line is lost.

**Fix:** offset the shading steps so they don't share an edge with the outline or with each other. Stagger them. At very small resolutions you may only *mitigate* banding rather than eliminate it — that's expected.

> The super pixel is "perhaps the most heinous crime you can commit as a Pixel Artist." Train your eye to catch it; once seen, it can't be unseen.

## Too much anti-alias

**Smell:** the image looks blurry — like a larger picture scaled down, losing quality indiscriminately.

**Fix:** anti-alias a little, not a lot. One or two transition colors on a line's steps. Zoom out to check. (See [lines.md](lines.md).)

## Poor line/shape quality

**Smell:** staircases look unintentional; the profile of the object and the contour of its shadows form awkward shapes.

**Fix:** a line is built of squares, so it must look deliberate — apply the diagonal/curve rules. The same applies to the *shape* of the object and its shadow contours ("poor shape quality"). Slight pixel adjustments usually resolve it.

## Weak palette choices

Palette errors fall into three buckets (see [color.md](color.md)):

- **Too much or too little contrast.** Low → flat, nothing pops. High → harsh, values jump, no focus.
- **Too much or too little saturation.** Everything screaming, or everything muddy.
- **Too many colors.** More than the image needs → harder to keep consistent, especially when animating.

**Fix:** medium contrast and medium saturation are usually right; use the fewest colors that carry the detail.

## Too much complexity

**Smell:** an early sprite is over-detailed, and now every other asset must match it; the project snowballs.

**Fix:** **KISS — keep it simple, stupid.** Decide the aesthetic and palette size against the *project scope* before drawing hero sprites. A simpler aesthetic is often what players prefer anyway, and once a quality standard is set, consistency demands you maintain it everywhere — so set it low on purpose. Start with crap and add detail; don't start with a masterpiece and regress.

## Flash (pillow) shading

**Smell:** the edges of the object are the darkest point and the center is lightest → the form looks **flat**, like a photo taken with a camera flash (hence "flash shading"; others call it "pillow shading").

**Fix:** shade from a **real, directional light source** — surfaces perpendicular to the light are brightest, surfaces turning away darken (see [light-and-depth.md](light-and-depth.md)). Directional shading reads as form; flash shading reads as a blob.

## No texture

**Smell:** an object implies form and depth but conveys nothing about its **material** — a mug looks like a smooth grey form; a wine glass shows a liquid line and nothing else.

**Fix:** objects react to light differently based on surface attributes — **translucency, reflectivity, coarseness**, and multi-color regions. Convey material: translucency through background color showing through, reflections and specular highlights where appropriate, cast shadows that reveal the surface. You won't render every property, but know they exist and pick the ones that matter for the read.

---

## Review checklist

When reviewing pixel art (yours or a teammate's), run this list:

- [ ] No banding / super pixels — shading steps don't share edges with each other or the outline
- [ ] Anti-alias used sparingly — image is crisp, not blurry
- [ ] Lines and shapes look intentional — clean staircases, deliberate curves
- [ ] Palette: medium contrast, medium saturation, minimal color count
- [ ] Detail level matches project scope (KISS) and is consistent across assets
- [ ] Shading comes from a single directional light source, not flash/pillow shading
- [ ] Surfaces convey material (texture, translucency, reflection) where it matters
- [ ] (Animation) No pixel flashing — features carry forward, not pop in/out
- [ ] (Tiles) Base tiles are homogeneous; no stuck-out elements, edge emphasis, or clustering
