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
- Company list: Goldman Sachs, R/GA, SVA, Torry Harris, Other Work
  - `min(var(--title-size), 16vh)`, Inter 700, 1.5rem gap, `overflow: hidden`
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)
  - Goldman Sachs rendered as `<label for="co_goldman">` — clicking triggers detail expand view
- Brand color hovers: Goldman `#7297C5`, R/GA `#fff`, SVA `#FF3716`, Torry Harris `#254695`
- Other Work: no hover color (generic category)
- Cross-page access: `companies.html` back button links to `./index.html#back`
  - Small JS snippet at bottom of `index.html` detects `#back` hash and triggers two-frame rAF to run backward animation
- **Company detail expand view** (Goldman Sachs, v2.8):
  - Radios `co_none` (default) and `co_goldman` inside `.slide-2`; CSS `:has()` drives all state
  - Click Goldman → title appears at top (`#7297C5`), other companies scale 1→0.5 + fade, summary slides down from title (opacity 0→1, 0.35s delay), actions row fades in (0.55s delay)
  - Detail view: `company-detail__header` + `company-detail__summary` (Lorem Ipsum placeholder) + `company-detail__actions` (rounded "Read More" button + "Hit Esc to go back" hint)
  - All transitions reverse automatically on `co_none` checked
  - Escape key resets via JS `keydown` listener (second approved JS exception)

#### Slide 3 — Links
- Back button: `<label for="s1_from3_bwd">` (same quarter-circle as Slide 2)
- Links list: Resume (`./resume.pdf`, download), LinkedIn, Blog (`<label for="s4_fwd">`), Favorites (`<label for="s5_fwd">`)
  - 180px, Inter 700, 1.5rem gap, white → orange on hover
  - Flip-down entry animation on load (rotateX -90deg → 0, 1.2s)

#### Slide 4 — Blog
- Back button: `<label for="s3_bwd">` (quarter-circle, top-left)
- Home button: `<label for="s1_from4">` — 160×160px quarter-circle, bottom-left corner, `left: -80px; bottom: -80px`
- Static "Blog" heading: `position: absolute; top: -3%; left: 90px; font-size: 150px; font-weight: 700; letter-spacing: -10px; color: #fff`
- Tabs: "Changelog / Blog Posts" — 50px Inter 700, fill-animation hover/active, separator `blog-tab-sep` stays white; driven by `blog_tab_changelog` / `blog_tab_posts` radio pair
- Layout: `flex-direction: column; padding-top: calc(150px - 3vh + 1rem); padding-left: 3%`
- Two panels (Changelog, Blog Posts): each a flex-row split — sticky sidebar (280px, `border-top: 2px solid #8c8c8c`) + scrollable content (`border-top: 2px solid #8c8c8c`); `gap: 1rem` between panels
- Sidebar: "LATEST RELEASES" header at 16px Inter Regular; no background, no right border
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

## Resume Reference (`files/Latest-Resume.pdf`)

| Company | Role | Dates |
|---|---|---|
| Goldman Sachs, New York City | Vice President, User Experience | Aug 2020 – Present |
| R/GA, Portland, Oregon | Experience Design Intern | June 2019 – Sept 2019 |
| Torry Harris, Bengaluru | Product Design Lead | Oct 2015 – Aug 2018 |
| Torry Harris, Bengaluru | Product Designer, Nucleus | Aug 2016 – Aug 2018 |
| Torry Harris, Bengaluru | Mobility Lead, CoE | Jan 2012 – Oct 2015 |
| Everything Everywhere, Bristol/Bengaluru | Team Lead / Software Analyst | July 2005 – Dec 2011 |

Education: MFA Interaction Design, School of Visual Arts, May 2020 · B.Sc Computer Science, PSG College of Technology, 2005

---

## Hard Constraints

- **No JavaScript** unless CSS cannot achieve the effect (approved exceptions: `#back` hash detection for cross-page backward animation; `keydown` Escape listener for company detail reset; hash-based direct slide navigation)
- **No inline styles** — all styling in external `.css` files
- **No `<style>` tags** in HTML
- Semantic HTML5 (`header`, `main`, `nav`, `section`)
- All interactive elements need ARIA labels, keyboard access, visible focus indicators
- `prefers-reduced-motion` block in `index.css` covers all animations
- **`portfolio-plan.md` and `changelog.html` must be committed alongside every code change** — include a version history entry (sequence number, version, date, description) and the corresponding `changelog.html` entry in the same commit, never as a follow-up
- **Never commit without user verification** — after making changes, prompt the user to verify in the browser before committing; only commit after explicit confirmation
- **Cross-check resume** — when adding dates, roles, or company names to the portfolio, always verify against `files/Latest-Resume.pdf` (resume reference table above); never use user-stated info without confirming it matches the resume
- **No direct commits to master** — all changes must go through a feature branch and pull request; never commit directly to `master`

