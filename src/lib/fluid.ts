/**
 * The physics behind the public site's gestures.
 *
 * These are the two functions and one table that Apple's *Designing Fluid
 * Interfaces* talk actually ships, kept here as pure maths so the components
 * stay about layout and this stays about feel.
 *
 * The idea they all serve: motion should start from where the thing is right
 * now, inherit the speed the user's finger had, and carry on to where that
 * throw was obviously going.
 */

/**
 * Where a flick is heading, given the speed it left your finger at.
 *
 * This is scroll deceleration: velocity decaying exponentially, integrated to
 * its resting point. Note it is *not* the textbook `v² / 2a` — that models
 * constant braking and lands consistently short, which is why hand-rolled
 * carousels feel reluctant. UIScrollView uses the form below.
 *
 * @param velocity  px per second, signed, as the pointer released
 * @param deceleration 0.998 is the system scroll feel; 0.99 is noticeably snappier
 * @returns the signed distance still to travel, in px
 */
export function project(velocity: number, deceleration = 0.998): number {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

/**
 * Progressive resistance past an edge.
 *
 * A hard stop reads as a bug — the surface looks frozen while the finger is
 * plainly still moving. Resistance that grows with the overshoot reads as
 * "you've reached the end", which is the thing we actually want to say.
 *
 * @param overshoot how far past the boundary the pointer is, in px
 * @param dimension the span being dragged, which sets how quickly it stiffens
 * @param constant  0.55 is the iOS value
 * @returns the px the surface should actually move
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (
    (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Spring presets, in Apple's two parameters rather than the physics triplet.
 *
 * `visualDuration` is *response* — how long the value takes to visually arrive,
 * not a fixed duration, since a spring has none. `bounce` is the inverse of
 * damping ratio: 0 is critically damped.
 *
 * The rule for picking one: bounce only where the user's own gesture carried
 * momentum. Overshoot on a flicked card feels like physics; the same overshoot
 * on a panel that merely appeared feels like a toy.
 */
export const SPRING = {
  /** Default for anything repositioning under its own steam. Damping 1.0, response 0.4. */
  move: { type: "spring", visualDuration: 0.4, bounce: 0 },
  /** After a throw or a flick. Damping ~0.8, response 0.4. */
  momentum: { type: "spring", visualDuration: 0.4, bounce: 0.2 },
  /** Sheets and drawers, which want to arrive quickly. Damping ~0.8, response 0.3. */
  sheet: { type: "spring", visualDuration: 0.3, bounce: 0.2 },
  /** Entrances that no gesture preceded — no overshoot, or it reads as decoration. */
  enter: { type: "spring", visualDuration: 0.5, bounce: 0 },
} as const;

/**
 * The reduced-motion counterpart to the springs above. Not "no feedback" — a
 * short cross-fade still answers "something changed", it just doesn't move
 * anything across the viewport.
 */
export const CALM = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;
