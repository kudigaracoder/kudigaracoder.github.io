# Portfolio Plan - Ravishanker Product Designer

## Project Overview
A portfolio website for a Product Designer with a pure-CSS carousel state machine and a JavaScript-powered theme + blog layer. No build system, no bundler — open files directly in a browser. Deployed via GitHub Pages at `kudigaracoder.github.io`.

---

## File Structure

```
/                               (root — all files at repo root)
├── index.html                  # Main entry: 4-slide carousel
├── index.css                   # All styles including carousel state machine
├── index.js                    # All JavaScript: theme IIFE + blog logic (JSDoc, version history)
├── companies.html              # Standalone companies page (direct-access fallback)
├── companies.css               # Styles for standalone companies page
├── links.html                  # Standalone links page (legacy, not primary nav)
├── links.css                   # Styles for standalone links page
├── resume.pdf                  # Resume download (referenced, not yet added)
├── blog/
│   └── manifest.json           # Blog post list: { posts: [{ title, date, file }] }
└── portfolio-plan.md           # This document
```

---

## Carousel Architecture (index.html + index.css)

### State Machine — 8 radio states

| Radio ID           | Meaning                                    |
|--------------------|--------------------------------------------|
| `s1_fwd`           | Slide 1 visible — default, checked on load  |
| `s2_fwd`           | Slide 2 (Companies) visible, forward nav   |
| `s1_bwd`           | Slide 1 visible, back from Companies       |
| `s2_bwd`           | Slide 2 visible (intermediate bwd state)   |
| `s3_fwd`           | Slide 3 (Links) visible, forward nav       |
| `s1_from3_bwd`     | Slide 1 visible, back from Links           |
| `s4_fwd`           | Slide 4 (Blog) visible, forward nav        |
| `s3_from4_bwd`     | Slide 3 visible, back from Blog            |

All radio inputs are hidden (`display: none`). Navigation is triggered exclusively by `<label>` elements pointing to radio IDs.

### Slides

#### Slide 1 — Index
- "Ravishanker" (200px, `var(--accent)`, Inter 700, -10px letter-spacing)
  - Rendered as `<label for="s3_fwd">` — clicking triggers flip to Slide 3
  - Hover: `opacity: 0.65`; no underline, pointer cursor
- "Product Designer" (`var(--accent)`, two lines)
  - Rendered as `<label for="s2_fwd">` — clicking triggers slide to Slide 2
  - Hover: `opacity: 0.65`
- Location carousel: Coimbatore → Bengaluru → New York City
  - 3D rotateX flip-in/out, plays once, NYC holds at end
  - 10s total, `cubic-bezier(0.77, 0, 0.175, 1)`, `forwards` fill-mode

#### Slide 2 — Companies
- Back button: `<label for="s1_bwd">` (quarter-circle, top-left corner)
- Company list: Goldman Sachs, R/GA, SVA, Torry Harris, Other Work
  - `min(var(--title-size), 16vh)`, Inter 700, 1.5rem gap, `overflow: hidden`
  - Default color: `var(--toggle-bg)` (black in light, white in dark)
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)
- Brand color hovers: Goldman `#7297C5`, R/GA `#fff`, SVA `#FF3716`, Torry Harris `#254695`
- Other Work: no hover color (generic category)
- Cross-page access: `companies.html` back button links to `./index.html#back`
  - JS in `index.js` (DOMContentLoaded) detects `#back` hash and triggers two-frame rAF

#### Slide 3 — Links
- Back button: `<label for="s1_from3_bwd">` (same quarter-circle as Slide 2)
- Links list: Resume (`./resume.pdf`, download), LinkedIn, Blog (`<label for="s4_fwd">`)
  - 180px, Inter 700, 1.5rem gap
  - Default color: `var(--toggle-bg)`; hover: `var(--accent)`; LinkedIn hover: `#1566C2`
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)

#### Slide 4 — Blog
- Back button: `<label for="s3_from4_bwd">` (quarter-circle, top-left)
- Home button: `<label>` element — 160×160px quarter-circle, bottom-left corner, `left: -80px; bottom: -80px`; triggers `s1_fwd` via JS
- Layout: `padding-left: 3%`
- Sidebar (320px wide): post list populated from `blog/manifest.json` via `index.js`
- Posts driven by `blog/manifest.json`: `{ posts: [{ title, date (ISO 8601), file }] }`
- Markdown rendered via marked.js (lazy-loaded from jsDelivr CDN on first blog visit)

