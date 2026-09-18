# Photography — where it goes, and what it replaces

Nothing on the homepage is a photograph yet. Three drawings hold those positions
instead, in [`src/components/illustrations.tsx`](../../src/components/illustrations.tsx).
They are layers rather than pictures in boxes — one bleeds across the full width, one
is cropped by its own edge, one sits behind type — so swapping in a photograph is a
layout decision, not a drop-in. This file says what each one is doing and what kind of
picture would take its place.

`ImageSlot` (in [`src/components/image-slot.tsx`](../../src/components/image-slot.tsx))
is still there for that: it handles the aspect ratio, the responsive `sizes` hint, and
a taller crop on phones. Import it, hand it `src` and `alt`, and drop it where the
drawing is.

---

## Direction, if you do shoot

The page is white, wide-margined and typographically quiet, so photographs carry all of
the warmth. That only works if they are consistent.

| | |
| --- | --- |
| **Light** | Daylight, directional, from one side. No flash, no ring light, no HDR. |
| **Palette** | Oatmeal, warm grey, bone, black, deep green. Nothing that fights the pine (`#0e3b2e`) or the brass (`#f7b638`). |
| **Saturation** | Low. A printed magazine, not a phone screen. |
| **Framing** | Loose. Leave air — the design is already generous and the pictures should agree. |
| **People** | One person, absorbed in something. Mid-action, not looking at camera unless it is the portrait. |
| **Avoid** | Stock smiles, team high-fives, hands on a laptop shot from above, other products' logos, anything obviously AI-generated (check hands, text on screens, chair legs). |

JPEG, quality 80, sRGB, under ~400 KB each.

---

## A · The fan-out — `DeskScene`

Full-bleed, directly under the pine hero. Someone at a desk; the letters rise and fly
off the right edge of the screen. Its floor line **is** the rule under the section, which
is why the proof strip below carries no top border.

> **As a photograph:** one person mid-sentence at a real desk, window light from the
> left, muted neutrals, shot wide with quiet space beside them. 21:9, export 2880 × 1234.

Swapping it changes the section: you lose the floor-line trick, so give the proof strip
its top border back (`border-y` instead of `border-b`) and wrap the photo in `ImageSlot`
inside the `WIDE` container.

---

## B · The portrait — `Portrait`

Beside the pull quote, sitting over a flat bone disc, shoulders cut off by the drawing's
own bottom edge. The crop is the point — it stops it reading as a framed picture.

> **As a photograph:** the actual person quoted. Three-quarter, looking just off-lens,
> soft daylight against a plain wall, shoulders-up. 4:5, export 1400 × 1750.

A stock face next to a real sentence is the one thing that will make the page read fake.
Replace `Name Surname` / `Role, Company` under the quote at the same time.

---

## C · The studio — `StudioDusk`

Not beside the closing panel — *inside* it, drawn tone-on-tone behind the type at about
10% cream. A room at the end of the day: table cleared, laptop closed, someone at the
window. It carries mood, not information.

> **As a photograph:** this one does not translate. A photo cannot sit behind white type
> at that weight without dirtying it. If you want a picture here, give it its own
> full-bleed band above the panel instead, 21:9 — a wide, quiet, nearly-empty scene with
> plenty of light.

`StudioDusk` also takes `variant="light"` if you ever want it on a white ground.

---

## The hero backdrop — `HeroBackdrop`

Giant envelopes and sweep lines at 7–9% cream, bleeding off every edge of the hero. It is
deliberately below the threshold where you stop to look at it. Not a photo slot; leave it
be, or delete it in one line if the hero ever gets a photograph.

---

## L1–L5 · Wordmarks

The "Sent by people at" strip, still dashed placeholders. Swap `<LogoSlot>` for an
`<Image>` or inline SVG once you have permission to name customers.

- SVG if you have it; otherwise PNG with transparency at 3× the 36px display height.
- Flat black at ~55% opacity, so no single brand dominates the row.
- **Five is the right number.** Three looks thin, seven looks like filler.

If you do not have five customers who have said yes, delete the section rather than
inventing them — an empty logo wall is more convincing than a fictional one.

---

## Optional, later

- **Open Graph card** — `1200 × 630` at `public/og.jpg`, wired up in
  [`src/app/layout.tsx`](../../src/app/layout.tsx) via `metadata.openGraph.images`.
- **Favicon** — the wordmark's brass dot, or a `P` set in Geist.
