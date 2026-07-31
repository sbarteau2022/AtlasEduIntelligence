# Handoff: Atlas Marketing Site (Light/Dark Mash-Up)

## Overview
Atlas is a marketing/landing page for an AI-powered ethical learning platform ("Atlas, powered by ElleAi / The Ethical Intelligence Project"). This design deliberately mashes two directions into one flow: a dark, cosmic "Atlas" theme (hero, stats, footer) and a light "Optimus" cream/navy theme (impact, three-column, services sections), joined by a shared gold accent and serif/display type system. The nav bar transitions from dark to light styling as the user scrolls past the dark hero into the light body.

The brand mark is the Greek god Atlas, kneeling and bearing a rotating globe on his shoulders — used at three sizes (nav, hero, footer).

## About the Design Files
The files in this bundle are **design references built in static HTML/CSS/JS (with a React+Babel dev-only tweak panel)** — they show the intended look, copy, layout, and motion, not production code to copy verbatim. The task is to **recreate this design pixel-for-pixel inside the existing Atlas codebase** (sbarteau2022/AtlasEduIntelligence), using its real framework/component patterns, routing, and asset pipeline — not by dropping in this HTML file as-is.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and animation timings are all intentional. Recreate exactly: exact hex values, exact font stack, exact spacing/type scale, exact copy, exact motion.

## Screens / Views
This is a single scrolling page (`Atlas.html`) composed of these sections, top to bottom:

### 1. Nav (sticky, theme-shifting)
- Fixed top bar, 70px tall, `padding: 0 40px`, `backdrop-filter: blur(20px) saturate(1.2)`.
- **Dark state** (default, over hero): `background: rgba(10,19,34,0.72)`, border-bottom `rgba(255,255,255,0.08)`.
- **Light state** (`nav.light`, applied via scroll listener once scrollY > hero height): `background: rgba(246,241,231,0.85)`, border-bottom `rgba(13,30,58,0.10)`. All text/logo colors crossfade over `0.45s`.
- Left: Atlas emblem mark (40px) + wordmark "ATLAS" (Cinzel 600, 18px, letter-spacing 0.20em) + sub-label "POWERED BY ELLEAI" (DM Sans, 8px, gold). Divider line, then "An initiative of / The Ethical Intelligence Project" (DM Sans 9px).
- Center-right: nav links — Mission, Learning Paths, Custom Courses, AI Mentor, Research, For Institutions, About (DM Sans 11px, letter-spacing 0.04em).
- Right: "Sign In" (outline button) + "Start Learning →" (solid gold gradient button).

### 2. Hero (dark, cosmic)
- Two-column grid (`1.05fr 0.95fr`), min-height ~100vh minus nav, dark background: starfield dots + layered radial gradients over `linear-gradient(160deg, #0a1322 0%, #0c1a30 60%, #0a1322 100%)`.
- Left column: eyebrow "THE ETHICAL INTELLIGENCE PROJECT" (gold, 10px, 0.26em tracking, with a 34px gold rule before it) → headline "Learn. Grow. Give." set in Cinzel 500, `clamp(54px,7vw,92px)`, line-height 0.98, "Give." colored gold-light → thin gold rule → serif subhead (Cormorant Garamond, 21px) → body copy (DM Sans 12.5px, line-height 1.85, bone-mid) → two CTAs: "Start Learning →" (gold gradient) and "▶ Explore Programs" (ghost outline).
- Right column: the **hero emblem stage** — glow disc, two pulsing ring outlines, the Atlas/globe emblem art, a circular clipped **spinning-globe overlay** (see Interactions), two 3D-tilted orbit rings circling the globe, and below it the wordmark "ATLAS" (Cinzel, 22px, 0.44em tracking) + italic tagline "He carries the world, so everyone can learn it." (Cormorant Garamond italic, gold-light).