---

## Pending / Future

- [ ] Add actual LinkedIn URL (currently placeholder `#`)
- [ ] Add `resume.pdf` to repo
- [ ] Add blog post markdown files (currently `blog/manifest.json` exists but no `.md` files)
- [ ] Goldman Sachs detail overlay (pure CSS `:target`, partial implementation in `companies.html`)
- [ ] Expand companies to individual case study slides

---

## Version History

### [1] v1.0 — Standalone pages
- index.html, companies.html, links.html with individual CSS files
- Location carousel, company hover colors, back buttons

### [2] v2.0 — Carousel integration
- Carousel embedded in index.html (4-state radio machine)
- 5s staged slide+scale transitions (forward and backward)
- Location animation plays once, holds NYC

### [3] v2.1 — Root restructure + cross-page animation
- All files moved from `portfolio/` to repo root
- Back button on `companies.html` triggers backward carousel animation via `#back` hash + rAF

### [4] v2.2 — Layout polish
- `margin-left: 2%` on content
- Back button: 160×160px, positioned at (-80, -80), `z-index: 9999`

### [5] v2.3 — Links as Slide 3
- Added `s3_fwd` and `s1_from3_bwd` radio states
- "Ravishanker" name → `<label for="s3_fwd">` trigger
- Slide 3 with Resume + LinkedIn links, matching company-list typography
- S1↔S3 flip: rotateX, 2s, `transform-origin: 0 25%`