---

## Transition Animations

### S1 ↔ S2 (slide + scale, 5s)

**Forward (S1 → S2):** staged keyframes
1. 0–20%: Slide 1 scales down to 90%
2. 20–60%: Slide 1 slides left to -110%
3. 20–60%: Slide 2 slides in from 110%
4. 60–100%: Slide 2 scales up to 100%

**Backward (S2 → S1):** staged keyframes (mirrors forward)
1. 0–20%: Slide 2 scales down to 90%
2. 20–60%: Slide 2 slides right to 110%
3. 20–60%: Slide 1 slides in from -110%
4. 60–100%: Slide 1 scales up to 100%

Easing: `cubic-bezier(0.77, 0, 0.175, 1)`

### S3 ↔ S4 (slide + scale, 5s)

Reuses S1↔S2 keyframes — same staged timing and easing.

**Forward (S3 → S4):** S3 exits left, S4 enters from right
**Backward (S4 → S3):** S4 exits right, S3 enters from left

### S1 ↔ S3 (rotateX card flip, 1s)

**Forward (S1 → S3):**
- Slide 1: `rotateX(0deg) → rotateX(-90deg)` (folds away, opacity 0 at 40%)
- Slide 3: `rotateX(90deg) → rotateX(0deg)` (folds in, starts at 60%)

**Backward (S3 → S1):**
- Slide 3: `rotateX(0deg) → rotateX(90deg)` (folds away)
- Slide 1: `rotateX(-90deg) → rotateX(0deg)` (folds in)

Transform origin (scoped to flip states only): `0 25%` — left edge, 25% from top
Perspective: `1200px` on `.slides` container
Easing: `cubic-bezier(0.77, 0, 0.175, 1)`

---

## Theme System

### Auto mode
- Hour 06:00–17:59 local time → `data-theme="light"` on `<body>`
- Hour 18:00–05:59 local time → `data-theme="dark"` on `<body>`
- Set by synchronous IIFE in `index.js` (loaded in `<head>`, no defer) — runs before paint

### Manual toggle
- Quarter-circle button, top-right corner of viewport
- Click triggers two-phase radial wipe animation (`clip-path: circle()`)
- Hover: `scale(1.05)`, `transform-origin: 50% 50%`

### CSS variables
```css
[data-theme="dark"]  { --bg: #000; --toggle-bg: #fff; --accent: #ff5b00; }
[data-theme="light"] { --bg: #fff; --toggle-bg: #000; --accent: #ff5b00; }
```

`--toggle-bg` is used for text that must be readable on both backgrounds (company names, link items). `--accent` is used for name/designation and hover states.

---

## Design System

### Typography
- Font: Inter (Google Fonts), weights 300–700
- Large display: 700 weight, `-10px` letter-spacing, `0.9` line-height
- Breakpoints:
  - `>768px`: `--name-size: 200px`, `--title-size: 180px`
  - `≤768px`: `80px / 72px`
  - `≤480px`: `48px / 42px`

### Colors
```
Background (dark):  #000000
Background (light): #ffffff
Accent:             #ff5b00 (orange — name, designation, hovers)
Text default:       var(--toggle-bg)

Company hovers:
  Goldman Sachs:  #7297C5
  R/GA:           #ffffff
  SVA:            #FF3716
  Torry Harris:   #254695

LinkedIn hover:     #1566C2
```

### Spacing
- Viewport: no padding, `overflow: hidden`
- Content: `margin-top: 4%; margin-left: 2%`
- Company/links gap: `1.5rem`
- Location carousel top margin: `3rem`
- Blog layout: `padding-left: 3%`

### Back Button
- 160×160px white circle, positioned at `left: -80px; top: -80px`
- `clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)` — bottom-right quadrant visible
- Creates flush 80×80px quarter-circle at viewport top-left corner
- `z-index: 9999`

---

## JavaScript Architecture (index.js)