### 3. Impact (light, cream)
- `background: #f6f1e7`, padding 84px vertical.
- Left: heading (Cinzel 600, clamp 28–40px, navy) + 2 body paragraphs (DM Sans 12.5px, text-mid #3a4a5c).
- Right: a 3-column bordered node grid ("Learn / Grow / Give" — icon circle, Cinzel 22px title, DM Sans 11px description), the "Give" node title colored gold-deep.

### 4. Three-column (light, cream2)
- `background: #efe7d9`, top border hairline. 3 equal columns separated by vertical hairlines, each: Cinzel 23px heading, DM Sans 12px body, feature-dot bullet rows, and a text-button.
- One column lists "serve" rows (icon circle + title + description + arrow) that highlight/slide the arrow on hover.

### 5. Stats band (dark)
- `background: linear-gradient(180deg, #0c1a30, #0a1322)`, gold hairline top border.
- Left: heading (Cinzel 30px) + sub copy. Right: 5-column stat grid, each stat: 2px gold top rule, big Cinzel number (38px, gold-light), DM Sans label below.

### 6. Footer (deep dark, #060d18)
- Two-column grid (280px + 1fr): brand block (emblem 38px + wordmark + "powered by" sub + initiative line) vs. link columns.
- Bottom bar: copyright text + social icon row, separated by hairline.

## Interactions & Behavior
- **Nav scroll shift**: JS scroll listener toggles the `.light` class on `#nav` once the user scrolls past the hero; all affected properties transition over 0.45s.
- **Hero floaty elements**: `.stage-glow`, `.hero-mark` gently float via an 8s ease-in-out `floaty` keyframe (translateY ±).
- **Pulsing rings**: `.stage-ring` (r1/r2) expand/fade on a 4.5s `ringPulse` loop, r2 offset 1.6s for a staggered double-pulse.
- **Orbit rings**: two 3D-tilted rings (`rotateX(73deg)`/`rotateX(66deg) rotateY(20deg)`) spin continuously via `orbitA`/`orbitB` keyframes; ring B runs at 1.6× the duration, in reverse, for parallax.
- **Spinning globe** (the actual "world" the emblem is holding): a circular `overflow:hidden` clip (58.6% of the emblem's width, centered at 48.2%/25.6% of the emblem box — i.e. over just the sphere, not the statue) contains a second copy of the same emblem image, scaled 171% and offset so the globe artwork lines up exactly with the base image underneath. That inner image rotates back and forth (`-16deg → 16deg`, ease-in-out, alternate) so the globe visibly turns in place while the Atlas figure stays perfectly still. Base cycle length is the `--spin` CSS variable (default 14s); the globe's oscillation runs at `0.55×` that duration. **Rationale for oscillation over a full 360° spin**: the source art is a single illustrated sphere, not a seamless equirectangular texture, so a full rotation would expose the flat/transparent edge of the artwork — the developer should replace this with a true continuously-rotating globe (seamless texture or 3D sphere) if higher-fidelity motion is wanted; the oscillation here is a faithful stand-in for a hand-illustrated static asset.
- **Load-in**: hero text elements fade/slide up in a staggered sequence (`fadeUp` keyframe, 0.9s, delays 0–0.3s) on page load.
- **Dev-only tweak panel** (not for production): a floating control panel (React, loaded only in this HTML prototype) exposes accent color, display font, orbit speed, and starfield toggle for design exploration. Do not port this panel — bake the chosen tweak values in as the final design tokens.

## State Management
No real app state. Only UI state: nav light/dark boolean (derived from scroll position) and the dev tweak-panel's local state (accent palette key, spin duration, font family, starfield on/off) — none of this is user data or needs persistence in production.

## Design Tokens

### Colors
- Ink (dark bg): `--ink #0a1322`, `--ink2 #0c1a30`, `--ink3 #0f2138`
- Navy: `--navy #0d1e3a`, `--navy-mid #1a3058`
- Cream/paper (light bg): `--cream #f6f1e7`, `--cream2 #efe7d9`, `--paper #fbf8f2`
- Gold accent: `--gold #bf8e2c`, `--gold-light #e3b955`, `--gold-deep #9c7320`, `--gold-dim rgba(191,142,44,0.28)`
- Bone (dark-bg text): `--bone #ece2d2`, `--bone-mid #b9ac99`, `--bone-dim #7d7160`
- Text (light-bg text): `--text-dark #0d1e3a`, `--text-mid #3a4a5c`, `--text-dim #6b7a8d`, `--text-light #9aa3ae`
- Borders: `--border-d rgba(255,255,255,0.08)` (dark), `--border-l rgba(13,30,58,0.10)` (light)
- Footer background: `#060d18`

### Typography
- Display (headlines/wordmark): **Cinzel**, weights 400/500/600/700
- Serif (subheads/body accents, italic tagline): **Cormorant Garamond**, weights 300/400/500/600, italic 300/400
- UI (nav, labels, body copy, buttons): **DM Sans** — verify exact weights loaded in the Google Fonts `<link>` in `Atlas.html`'s `<head>`
- Scale in use: 8–9px micro-labels, 10–12.5px body/UI, 14–23px sub/col headings, 28–40px section headings, 38px stat numbers, 54–92px hero headline (fluid via `clamp()`).

### Spacing / Layout
- Content max-width: 1240px, side padding 40px.
- Section vertical padding: 80–84px.
- Nav height: 70px.

### Shadows / Effects
- Hero emblem: `filter: drop-shadow(0 26px 46px rgba(0,0,0,0.45))`.
- Gold button hover glow: `box-shadow: 0 8px 28px rgba(191,142,44,0.45)`.
- Nav blur: `backdrop-filter: blur(20px) saturate(1.2)`.

## Assets
- `atlas-emblem.png` — the primary brand illustration: Atlas (Greek god) kneeling, bearing a globe on his shoulders, with decorative orbit rings baked into the art. Used in nav (40px), hero (410px), footer (38px), and duplicated for the spinning-globe overlay effect.
- `atlas-logo.png`, `atlas-hero.jpg`, `_src-logo.png` — earlier/reference logo and hero art; confirm with design which is final before implementation.
- Icons in the impact/three-col/serve rows are inline SVG — extract as a small icon set if the target codebase uses an icon library.

## Files
- `Atlas.html` — the full page (structure, styles, scroll behavior, spinning-globe effect, and the dev tweak panel).
- `atlas-emblem.png` — brand mark.
