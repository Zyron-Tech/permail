"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { CALM, SPRING, clamp, project, rubberband } from "@/lib/fluid";

/**
 * The hero's argument, as a thing you can pick up.
 *
 * The old version of this was a static diagram of one draft fanning into five
 * letters. It stated the claim; this lets you check it. Drag the pile and the
 * same sentence goes past you five times, filled in differently each time —
 * which is the entire product in one gesture.
 *
 * The feel is where the work is:
 *
 * - position tracks the pointer 1:1 and starts from wherever the pile is at
 *   the instant you grab it, so a moving pile can be caught mid-flight
 * - the throw is resolved by projecting the release velocity to its resting
 *   point, not by asking which card is nearest your finger — a fast flick from
 *   barely any movement still advances, which is what a flick means
 * - the spring inherits that velocity, so there is no seam where the drag ends
 *   and the animation begins
 * - the ends resist progressively instead of stopping dead
 */

type Letter = {
  name: string;
  company: string;
  city: string;
  detail: string;
};

/** One draft, five rows of a sheet. The tags below are filled from these. */
const LETTERS: Letter[] = [
  {
    name: "Amara",
    company: "Kite Studio",
    city: "Lagos",
    detail: "the identity work you did for the ferry terminal",
  },
  {
    name: "Tobias",
    company: "Northwind",
    city: "Berlin",
    detail: "how carefully your field guides are set",
  },
  {
    name: "Dana",
    company: "Fold & Co",
    city: "Lisbon",
    detail: "the way your packaging folds flat",
  },
  {
    name: "Wei",
    company: "Bright Lab",
    city: "Taipei",
    detail: "your write-up on testing in the open",
  },
  {
    name: "Inès",
    company: "Atelier Sud",
    city: "Marseille",
    detail: "the colour on your last collection",
  },
];

const LAST = LETTERS.length - 1;

/**
 * Pointer travel, in px, that advances the pile by one letter.
 *
 * The gesture is horizontal, and that is a correctness matter rather than a
 * taste one: this pile sits inside a page that scrolls vertically, so a
 * vertical drag here would be in direct competition with the document. A thumb
 * landing on the deck would either scroll the page or move the pile, and the
 * reader cannot know which. Taking the horizontal axis leaves vertical
 * scrolling untouched — see `touch-pan-y` on the container.
 */
const PITCH = 112;
/** How much give the two ends have, in letters. */
const GIVE = 1.1;