- Loaded in `<head>` without defer/async — theme IIFE runs synchronously before paint
- All DOM-dependent init code wrapped in `DOMContentLoaded`
- JSDoc comments on every function
- Version history at top of file (date · timestamp · one-line description)

### Key functions
| Function | Purpose |
|----------|---------|
| Theme IIFE | Sets `data-theme` from local hour before paint |
| `toggleTheme()` | Two-phase radial wipe animation |
| `loadMarked(cb)` | Lazy-loads marked.js from CDN |
| `formatBlogDate(iso)` | Formats ISO date as "April 8, 2026 · 10:00 AM" |
| `escapeHtml(s)` | XSS prevention for untrusted content |
| `activateBlogPost(index)` | Fetches .md file and renders with marked |
| `initBlog()` | Fetches manifest.json and populates sidebar |

---

## Hard Constraints

- **JavaScript must be in `index.js`** — no inline `<script>` blocks in HTML
- **`index.js` must have JSDoc comments on every function and a version history at the top**
- **No inline styles** — all styling in external `.css` files
- **No `<style>` tags** in HTML
- Semantic HTML5 (`header`, `main`, `nav`, `section`)
- All interactive elements need ARIA labels, keyboard access, visible focus indicators
- `prefers-reduced-motion` block in `index.css` covers all animations
- **`portfolio-plan.md` must be updated in every commit** — update relevant sections and append a version history entry with date and one-line description
- **Never commit without user verification** — after making changes, prompt the user to verify in the browser before committing; only commit after explicit confirmation
- **When copying from another branch, prefer JS if simpler** — if replicating a feature in JS is less complex than pure CSS, use JS. The "no JS unless necessary" rule applies to new features, not cross-branch ports.

---

## Pending / Future

- [ ] Add actual LinkedIn URL (currently placeholder `#`)
- [ ] Add `resume.pdf` to repo
- [ ] Add blog post markdown files (currently `blog/manifest.json` exists but no `.md` files)
- [ ] Goldman Sachs detail overlay (pure CSS `:target`, partial implementation in `companies.html`)
- [ ] Expand companies to individual case study slides

---

## Version History

### v1.0 — Standalone pages
- index.html, companies.html, links.html with individual CSS files
- Location carousel, company hover colors, back buttons

### v2.0 — Carousel integration
- Carousel embedded in index.html (4-state radio machine)
- 5s staged slide+scale transitions (forward and backward)
- Location animation plays once, holds NYC

### v2.1 — Root restructure + cross-page animation
- All files moved from `portfolio/` to repo root
- Back button on `companies.html` triggers backward carousel animation via `#back` hash + rAF

### v2.2 — Layout polish
- `margin-left: 2%` on content
- Back button: 160×160px, positioned at (-80, -80), `z-index: 9999`

### v2.3 — Links as Slide 3
- Added `s3_fwd` and `s1_from3_bwd` radio states
- "Ravishanker" name → `<label for="s3_fwd">` trigger
- Slide 3 with Resume + LinkedIn links, matching company-list typography
- S1↔S3 flip: rotateX, 1s, `transform-origin: 0 25%`

### v3.0 — fullJS-rewrite: JS architecture + auto theme + blog
- April 2026 — JavaScript extracted to index.js (JSDoc + version history); auto dark/light mode (06:00–18:00); theme toggle with radial wipe; Slide 3 updated with Blog link; Slide 4 (Blog) with manifest.json-driven sidebar and marked.js markdown rendering; all slide colors updated for light/dark compatibility (var(--toggle-bg))

### v3.1 — Theme toggle hover state
- April 2026 — Theme toggle hover: scale(1.05), transform-origin: 50% 50% (corner of visible quarter-circle)

### v3.2 — Add Other Work to companies slide
- April 2026 — Added Other Work as 5th company; font-size capped at min(title-size, 16vh) to fit all 5 without scrolling; overflow: hidden on company-main

### v3.3 — Fix company detail dismiss (Esc + back button reset)
- April 2026 — Added transition to .company-detail base rule for smooth Esc dismiss; broadened JS carousel-change listeners to cover all states leaving Slide 2; added CSS s1_bwd suppression rules as belt-and-suspenders fallback; added "prefer JS when simpler" hard constraint

---

*Last Updated: April 13, 2026*
*Version: 3.3*
