# Portfolio Plan - Ravishanker Product Designer

## Project Overview
A sophisticated, animation-rich portfolio website showcasing work as a Product Designer. The portfolio emphasizes pure CSS animations, elegant transitions, and a clean, professional aesthetic with dark/light mode support.

---

## Core Pages (Standalone)

### 1. Index Page (index.html)
**Primary Entry Point - Personal Brand & Identity**

#### Layout Structure
- [ ] Black background (#000000) with orange accent text (#ff5b00)
- [ ] No padding on viewport container
- [ ] 4% top margin, 4% left margin for internal content positioning
- [ ] Overflow hidden for full viewport control

#### Header Section
- [ ] Display "Ravishanker" at 200px, Inter 700 weight, -10px letter-spacing
- [ ] Add "About me" hover effect (white text, 45% opacity, appears on name hover)
- [ ] Position "Product Designer" below name (180px, split across two lines)
- [ ] **Make "Product Designer" text clickable** - navigates to Slide 2 (Companies)
- [ ] Add hover state to "Product Designer" to indicate interactivity
- [ ] Remove drop shadows from "Product Designer" text

#### Location Carousel Animation
- [ ] Implement three locations: Coimbatore, Bengaluru, New York City
- [ ] Set text style: 180px, Inter 700, -10px letter-spacing, 0.9 line-height
- [ ] Position locations absolutely (all at same x,y coordinate for in-place animation)
- [ ] Add 3D perspective (1000px) and preserve-3d transform style
- [ ] Create flip animations on X-axis (rotateX: 90deg → 0deg → -90deg)
- [ ] Set transform origin to left-center (0 50%)
- [ ] Timeline:
  - 1s: Coimbatore flips in
  - 3s: Coimbatore flips out, Bengaluru flips in
  - 5s: Bengaluru flips out, New York City flips in
  - 10s: New York City remains visible

#### Responsive Design
- [ ] Desktop (>768px): 200px name, 180px title/locations
- [ ] Tablet (≤768px): 80px name, 72px title/locations
- [ ] Mobile (≤480px): 48px name, 42px title/locations

#### Accessibility
- [ ] Add skip link for keyboard navigation
- [ ] Include ARIA labels for all interactive elements
- [ ] Ensure keyboard navigation works for all interactive elements
- [ ] Test screen reader compatibility
- [ ] Interactive elements clearly announced ("Product Designer link", "Back button")
- [ ] Focus indicators visible on all clickable elements
- [ ] Proper tab order through interactive elements

---

### 2. Companies Page (companies.html)
**Work Experience - Company Showcase**

#### Layout Structure
- [ ] Black background (#000000) with white text (#ffffff)
- [ ] No padding on viewport container
- [ ] 4% top margin, 4% left margin for internal content positioning
- [ ] Page flip-down animation on load (1.2s, rotateX -90deg → 0deg)

#### Company List
- [ ] Display four companies: Goldman Sachs, R/GA, SVA, Torry Harris
- [ ] Set text style: 180px, Inter 700, -10px letter-spacing, 0.9 line-height
- [ ] Position companies with 1.5rem gap between names
- [ ] Left-align all company names

#### Brand Color Hovers
- [ ] Goldman Sachs: #7297C5 (Ship Cove Blue)
- [ ] R/GA: #ffffff (stays white, minimalist black brand)
- [ ] SVA: #FF3716 (red for dark mode)
- [ ] Torry Harris: #254695 (blue)

#### Back Button
- [ ] Create 120px × 120px white circle at position (0, -75)
- [ ] Clip as quarter circle showing only bottom-right portion
- [ ] Display black arrow (←) centered in visible quarter
- [ ] **Make clickable to navigate back to Slide 1 (Index)**
- [ ] Add hover state to indicate interactivity
- [ ] Ensure proper z-index layering above other content

#### Goldman Sachs Interaction (Optional Enhancement)
- [ ] Implement flip animation (rotateX 0deg → -90deg) on click
- [ ] Sequentially fade out other companies (R/GA, SVA, Torry Harris)
- [ ] Reveal full-screen blue page (#7297C5) with flip-in animation
- [ ] Use pure CSS :target or JavaScript for state management

#### Responsive Design
- [ ] Desktop (>768px): 180px company names
- [ ] Tablet (≤768px): 72px company names
- [ ] Mobile (≤480px): 42px company names

---

### 3. Links Page (links.html)
**External Links & Resources**

#### Layout Structure
- [ ] Black background with white text
- [ ] Page flip-down animation on load
- [ ] Center-aligned content

#### Links List
- [ ] Resume
- [ ] Twitter
- [ ] LinkedIn
- [ ] Dribbble

#### Back Button
- [ ] Consistent with companies page styling
- [ ] Link back to index.html

---

## Carousel Integration (Built into index.html)

### Purpose
Index.html serves as the main entry point with integrated carousel functionality for smooth transitions between index and companies content within a single file.

### Implementation Approach
- [ ] Build carousel structure directly into index.html
- [ ] Include both index and companies page content in the same HTML file
- [ ] Use CSS for slide management and transitions
- [ ] Link index.css for all styling (no separate carousel CSS file needed)

### Carousel Mechanics
- [ ] Implement 4-state radio machine for directional navigation:
  - s1_fwd: Slide 1 active (arrived forward) - **DEFAULT/INITIAL STATE**
  - s2_fwd: Slide 2 active (arrived forward)
  - s1_bwd: Slide 1 active (arrived backward)
  - s2_bwd: Slide 2 active (arrived backward)
- [ ] **Set s1_fwd as checked on page load** - Index page shows first, NOT companies
- [ ] Use pure CSS (no JavaScript for carousel navigation)
- [ ] Hide all radio inputs with display: none
- [ ] **Navigation triggered by specific interactive elements only** (not background clicks)
- [ ] Label elements wrap interactive text/buttons to trigger radio state changes

### Transition Animations

#### Forward Transition (Index → Companies)
- [ ] Duration: 5 seconds total
- [ ] Animation sequence with timing breakdown:
  1. **0-20% (0-1s)**: Slide 1 scales down from 100% to 90%
  2. **20-60% (1-3s)**: Slide 1 slides left from 0 to -110%
  3. **0-20% (0-1s)**: Slide 2 waits at 110% off-screen (no movement)
  4. **20-60% (1-3s)**: Slide 2 slides in from 110% to 0
  5. **60-100% (3-5s)**: Slide 2 scales up from 90% to 100%
- [ ] Easing: cubic-bezier(0.77, 0, 0.175, 1)
- [ ] Keyframe percentages: 0%, 20%, 60%, 100%

#### Backward Transition (Companies → Index)
- [ ] Duration: 5 seconds total (same as forward)
- [ ] **NO keyframe animations** - uses direct CSS transitions
- [ ] Animation sequence:
  1. **Slide 2 (Companies)**: Scales from 100% to 106% AND slides from 0 to -110% (simultaneously)
  2. **Slide 1 (Index)**: Slides in from 8% offset to 0 AND scales from 88% to 100% (simultaneously)
- [ ] Same easing: cubic-bezier(0.77, 0, 0.175, 1)
- [ ] Transform and opacity transitions: 5s transform, 4s opacity with 0.5s delay
- [ ] **Different from forward**: Forward uses staged keyframes, backward is simultaneous

#### Timing Details (Actual Implementation)
```css
/* Base slide transition */
transition:
    transform 5s cubic-bezier(0.77, 0, 0.175, 1),
    opacity 4s ease 0.5s;

/* FORWARD animation - uses keyframes for staged transitions */
@keyframes scaleOutLeft {
    0%   { transform: scale(1) translateX(0); }      /* Start */
    20%  { transform: scale(0.9) translateX(0); }    /* Scale complete */
    60%  { transform: scale(0.9) translateX(-110%); } /* Slide complete */
    100% { transform: scale(0.9) translateX(-110%); } /* Hold */
}

@keyframes slideInThenScale {
    0%   { transform: scale(0.9) translateX(110%); }  /* Start off-screen */
    20%  { transform: scale(0.9) translateX(110%); }  /* Wait */
    60%  { transform: scale(0.9) translateX(0); }     /* Slide in */
    100% { transform: scale(1) translateX(0); }       /* Scale up */
}

/* BACKWARD transition - direct CSS transitions (simultaneous) */
#s1_bwd:checked ~ .slide-2 {
    transform: scale(1.06) translateX(-110%);  /* Scale up AND slide left */
    transition: transform 5s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 3;
}

#s1_bwd:checked ~ .slide-1 {
    transform: scale(1) translateX(0);  /* From scale(0.88) translateX(8%) */
    transition: transform 5s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 2;
}
```

### Content Integration

#### Single-File Structure (Recommended)
- [ ] Include both index and companies content in index.html
- [ ] Wrap each section in slide containers (.slide-1, .slide-2)
- [ ] Namespace all CSS with .slide-1 and .slide-2 prefixes in index.css
- [ ] Ensure proper slide isolation (no style bleeding between slides)
- [ ] Keep companies.html as separate standalone page for direct access

#### Advantages
- ✅ Single file loads all content
- ✅ No iframe overhead
- ✅ Smoother transitions
- ✅ Easier state management
- ✅ Better performance

### Navigation

#### Interaction Points (Title-Based)
- [ ] Click on "Product Designer" text → Navigate to Slide 2 (Companies page)
- [ ] Click on back button in Companies → Navigate to Slide 1 (Index page)
- [ ] **Interactions are on titles/buttons only** - clicking backgrounds does NOT trigger navigation
- [ ] Use label elements wrapping text for clickable areas
- [ ] Ensure proper cursor styles (pointer on interactive elements)

#### Navigation States
- [ ] Forward navigation: Triggered by clicking "Product Designer"
- [ ] Backward navigation: Triggered by clicking back button
- [ ] No background click-through navigation
- [ ] Clear visual affordances (hover states on interactive elements)

#### Implementation Notes
```html
<!-- Radio button state machine -->
<input type="radio" name="slide" id="s1_fwd" class="carousel-radio" checked>
<input type="radio" name="slide" id="s2_fwd" class="carousel-radio">
<input type="radio" name="slide" id="s1_bwd" class="carousel-radio">
<input type="radio" name="slide" id="s2_bwd" class="carousel-radio">

<!-- Navigation triggers -->
<label for="s2_fwd" class="product-designer-link">
    Product Designer
</label>

<label for="s1_bwd" class="back-button">
    <!-- Back button content -->
</label>
```

**CRITICAL: s1_fwd MUST have the `checked` attribute to show Index page on launch**

---

## Design System

### Typography
```
Font Family: Inter
Weights: 300, 400, 500, 600, 700
Primary Size: 180px-200px (headers)
Letter Spacing: -10px (tight)
Line Height: 0.9-1.1 (compact)
```

### Color Palette
```
Background: #000000 (black)
Primary Text: #ff5b00 (orange)
Secondary Text: #ffffff (white, 90% opacity)

Brand Colors:
- Goldman Sachs: #7297C5
- R/GA: #000000 / #ffffff
- SVA: #FF3716
- Torry Harris: #254695
```

### Spacing System
```
Container Padding: 0% (no padding on viewport containers)
Internal Margins: 4% top, 4% left (for content positioning)
Content Gaps: 0.5rem (locations), 1.5rem (companies), 3rem (larger spacing)
Alignment: Left-aligned with consistent 4% left margin
```

### Animation Timing
```
Fast: 0.3s (hovers, simple transitions)
Medium: 0.8s-1s (fades, simple animations)
Slow: 5s (carousel slide transitions)
Location Carousel: 10s total (each location displays for ~3s)

Easing:
- Smooth: cubic-bezier(0.4, 0, 0.2, 1)
- Carousel: cubic-bezier(0.77, 0, 0.175, 1)
- Ease-in-out: for symmetric animations
```

---

## Technical Requirements

### HTML
- [ ] Use semantic HTML5 tags (header, main, nav, section)
- [ ] Include proper meta tags (charset, viewport, description)
- [ ] Add ARIA labels and roles for accessibility
- [ ] Include skip links for keyboard navigation
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] **Separate HTML and CSS into individual files** (no inline styles in HTML)
- [ ] Link external CSS file in `<head>` section

### CSS
- [ ] **Create separate CSS file** (e.g., styles.css, index.css, companies.css)
- [ ] Pure CSS animations (avoid JavaScript where possible)
- [ ] Use CSS Grid/Flexbox for layouts
- [ ] Implement CSS custom properties for theme values (optional enhancement)
- [ ] Use transform and opacity for performant animations
- [ ] Leverage :has(), :checked, :target pseudo-classes for state management
- [ ] Ensure proper z-index layering
- [ ] Add transform-style: preserve-3d for 3D effects
- [ ] Set appropriate perspective values (1000px)
- [ ] **No inline styles** - all styling must be in external CSS files

### JavaScript
- [ ] Minimize usage - only where absolutely necessary
- [ ] Currently used only in companies.html for Goldman Sachs flip interaction
- [ ] Consider pure CSS alternatives using :target pseudo-class
- [ ] If used, ensure graceful degradation

### Performance
- [ ] Use will-change for animated properties
- [ ] Optimize animations with transform and opacity (GPU-accelerated)
- [ ] Minimize repaints and reflows
- [ ] Keep CSS file size reasonable
- [ ] Use system fonts as fallback
- [ ] Implement overflow: hidden to prevent layout shift

### Browser Compatibility
- [ ] Test in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify CSS features work (:has(), clip-path, etc.)
- [ ] Ensure graceful degradation for older browsers
- [ ] Test responsive breakpoints on actual devices

---

## File Structure

```
portfolio/
├── index.html                      # Main file with integrated carousel (index + companies)
├── index.css                       # All styles for index.html (including carousel)
├── companies.html                  # Standalone companies page (optional direct access)
├── companies.css                   # Styles for standalone companies page
├── links.html                      # External links page
├── links.css                       # Styles for links page
└── portfolio-plan.md              # This document

Notes:
- index.html contains both index and companies content as slides
- companies.html remains as standalone page for direct navigation
- All carousel logic and styling is in index.html/index.css
```

---

## File Organization & Best Practices

### Separation of Concerns
- [ ] **HTML files** contain only structure and content
- [ ] **CSS files** contain all styling and animations
- [ ] **JavaScript files** contain behavior (minimal usage)
- [ ] No inline styles (`style=""` attribute) in HTML
- [ ] No `<style>` tags in HTML files

### Linking CSS Files
```html
<!-- In index.html -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ravishanker - Product Designer</title>
    <link rel="stylesheet" href="index.css">
</head>
```

### CSS File Naming Conventions
- **Main file**: `index.css` (includes carousel, slide-1, and slide-2 styles)
- **Standalone pages**: `companies.css`, `links.css`
- **Alternative approach**: `styles.css` (if using shared global styles)

### Advantages of Separate Files
- ✅ Better code organization and maintainability
- ✅ Easier debugging and updates
- ✅ Browser caching of CSS files
- ✅ Cleaner HTML structure
- ✅ Reusable styles across pages
- ✅ Better version control and collaboration

---

## Development Workflow

### Phase 1: Core Pages with Integrated Carousel
1. [ ] Build index.html with carousel structure (radio button state machine)
2. [ ] Add Slide 1: index content (name, title, locations)
3. [ ] Add Slide 2: companies content within same file
4. [ ] Create index.css with all styles (including carousel transitions)
5. [ ] Implement location carousel animations
6. [ ] Add brand color hovers for companies
7. [ ] Build companies.html as standalone page (optional direct access)
8. [ ] Create companies.css for standalone version
9. [ ] Build links.html
10. [ ] Create links.css with all links page styles

### Phase 2: Interactions
1. [ ] Implement back buttons on all pages
2. [ ] Add Goldman Sachs flip interaction (optional)
3. [ ] Test all animations and transitions
4. [ ] Verify accessibility features

### Phase 3: Polish & Refinement
1. [ ] Fine-tune carousel slide transitions
2. [ ] Verify CSS namespacing prevents conflicts between slides
3. [ ] Test navigation flow (forward/backward)
4. [ ] Optimize animation performance
5. [ ] Test all responsive breakpoints

### Phase 4: Final Testing & Deployment
1. [ ] Test across breakpoints
2. [ ] Verify all animations are smooth
3. [ ] Check accessibility compliance
4. [ ] Cross-browser testing
5. [ ] Performance optimization
6. [ ] Final QA pass

---

## Key Decisions & Constraints

### Hard Restrictions
- **No JavaScript preference**: Use JavaScript only when CSS cannot achieve the effect
- **Default HTML tags**: Prefer semantic HTML over divs
- **Responsive required**: Must work on desktop (3840×2160, 1920×1080, 1440×720) and mobile (portrait)
- **Pure CSS animations**: Leverage modern CSS features for all interactions
- **Separate HTML and CSS files**: No inline styles or `<style>` tags in HTML

### Design Principles
- **Consistency**: Same text styling across pages where appropriate
- **Clarity**: Clean, uncluttered layouts with ample whitespace
- **Performance**: GPU-accelerated animations, minimal repaints
- **Accessibility**: Keyboard navigation, screen reader support, ARIA labels

### Technical Debt & Future Enhancements
- [ ] Convert to CSS custom properties for easier theming
- [ ] Add prefers-reduced-motion support for accessibility
- [ ] Consider service worker for offline functionality
- [ ] Implement smooth scroll polyfill for older browsers
- [ ] Add loading states for slower connections
- [ ] Create component library documentation

---

## Testing Checklist

### Functionality
- [ ] **Index page (Slide 1) displays on initial page load** - NOT companies page
- [ ] All page transitions work smoothly
- [ ] Location carousel loops through all three cities
- [ ] "Product Designer" text click navigates to Companies (Slide 2)
- [ ] Back button click navigates to Index (Slide 1)
- [ ] Background clicks do NOT trigger navigation
- [ ] All hover effects trigger properly on interactive elements
- [ ] Carousel navigation works bidirectionally
- [ ] Cursor changes to pointer on interactive elements

### Visual
- [ ] Text is readable at all sizes
- [ ] Colors meet contrast requirements
- [ ] Animations are smooth (60fps)
- [ ] No layout shift or content jump
- [ ] Proper alignment across all pages
- [ ] Quarter circles clip correctly

### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen readers announce content correctly
- [ ] Focus indicators are visible
- [ ] ARIA labels are descriptive
- [ ] Skip links function properly
- [ ] Color blind users can navigate (don't rely on color alone)

### Performance
- [ ] Page loads in under 2 seconds
- [ ] Animations maintain 60fps
- [ ] No janky scrolling
- [ ] Minimal CSS/HTML file size
- [ ] Font loading doesn't block render

### Responsive
- [ ] Layout works on 3840×2160
- [ ] Layout works on 1920×1080
- [ ] Layout works on 1440×720
- [ ] Layout works on mobile portrait
- [ ] Touch targets are appropriately sized (44×44px minimum)
- [ ] Text is readable on all devices

---

## Known Issues & Fixes

### Location Animation Position
**Issue**: Locations stack vertically instead of animating in place  
**Fix**: Use absolute positioning with all locations at (0, 0)
```css
.locations {
    position: relative;
    height: 180px;
}
.location {
    position: absolute;
    top: 0;
    left: 0;
}
```

---

## Resources & References

### Portfolio Reference
- Ravishanker Portfolio: https://ravishanker.weflow.io
- Reference for design style, animations, and interactions

### Fonts
- Inter: https://fonts.google.com/specimen/Inter
- Weights needed: 300, 400, 500, 600, 700

### CSS Techniques
- Radio button state machine for carousel
- :has() pseudo-class for parent selection
- :checked pseudo-class for toggle states
- clip-path for quarter circle shapes
- transform-style: preserve-3d for 3D animations
- perspective for depth effect

### Animation References
- Carousel reference: carousel-reference.html
- Pure CSS state machine with radio buttons
- Directional navigation with forward/backward states

### Color Research
- Goldman Sachs brand: #7297C5
- R/GA brand: #000000
- SVA brand: #FF3716 (dark mode)
- Torry Harris brand: #254695

---

## Version History

### v1.0 - Initial Standalone Pages
- Index page with location carousel
- Companies page with brand colors
- Links page
- Pure CSS animations

### v2.0 - Carousel Integration
- Combined carousel experience
- 5-second slide transitions
- iframe-based content embedding
- Click-to-navigate functionality

### v2.1 - Embedded Content
- Direct HTML/CSS integration
- Resolved CSS namespace conflicts
- Improved spacing and alignment

### v2.2 - Refinements
- 2-second faster transitions option
- Quarter circle repositioning
- Company text size matching
- Reduced spacing between companies

### v2.3 - Simplified Design
- Removed dark/light mode toggle
- Consistent black background throughout
- Streamlined color system

### v2.4 - Code Organization
- Added requirement for separate HTML and CSS files
- Established file naming conventions
- Documented file structure best practices

### v2.5 - Integrated Carousel Architecture
- Carousel integrated directly into index.html (not separate file)
- Removed container padding (2%) in favor of internal margins (4% top, 4% left)
- Single index.css file contains all carousel and slide styles
- Simplified file structure

---

## Maintenance Notes

### Adding New Pages
1. Create standalone HTML file (e.g., links.html)
2. Create corresponding CSS file (e.g., links.css)
3. Match typography and spacing system (4% top/left margins)
4. To add to carousel: create new slide in index.html with new radio states
5. Update navigation links
6. Test all transitions

### Modifying Carousel Slides
1. All carousel changes happen in index.html
2. Style changes go in index.css
3. Use .slide-1, .slide-2 namespace prefixes
4. Test slide isolation (no style bleeding)
5. Verify transitions work both directions

### Modifying Animations
1. Check animation timing (fast/medium/slow categories)
2. Ensure GPU-accelerated properties (transform, opacity)
3. Test across all breakpoints
4. Verify accessibility (reduced motion)

### Color Theme Updates
1. Update CSS custom properties (if implemented)
2. Check contrast ratios (WCAG AA minimum)
3. Verify all hover states

---

## Contact & Credits

**Designer/Developer**: Ravishanker  
**Role**: Product Designer  
**Locations**: Coimbatore → Bengaluru → New York City  

**Companies**:
- Goldman Sachs
- R/GA
- SVA (School of Visual Arts)
- Torry Harris

**Links**:
- Resume
- Twitter
- LinkedIn
- Dribbble

---

## Future Roadmap

### Short Term
- [ ] Add more company detail pages
- [ ] Implement case studies section
- [ ] Add contact form
- [ ] Include resume download

### Medium Term
- [ ] Blog integration
- [ ] Link roll/curated resources
- [ ] Project gallery
- [ ] Testimonials section

### Long Term
- [ ] CMS integration for easy updates
- [ ] Multi-language support
- [ ] Advanced animations and interactions
- [ ] Performance monitoring
- [ ] Analytics integration

---

*Last Updated: March 30, 2026*  
*Version: 2.5*