### [6] v2.4 — Slide 3 updated + Slide 4 (Blog) added
- April 2026 — Added Blog link to Slide 3; added Slide 4 with home button, blog sidebar (#4a4a4a), S3↔S4 and S4→S1 transitions

### [7] v2.5 — Design polish
- April 2026 — Name/designation color set to #ff5b00; hover opacity 0.65; home button resized to 160×160px; blog layout padding-left 3%

### [8] v2.6 — Slide 5 (Favorites) added
- April 2026 — Added Favorites link to Slide 3; new Slide 5 with S3↔S5 slide+scale transition (5s, reuses S1↔S2 keyframes); full ghost-slide prevention for all states

### [9] v2.7 — Add Other Work to companies slide
- April 2026 — Added Other Work as 5th company; font-size capped at min(title-size, 16vh) to fit all 5 without scrolling; overflow: hidden on company-main

### [10] v2.8 — Goldman Sachs company detail expand view
- April 2026 — Clicking Goldman Sachs expands detail view: title floats to top (brand color), other companies scale+fade, work summary slides in, Read More button + Esc hint appear; Escape resets to list; CSS :has() + company radio group; JS Escape listener

### [11] v2.9 — Company detail expand view for all companies
- April 2026 — Extended detail expand view to R/GA, SVA, Torry Harris, Other Work; each title floats to top via translateY(-N × --company-item-h); dates from resume; Other Work has no date; all transitions and Esc/back reset work consistently

### [12] v2.10 — Add designations, spacing, summary right margin
- April 2026 — Add company-detail__role (90px) with resume-accurate designations for Goldman, R/GA, SVA, Torry; stagger delays shifted (role 1.5s → date 1.7s → summary 1.9s → actions 2.1s); actions margin-top 1rem + margin-bottom 1rem; summary p margin-block-end 0.25rem; date margin-top 1vh; padding-right 5% on .company-detail to keep text off edge

### [13] v2.11 — Slide 1 title hover fill animation
- April 2026 — Replace opacity hover with background-clip text fill: default white, hover fills orange left-to-right, drains right-to-left on mouse-out; product-designer-link margin-top 0.8rem → 0.5rem, padding-bottom 1.5rem to prevent bottom clipping; prefers-reduced-motion suppresses transition

### [14] v2.12 — Extend fill hover to all titles
- April 2026 — Apply background-clip fill hover to link-items (Slide 3: orange; LinkedIn: brand blue) and company names (Slide 2: each company's brand color; Other Work: orange); fix LinkedIn box-fill bug by re-declaring background-clip after background shorthand; add padding-bottom to link-items (1.5rem) and Torry Harris (1.2rem) to fix descender clipping

### [15] v2.13 — Reduce spacing between Product Designer and location carousel
- April 2026 — .locations-outer margin-top 3rem → 1rem

### [16] v2.14 — Hash-based direct slide navigation + links gap reduction
- April 2026 — Add JS hash map (#companies, #about, #blog, #favorites) to navigate directly to slides on page load; suppress transition animation via .carousel.instant; reduce .links-list gap 1.5rem → 1rem

### [17] v2.15 — Blog slide: tabs + static title + split panels
- April 2026 — Add "Changelog / Blog Posts" tab bar (50px bold, fill-animation, static separator); add "Blog" static heading (150px, position:absolute); restructure blog-layout to flex column with two switchable panels; sticky sidebar; 2px #8c8c8c top border on sidebar + content; "LATEST RELEASES" label 16px; remove sidebar background

### [18] v2.16 — Home button SVG + Goldman title update
- April 2026 — Replace ⌂ Unicode character with icons/home.svg; reposition home-btn__icon to left:110px, top:50px; update Goldman Sachs role to "Vice President, User Experience"

### [19] v2.17 — Dynamic URL hash on slide navigation
- April 2026 — Add JS radioHashMap listeners to update URL hash via history.replaceState on every slide radio change; clears hash on Slide 1

### [20] v2.18 — Changelog entry template (Subframe BlogTitle port)
- April 2026 — Add changelog-entry HTML/CSS template mirroring Subframe BlogTitle component; properties: __num (48px entry number), __feature (accent label, maps to Subframe version), __date, __sep, __title, __description, __image (optional, 192px); sidebar changelog-nav-link; font-weight 500 + letter-spacing 0.2em on meta row

### [21] v2.19 — Changelog nav link layout: row with 1rem gap
- April 2026 — changelog-nav-link flex-direction column → row; gap 0.15rem → 1rem

### [22] v2.20 — Map version history to changelog; add sequence numbers
- April 2026 — Populate Changelog panel with all 21 version history entries (reverse chronological); prefix portfolio-plan version headings with [N] sequence numbers; add changelog update discipline hard constraint

### [23] v2.21 — Changelog panel: scroll, DateItem/SectionHeader, anchor nav, scrollbar reveal
- April 2026 — Both sidebar and content scroll independently (min-height:0, overflow-y:auto); replace changelog-nav-link with Subframe DateItem; group entries by month under SectionHeader (April 2026 / Earlier); anchor clicks scroll .blog-content via JS (prevents carousel layout break); scrollbars hidden by default, revealed 800ms on scroll via .is-scrolling; panel gap 1rem → 2.5rem; JS comments added

### [24] v2.22 — Extract changelog and blog posts into HTML fragment files
- April 2026 — Move blog panel content into changelog.html and blog-posts.html (fragment files, no boilerplate); index.html panel divs become empty shells with data-src attributes; JS fetch() loads and injects each fragment at runtime; IIFE and inline click handler refactored into named functions setupScrollReveal and setupChangelogNav called after fetch resolves; hard constraint updated to require portfolio-plan version entry in same commit as code change

### [25] v2.23 — R/GA detail: real copy, typography polish, Coming Soon button
- April 2026 — Replace lorem ipsum in R/GA summary with real copy; company-detail__summary line-height 0.9→1.1, color #8e8e8e→#ffffff (global); margin-block-start 1em→0.4em on summary p (global); R/GA Read More→Coming Soon, disabled (aria-disabled, tabindex=-1, pointer-events:none, opacity:0.35)

### [26] v2.24 — SVA detail: real copy, Coming Soon button
- April 2026 — Replace lorem ipsum in SVA summary with FJORD/freelancer brief copy; SVA Read More→Coming Soon, disabled (same pattern as R/GA)

### [27] v2.25 — Torry Harris detail: real copy, Coming Soon button
- April 2026 — Replace lorem ipsum in Torry Harris summary with UX team/Nucleus copy; Torry Harris Read More→Coming Soon, disabled (same pattern as R/GA)

### [28] v2.26 — Blog Posts sidebar: scroll reveal, DateItem/SectionHeader; cursor pointer fixes
- April 2026 — Wire setupScrollReveal to blog-panel--posts sidebar and content; update blog-posts.html sidebar to use section-header and date-item components matching changelog; add cursor:pointer to .link-item (Blog/Favorites labels) and .blog-tab

### [29] v2.27 — Goldman Sachs detail: real summary copy
- April 2026 — Replace lorem ipsum in Goldman Sachs summary with real copy

### [30] v2.28 — Hard constraint: changelog.html in same commit as code changes
- April 2026 — Merge changelog update discipline into the portfolio-plan commit rule; changelog.html and portfolio-plan.md must now ship in the same commit as the code change, never as a follow-up

---

*Last Updated: April 2026*
*Version: 2.28*