export function LetterDeck({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  /** Continuous position through the pile, in letters. 2.4 means "between the third and fourth". */
  const pos = useMotionValue(0);
  const grabbedAt = useRef(0);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const hinted = useRef(false);
  /** Set the moment the reader grabs the pile, which cancels the opening nudge. */
  const touched = useRef(false);

  // `active` drives the labels and the dots, which are real DOM and so need
  // state; the cards themselves read `pos` directly and never re-render.
  //
  // This fires on every frame of every drag, so the comparison is kept outside
  // setState — handing React the same value 60 times a second still costs it a
  // render pass to discover nothing changed.
  const activeRef = useRef(0);
  useMotionValueEvent(pos, "change", (value) => {
    const settled = clamp(Math.round(value), 0, LAST);
    if (settled === activeRef.current) return;
    activeRef.current = settled;
    setActive(settled);
  });

  const goTo = useCallback(
    (index: number, velocity = 0) => {
      touched.current = true;
      const target = clamp(index, 0, LAST);
      if (reduced) {
        // Reduced motion still gets the change, just not the journey.
        animate(pos, target, CALM);
        return;
      }
      animate(pos, target, { ...SPRING.momentum, velocity });
    },
    [pos, reduced],
  );

  function onPanStart() {
    // Catching a pile in motion: stop where it *is*, not where it was headed.
    pos.stop();
    grabbedAt.current = pos.get();
    touched.current = true;
    setDragging(true);
  }

  function onPan(_event: PointerEvent, info: PanInfo) {
    // Dragging left pulls the next letter forward, so leftward is positive travel.
    const raw = grabbedAt.current - info.offset.x / PITCH;

    if (raw < 0) pos.set(rubberband(raw, GIVE));
    else if (raw > LAST) pos.set(LAST + rubberband(raw - LAST, GIVE));
    else pos.set(raw);
  }

  function onPanEnd(_event: PointerEvent, info: PanInfo) {
    setDragging(false);

    // px/s at the pointer becomes letters/s through the pile.
    const velocity = -info.velocity.x / PITCH;

    // Where the throw was going, not where the finger happened to stop. A
    // fast flick that barely moved still advances; a slow drag most of the way
    // across still falls back. That is what distinguishes the two gestures.
    const projected = pos.get() + project(velocity);

    goTo(Math.round(projected), velocity);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    // Only the horizontal arrows, matching the gesture axis. ArrowUp and
    // ArrowDown are left to the page, which is what a reader expects them to do.
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

    if (event.key in step) {
      event.preventDefault();
      goTo(Math.round(pos.get()) + step[event.key]);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(LAST);
    }
  }

  // One nudge the first time it comes into view, so the pile reads as
  // something you can pick up rather than a picture of one. Once only — a loop
  // would be decoration, and the skill is right that it would also sit near
  // the frequency that makes people queasy.
  //
  // The `touched` check is re-read when the timer fires, not when it is set:
  // anyone who grabs the deck inside the opening half-second has already
  // worked out that it moves, and yanking it out of their hand would be rude.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced || !root.current) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hinted.current) continue;
          hinted.current = true;
          observer.disconnect();
          timer = window.setTimeout(() => {
            if (touched.current) return;
            animate(pos, [0, 0.22, 0], { duration: 1.1, ease: "easeInOut" });
          }, 450);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(root.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pos, reduced]);

  return (
    <div ref={root} className={`w-full max-w-[460px] ${className}`}>
      {/* the one draft, with the tags still in it */}
      <div className="rounded-[6px] border border-cream/15 bg-pine-deep/70 p-4 backdrop-blur-sm">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/40">
          Your draft · written once
        </p>
        <p className="mt-3 font-mono text-[11px] leading-[1.75] text-cream/75">
          Hi <Tag>{"{{first_name}}"}</Tag>, I came across <Tag>{"{{company}}"}</Tag> in{" "}
          <Tag>{"{{city}}"}</Tag> and loved <Tag>{"{{detail}}"}</Tag>…
        </p>
      </div>

      <Seam />

      <motion.div
        role="group"
        aria-roledescription="Stack of letters"
        aria-label={`What each recipient receives. Letter ${active + 1} of ${LETTERS.length}, to ${
          LETTERS[active].name
        }. Swipe sideways, or use the left and right arrow keys.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        /*
          touch-pan-y hands vertical scrolling back to the browser and keeps
          only the horizontal axis for ourselves, so the page never feels stuck
          under a thumb that happened to land here.
        */
        className="relative h-[232px] touch-pan-y select-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sun/70 focus-visible:ring-offset-4 focus-visible:ring-offset-pine"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        {LETTERS.map((letter, index) => (
          <Card key={letter.name} letter={letter} index={index} pos={pos} />
        ))}
      </motion.div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Letters">
          {LETTERS.map((letter, index) => (
            <Dot
              key={letter.name}
              index={index}
              pos={pos}
              selected={index === active}
              name={letter.name}
              onSelect={() => goTo(index)}
            />
          ))}
        </div>

        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/35 sm:text-[10px]">
          {LETTERS.length} separate letters
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── one letter */

/**
 * Each card derives everything from `pos`, so dragging the pile never
 * re-renders React — the transforms go straight to the compositor.
 */
function Card({
  letter,
  index,
  pos,
}: {
  letter: Letter;
  index: number;
  pos: MotionValue<number>;
}) {
  /** Signed distance from the front of the pile, in letters. */
  const d = useTransform(pos, (value) => index - value);

  // Behind the front card the pile compresses to a stepped edge; once read, a
  // letter leaves to the left — the direction the gesture was going.
  const x = useTransform(d, (value) => (value >= 0 ? value * 13 : value * 110));
  const y = useTransform(d, (value) => (value >= 0 ? Math.min(value, 4) * 7 : 0));
  const scale = useTransform(d, (value) =>
    value >= 0 ? 1 - Math.min(value, 4) * 0.04 : 1,
  );
  const rotate = useTransform(d, (value) => (value >= 0 ? Math.min(value, 4) * 0.7 : value * 3));
  const opacity = useTransform(d, (value) =>
    value >= 0 ? clamp(1 - value * 0.26, 0, 1) : clamp(1 + value * 1.9, 0, 1),
  );
  const zIndex = useTransform(d, (value) => Math.round(50 - Math.abs(value) * 10));

  return (
    <motion.article
      aria-label={`To ${letter.name} at ${letter.company}, ${letter.city}`}
      className="absolute inset-x-0 top-0 rounded-[6px] border border-cream/15 bg-pine-deep p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)]"
      style={{ x, y, scale, rotate, opacity, zIndex, transformOrigin: "50% 50%" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] leading-none text-cream">
          {letter.name}
          <span className="text-cream/40"> · {letter.company}</span>
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/35">
          {letter.city}
        </p>
      </div>

      <p className="mt-3.5 text-[12.5px] leading-[1.75] text-cream/80">
        Hi <Filled>{letter.name}</Filled>, I came across <Filled>{letter.company}</Filled> in{" "}
        <Filled>{letter.city}</Filled> and loved <Filled>{letter.detail}</Filled>…
      </p>
    </motion.article>
  );
}

/* ───────────────────────────────────────────────────────────────── the dots */

function Dot({
  index,
  pos,
  selected,
  name,
  onSelect,
}: {
  index: number;
  pos: MotionValue<number>;
  selected: boolean;
  name: string;
  onSelect: () => void;
}) {
  // Width tracks the pile continuously, so the indicator moves *with* the drag
  // rather than catching up after it.
  const nearness = useTransform(pos, (value) => clamp(1 - Math.abs(index - value), 0, 1));
  const width = useTransform(nearness, (value) => 5 + value * 13);
  const opacity = useTransform(nearness, (value) => 0.3 + value * 0.7);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={`Letter to ${name}`}
      onClick={onSelect}
      className="group -m-1.5 p-1.5"
    >
      <motion.span
        className="block h-[5px] rounded-full bg-sun"
        style={{ width, opacity }}
      />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────── trimmings */

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-sun">{children}</span>;
}

/** A filled tag. Underlined rather than coloured, so the letter reads as prose. */
function Filled({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-cream underline decoration-sun/45 decoration-1 underline-offset-[3px]">
      {children}
    </span>
  );
}

/** The join between the draft and the pile it produces. */
function Seam() {
  return (
    <div className="flex items-center gap-3 py-3.5 pl-4" aria-hidden="true">
      <span className="h-6 w-px bg-cream/20" />
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/30">
        becomes
      </span>
      <span className="h-px flex-1 bg-cream/12" />
    </div>
  );
}
