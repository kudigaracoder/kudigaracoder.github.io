# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS portfolio site for Ravishanker (Product Designer). Deployed via GitHub Pages at `kudigaracoder.github.io`. No build system, bundler, or package manager — open files directly in a browser.

## Architecture

```
index.html              # Root redirect → portfolio/index.html
portfolio/
  index.html            # Main entry: integrated 2-slide carousel (Index + Companies)
  index.css             # All styles including carousel state machine
  companies.html        # Standalone companies page (direct access fallback)
  companies.css
  links.html            # External links page
  links.css
  portfolio-plan.md     # Design spec and decision log
```

### Carousel State Machine

The carousel in `portfolio/index.html` uses four hidden radio inputs as a pure-CSS state machine — no JavaScript. The four states are:

| Radio ID  | Meaning                       |
|-----------|-------------------------------|
| `s1_fwd`  | Slide 1 visible (default, `checked`) |
| `s2_fwd`  | Slide 2 visible (forward nav)  |
| `s1_bwd`  | Slide 1 visible (backward nav) |
| `s2_bwd`  | Slide 2 visible (backward nav) |

Navigation is triggered exclusively by `<label>` elements (`for` pointing at a radio id) — clicking slide backgrounds does NOT navigate.

Forward transitions use CSS `@keyframes` with staged timing (scale then slide). Backward transitions use direct CSS `transition` (simultaneous movement). Both use `cubic-bezier(0.77, 0, 0.175, 1)` over 5 seconds.

### CSS Namespacing

Slide-1 and Slide-2 content share a single `index.css`. Slide-specific rules use the `.slide-1` / `.slide-2` parent selectors to prevent style bleed between slides.

## Design System

**Typography**: Inter (Google Fonts), 700 weight, `-10px` letter-spacing, `0.9` line-height for large display text.

**Breakpoints**:
- `>768px`: `--name-size: 200px`, `--title-size: 180px`
- `≤768px`: `80px / 72px`
- `≤480px`: `48px / 42px`

**Colors**:
- Background: `#000000`
- Accent (name): `#ff5b00` (orange)
- Text: `#ffffff`
- Goldman Sachs hover: `#7297C5` | R/GA: `#ffffff` | SVA: `#FF3716` | Torry Harris: `#254695`

**Spacing**: No padding on `.viewport`; content uses `margin-top: 4%; margin-left: 4%` internally.

## Hard Constraints

- **No JavaScript** unless CSS cannot achieve the effect. The carousel is pure CSS.
- **No inline styles** — all styling lives in external `.css` files.
- **No `<style>` tags** in HTML files.
- Prefer semantic HTML5 elements (`header`, `main`, `nav`, `section`) over `div`.
- All interactive elements need ARIA labels, keyboard access, and visible focus indicators.
- Animations must respect `prefers-reduced-motion` — the `index.css` already has a `@media (prefers-reduced-motion: reduce)` block; extend it when adding new animations.

## Key CSS Techniques in Use

- Radio button state machine (`:checked` sibling selectors) for carousel navigation
- `perspective` + `transform-style: preserve-3d` + `rotateX` for 3D flip animations
- `clip-path: polygon(...)` for the quarter-circle back button
- `will-change: transform, opacity` on animated elements for GPU acceleration
- `transform` + `opacity` exclusively for animations (no `top`/`left`/`width` changes)
