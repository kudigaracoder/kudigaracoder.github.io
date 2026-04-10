# Portfolio Plan - Ravishanker Product Designer

## Project Overview
A pure CSS, animation-rich portfolio website for a Product Designer. No build system, no bundler — open files directly in a browser. Deployed via GitHub Pages at `kudigaracoder.github.io`.

---

## File Structure

```
/                               (root — all files at repo root)
├── index.html                  # Main entry: 4-slide pure-CSS carousel
├── index.css                   # All styles including carousel state machine
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

### State Machine — 11 radio states

| Radio ID         | Meaning                                   |
|------------------|-------------------------------------------|
| `s1_fwd`         | Slide 1 visible — default, checked on load |
| `s2_fwd`         | Slide 2 (Companies) visible, forward nav  |
| `s1_bwd`         | Slide 1 visible, back from Companies      |
| `s2_bwd`         | Slide 2 visible (intermediate bwd state)  |
| `s3_fwd`         | Slide 3 (Links) visible, forward nav      |
| `s1_from3_bwd`   | Slide 1 visible, back from Links          |
| `s4_fwd`         | Slide 4 (Blog) visible, forward nav       |
| `s3_bwd`         | Slide 3 visible, back from Blog           |
| `s1_from4`       | Slide 1 visible, home from Blog           |
| `s5_fwd`         | Slide 5 (Favorites) visible, forward nav  |
| `s3_from5_bwd`   | Slide 3 visible, back from Favorites      |

All radio inputs are hidden (`display: none`). Navigation is triggered exclusively by `<label>` elements pointing to radio IDs — clicking slide backgrounds does NOT navigate.

### Slides

#### Slide 1 — Index
- "Ravishanker" (200px, `#ff5b00`, Inter 700, -10px letter-spacing)
  - Rendered as `<label for="s3_fwd">` — clicking triggers flip to Slide 3
  - Hover: `opacity: 0.65`; no underline, pointer cursor
- "Product Designer" (180px, `#ff5b00`, two lines)
  - Rendered as `<label for="s2_fwd">` — clicking triggers slide to Slide 2
  - Hover: `opacity: 0.65`
- Location carousel: Coimbatore → Bengaluru → New York City
  - 3D rotateX flip-in/out, plays once, NYC holds at end
  - 10s total, `cubic-bezier(0.77, 0, 0.175, 1)`, `forwards` fill-mode

#### Slide 2 — Companies
- Back button: `<label for="s1_bwd">` (quarter-circle, top-left corner)
- Company list: Goldman Sachs, R/GA, SVA, Torry Harris
  - 180px, Inter 700, 1.5rem gap
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)
- Brand color hovers: Goldman `#7297C5`, R/GA `#fff`, SVA `#FF3716`, Torry Harris `#254695`
- Cross-page access: `companies.html` back button links to `./index.html#back`
  - Small JS snippet at bottom of `index.html` detects `#back` hash and triggers two-frame rAF to run backward animation

#### Slide 3 — Links
- Back button: `<label for="s1_from3_bwd">` (same quarter-circle as Slide 2)
- Links list: Resume (`./resume.pdf`, download), LinkedIn, Blog (`<label for="s4_fwd">`), Favorites (`<label for="s5_fwd">`)
  - 180px, Inter 700, 1.5rem gap, white → orange on hover
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)

#### Slide 4 — Blog
- Back button: `<label for="s3_bwd">` (quarter-circle, top-left)
- Home button: `<label for="s1_from4">` — 160×160px quarter-circle, bottom-left corner, `left: -80px; bottom: -80px`
- Layout: `padding-left: 3%`
- Sidebar: `background: #4a4a4a`, `border-radius: 42px`, `width: 280px`, `box-shadow: 4px 5px 20px 2px rgba(255,255,255,0.35)`
- Posts driven by `blog/manifest.json`: `{ posts: [{ title, date (ISO 8601), file }] }`

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
**Home (S4 → S1):** Backward transition — S4 exits right, S1 enters from left

### S3 ↔ S5 (slide + scale, 5s)

Reuses S1↔S2 keyframes — same staged timing and easing.

**Forward (S3 → S5):** S3 exits left, S5 enters from right
**Backward (S5 → S3):** S5 exits right, S3 enters from left

---

### S1 ↔ S3 (rotateX card flip, 2s)

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
Background:     #000000
Name/Title:     #ff5b00 (orange — both default and accent)
Text:           #ffffff
Hover opacity:  0.65 (name + designation links)

Company hovers:
  Goldman Sachs:  #7297C5
  R/GA:           #ffffff
  SVA:            #FF3716
  Torry Harris:   #254695

Blog sidebar:   #4a4a4a
```

### Spacing
- Viewport: no padding, `overflow: hidden`
- Content: `margin-top: 4%; margin-left: 2%`
- Company/links gap: `1.5rem`
- Location carousel top margin: `3rem`

### Back Button
- 160×160px white circle, positioned at `left: -80px; top: -80px`
- `clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)` — bottom-right quadrant visible
- Creates flush 80×80px quarter-circle at viewport top-left corner
- `z-index: 9999`

---

## Hard Constraints

- **No JavaScript** unless CSS cannot achieve the effect (only exception: `#back` hash detection for cross-page backward animation)
- **No inline styles** — all styling in external `.css` files
- **No `<style>` tags** in HTML
- Semantic HTML5 (`header`, `main`, `nav`, `section`)
- All interactive elements need ARIA labels, keyboard access, visible focus indicators
- `prefers-reduced-motion` block in `index.css` covers all animations
- **`portfolio-plan.md` must be updated in every commit** — update relevant sections and append a version history entry with date and one-line description

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
- S1↔S3 flip: rotateX, 2s, `transform-origin: 0 25%`

### v2.4 — Slide 3 updated + Slide 4 (Blog) added
- April 2026 — Added Blog link to Slide 3; added Slide 4 with home button, blog sidebar (#4a4a4a), S3↔S4 and S4→S1 transitions

### v2.5 — Design polish
- April 2026 — Name/designation color set to #ff5b00; hover opacity 0.65; home button resized to 160×160px; blog layout padding-left 3%

### v2.6 — Slide 5 (Favorites) added
- April 2026 — Added Favorites link to Slide 3; new Slide 5 with S3↔S5 slide+scale transition (5s, reuses S1↔S2 keyframes); full ghost-slide prevention for all states

---

*Last Updated: April 9, 2026*
*Version: 2.6*
