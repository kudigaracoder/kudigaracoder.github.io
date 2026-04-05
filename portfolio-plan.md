# Portfolio Plan - Ravishanker Product Designer

## Project Overview
A pure CSS, animation-rich portfolio website for a Product Designer. No build system, no bundler — open files directly in a browser. Deployed via GitHub Pages at `kudigaracoder.github.io`.

---

## File Structure

```
/                               (root — all files at repo root)
├── index.html                  # Main entry: 3-slide pure-CSS carousel
├── index.css                   # All styles including carousel state machine
├── companies.html              # Standalone companies page (direct-access fallback)
├── companies.css               # Styles for standalone companies page
├── links.html                  # Standalone links page (legacy, not primary nav)
├── links.css                   # Styles for standalone links page
└── portfolio-plan.md           # This document
```

---

## Carousel Architecture (index.html + index.css)

### State Machine — 6 radio states

| Radio ID         | Meaning                                   |
|------------------|-------------------------------------------|
| `s1_fwd`         | Slide 1 visible — default, checked on load |
| `s2_fwd`         | Slide 2 (Companies) visible, forward nav  |
| `s1_bwd`         | Slide 1 visible, back from Companies      |
| `s2_bwd`         | Slide 2 visible (intermediate bwd state)  |
| `s3_fwd`         | Slide 3 (Links) visible, forward nav      |
| `s1_from3_bwd`   | Slide 1 visible, back from Links          |

All radio inputs are hidden (`display: none`). Navigation is triggered exclusively by `<label>` elements pointing to radio IDs — clicking slide backgrounds does NOT navigate.

### Slides

#### Slide 1 — Index
- "Ravishanker" (200px, orange `#ff5b00`, Inter 700, -10px letter-spacing)
  - Rendered as `<label for="s3_fwd">` — clicking triggers flip to Slide 3
  - No underline, pointer cursor
- "Product Designer" (180px, white, two lines)
  - Rendered as `<label for="s2_fwd">` — clicking triggers slide to Slide 2
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
- Links list: Resume (`./resume.pdf`, download), LinkedIn (placeholder `#`)
  - 180px, Inter 700, 1.5rem gap, white → orange on hover
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)

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
Background:   #000000
Name accent:  #ff5b00 (orange)
Text:         #ffffff

Company hovers:
  Goldman Sachs:  #7297C5
  R/GA:           #ffffff
  SVA:            #FF3716
  Torry Harris:   #254695
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

---

## Pending / Future

- [ ] Add actual LinkedIn URL (currently placeholder `#`)
- [ ] Add resume PDF to repo and confirm filename
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

---

*Last Updated: April 4, 2026*
*Version: 2.3*
