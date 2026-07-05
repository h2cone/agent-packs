# Lines

Distilled from Chapter 5 of *Pixel Art for Game Developers* (Silber, 2016). The medium is nothing but squares, so line quality is the first thing that separates deliberate pixel art from sloppy bitmaps.

## Contents
- The one-pixel rule
- Straight lines
- Diagonal lines
- Curved lines
- Anti-aliasing
- Reuse: cut, paste, mirror, rotate

## The one-pixel rule

Each line is **1 pixel wide** by default. Thicker lines rarely read as pixel art. This is a guideline, not a hard rule — break it only when you have a reason.

## Straight lines

Use the line tool; hold **Shift** to snap a stroke to horizontal or vertical. Don't hand-place axis-aligned runs when a tool will do it perfectly.

## Diagonal lines

A diagonal is a staircase. The steps must look intentional.

- **Use equal segment lengths** — a consistent step pattern reads as a clean line.
- When an equal run can't hit the angle you need, **alternate between two segment lengths** (e.g., 2-1-2-1). Two lengths, repeated.
- **Never use inconsistent step patterns** (e.g., 3-1-2-4-1). The eye reads the irregularity as noise.

## Curved lines

Curves are the hard part. Four rules:

1. **Avoid the lone wolf.** A single pixel sticking out past its neighbors breaks the illusion of a curve. If a pixel stands alone, remove or relocate it.
2. **Make each segment progressively longer or shorter.** A curve's staircase steps should grow (or shrink) along the arc — `1-2-3-4-5`, not `2-4-2-4`. This is what makes a staircase read as a curve rather than a corner.
3. **Beware the circle tool.** Most editors' circle/ellipse tools produce mediocre staircases. Use them to block out a shape, then clean up the steps by rules 1 and 2.
4. **Cut and paste.** Mirror or rotate a clean half-curve to produce the other half. It is always up to your standards and costs half the effort.

## Anti-aliasing

Anti-aliasing softens a staircase edge by inserting a blend color between the line color and the background.

- Create one transition color (line ↔ background) and place it on one or more steps of the line.
- A second transition color (midtone ↔ background) adds crispness on longer runs.
- **Do not overuse it.** Too much anti-alias makes the image look blurry — like a larger picture scaled down. A little goes a long way.
- **Zoom out frequently** to judge the image at viewing size, not at pixel scale.

## Reuse: cut, paste, mirror, rotate

Symmetry and repetition are free. Select a clean sub-shape (a leg, an arm, a half-curve), duplicate it, flip it, place it. This is the single biggest time-saver in pixel art and guarantees the mirrored half is identical to the source.

> **Tool tip (book convention):** in GraphicsGale the right mouse button is an eyedropper while the pen tool is active. Most editors have an equivalent alt-click/eyedropper shortcut — learn it, because swapping colors mid-stroke is constant.
