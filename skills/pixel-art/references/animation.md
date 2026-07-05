# Animation

Distilled from Chapter 8 of *Pixel Art for Game Developers* (Silber, 2016). Animation brings a static sprite to life, but pixels introduce one chronic problem — pixel flashing — that frames every other decision here.

## Contents
- Frame rate and in-place animation
- Workflow and onion skinning
- Pixel flashing (the chronic problem)
- Anticipation and follow-through
- Squash and stretch
- Fast motion
- Game-specific constraints
- Sprite preparation and chunk animation

## Frame rate and in-place animation

- Traditional animation: 24 fps (lower risks looking choppy). 30 fps is common today; 60 fps is super-smooth and rarely needed for pixel art.
- **Animate in place.** A walk cycle is a loop of the character walking without advancing; a script moves the sprite across the screen. Never bake screen motion into the frames.

## Workflow and onion skinning

The core loop: **duplicate the current frame**, make small changes, repeat. Use **onion skinning** (see adjacent frames as semi-transparent ghosts) to judge the motion — it emulates a light table.

## Pixel flashing (the chronic problem)

> When a pixel or group of pixels **suddenly appears or disappears** rather than moving position, the eye reads it as a flash. It is jarring.

This is the single most troublesome aspect of animating pixels. It is sometimes unavoidable at very low resolutions, but minimize it: **keep transitions smooth** — when a feature turns or deforms, carry its pixels forward rather than popping new ones in and out. Once you train your eye to see it, you can't unsee it.

## Anticipation and follow-through

- **Anticipation** — a motion that signals what's about to happen: winding up before a throw, pulling back before a strike. **Exaggerate it** — pull the arm, head, and body back, not just the limb. Anticipation sells the action.
- **Follow-through** — the continuation of motion *after* the action completes: a pitcher's arm keeps traveling; hair and sleeves fly forward; weight shifts to the other foot.
- **Secondary animation** — parts that move in reaction to the primary motion (clothing, a hat, a ponytail). Secondary animation is where "alive" comes from.

Often you can create anticipation or follow-through by moving **one or two pixels** — that's the leverage of the medium.

## Squash and stretch

Deform the character beyond what's physically possible to exaggerate force:

- **Squash** — wider and shorter. Use it as anticipation (crouch before a jump).
- **Stretch** — taller and narrower. Use it during motion (spring upward).
- **Place the most-squashed frame directly next to the most-stretched frame.** The contrast is what sells impact (perfect for a cannon blast).
- Works on inanimate objects too — a cannon squashes on recoil and stretches on blast.
- Decouple secondary parts: a hat can lag behind as the body squashes, drifting down after.

These look comical as still frames but blend into convincing motion.

## Fast motion

When an object must move a large distance in one frame, the eye loses it between frames. Fix with a **ghost trail** — repeat faint copies of the shape along the path, or stretch the shape along the motion line.

## Game-specific constraints

Animation for games differs from film. A film character is animated for the exact scene; a game character's state is driven dynamically by player and environment, so motion is **sliced into individual loopable actions**:

- Core: walk cycle, run cycle, idle, attack(s), death, jump.
- Optional: landing, emote/dance, crouch, damage, climb, draw weapon, balance-recovery.

**Transitions between actions snap** — there is no transition animation. Players expect immediate feedback, and building transitions between all pairs is combinatorially impossible (13 actions → 144 transitions). Accept the snap.

- **Walk cycle**: 8 frames is typical; 16 for silky smooth; 2–3 for the barest suggestion.
- **Idle**: subtle. A 2-frame chest-heave (torso + arms shift 1px up, head/legs static) at ~2 fps (500 ms/frame) is enough life. **One pixel of movement is a valid idle.**
- Minimum move distance is **1 pixel** — on a 3-pixel-tall foot that's a third of the foot, so plan idles around what 1px can convey.

## Sprite preparation and chunk animation

- **Simplify before animating.** Reduce detail and cap each hue ramp at ≤2 colors. More detail = more frames to keep consistent = more pixel-flash risk. The great 2D animators use simple, stylized characters and win on quality of movement.
- **Put one arm and one leg in shadow.** In a side-view it identifies which limb is front vs. back.
- **Animate in chunks.** Treat the sprite as a few rigid sections (head, torso, arm, leg) — move whole sections intact rather than redrawing each frame. This preserves texture continuity and suppresses pixel flash. Use layers or a "chunk as brush" feature.
- **Dithering and animation are mortal enemies.** Dither textures shift frame to frame and flash badly. Don't dither anything that will animate.

> For the broader craft, the book recommends Richard Williams' *The Animator's Survival Kit*.
