# Light and depth

Distilled from Chapter 7 of *Pixel Art for Game Developers* (Silber, 2016). These are the rules that make a flat grid of pixels read as three-dimensional form and space. Understand them first; you will break them on purpose for production speed.

## Contents
- Shading (form)
- Highlights and bounced light
- Cast shadow
- Shadow-direction consistency
- Atmospheric perspective
- Linear perspective
- Worked example: shading the colored sprite

## Shading (form)

The single concept that creates 3D form in 2D:

> A surface **perpendicular** to the light source reflects the most light (brightest). As the surface angle approaches **180°** (parallel to the light), it gets **darker**.

For a cube, the face most toward the light is lightest; the face most away is darkest. For a **curved form** (sphere, cylinder, limb), the angle changes continuously, so you represent the gradient with a **ramp** — brightest where the surface faces the light, darkening as it turns away. This is why organized ramps (see [color.md](color.md)) matter.

## Highlights and bounced light

Two effects that often appear on a rounded form:

- **Highlight** (a.k.a. *specular* / *spec hit*): a small, concentrated bright area where light reflects most directly — sheen on a surface.
- **Reflected / bounced light**: light reaching the object from a *secondary* source (e.g., light bouncing off the ground back onto the underside of a sphere). Shows up as a lighter band on the shadow side.

Surface attributes (waxed wood vs. rug) change how much highlight/reflection appears. You won't always render these, but know they exist.

## Cast shadow

An object blocks light, so the surface behind it is unlit.

- **Know your light source** before drawing any shadow — you can't place a cast shadow without one.
- A shadow is **darkest close to where the object touches the surface** and gets **lighter farther away**.
- Shadow **edges blurrier farther** from the casting object.
- Approximate freely — the viewer's eye accepts it within the scene's context.

## Shadow-direction consistency

The one thing viewers notice even if they can't articulate it: a shadow whose direction contradicts the light source.

- The classic bug: **flipping a sprite on the x-axis flips its shading direction.** A left-lit sprite mirrored is now right-lit, and if the rest of the scene is lit from the left, it reads as wrong.
- In a complicated scene, audit every object against the chosen light direction.

You will break this rule deliberately (e.g., to reuse a tile on both sides of a wall) — that's fine, but make it an informed choice, not an accident.

## Atmospheric perspective

Distant objects look **lighter and bluer** because air particles accumulate between them and the viewer. The brain reads three depth cues:

1. **Overlapping** — a foreground object partially covering a background object.
2. **Size** — farther = smaller.
3. **Atmospheric perspective** — farther = lighter, bluer, **less detail, less contrast, less saturation**.

Use this to push backgrounds back so the **interactive layer pops** (more detail, more contrast, more saturation in the foreground). Even a busy background can be made to sit back by shifting its colors lighter/bluer.

## Linear perspective

For structures and scale:

1. Establish a **horizon line** — the imaginary line where ground meets sky. High horizon = looking down; low horizon = looking up.
2. Place a **vanishing point** on the horizon. Parallel lines receding from the viewer converge toward it.
3. Objects **above** the horizon show their **bottoms**; objects **below** show their **tops**.
4. An object's size relative to the vanishing point implies its scale.

A single vanishing point is enough for most game pixel-art situations. Multiple points are possible but rarely worth it here.

> These four tools — shading, cast shadow, atmospheric perspective, linear perspective — give depth. Treat them as rules that help the eye, then break them where production demands it.

## Worked example: shading the colored sprite

**Exercise 7.1** — shade the midtone-filled sprite from [color.md](color.md). Apply "surfaces facing the light are brightest":

1. Head casts a shadow on the shirt; round the shirt edges and add fold lines.
2. Shadow the face: bottom, under the eyes, under the hairline, under the nose, underside of arms/hands.
3. Light the thighs (so shins read as shadowed); add pocket/seam detail with the two darkest blues of the jeans ramp.
4. Shadow the hair and shoes.
5. Add **highlights** where surfaces protrude toward the light: side of the nose, cheekbones, back of hands; lighten the shirt's lit parts and the tops of the shoes.
6. Light the top of the hair.

A flat colored sprite now has form. Diagnostic for wrong shadow direction: find the one object whose shading disagrees with the scene light — usually a sprite flipped on the x-axis without fixing its shading.

Next: simplify and animate ([animation.md](animation.md)).
