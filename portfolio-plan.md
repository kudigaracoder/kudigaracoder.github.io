# Portfolio Plan - Ravishanker Product Designer

## Project Overview
A sophisticated, animation-rich portfolio website showcasing work as a Product Designer. The portfolio emphasizes pure CSS animations, elegant transitions, and a clean, professional aesthetic with dark/light mode support. This is a pure HTML/CSS portfolio and there should be no JavaScript code or usage across any of the screens or interactions.

---

## Core Pages (Standalone)

### 1. Index Page (index.html)
**Primary Entry Point - Personal Brand & Identity**

#### Layout Structure
- [ ] Black background (#000000) with orange accent text (#ff5b00)
- [ ] 2% left/right margins, 2% top/bottom padding
- [ ] Overflow hidden for full viewport control

#### Header Section
- [ ] Display "Ravishanker" at 200px, Inter 700 weight, -10px letter-spacing
- [ ] Add "About me" hover effect (white text, 45% opacity, appears on name hover)
- [ ] Position "Product Designer" below name (180px, split across two lines)
- [ ] Link "Product Designer" to companies.html
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

---

### 2. Companies Page (companies.html)
**Work Experience - Company Showcase**

#### Layout Structure
- [ ] Black background (#000000) with white text (#ffffff)
- [ ] Left-aligned content with 4% left margin
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
- [ ] Make clickable label that triggers carousel navigation back to index

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

## Carousel Version (carousel-embedded.html)

### Purpose
Combined single-file experience with smooth transitions between index and companies pages.

### Carousel Mechanics
- [ ] Implement 4-state radio machine for directional navigation:
  - s1_fwd: Slide 1 active (arrived forward)
  - s2_fwd: Slide 2 active (arrived forward)
  - s1_bwd: Slide 1 active (arrived backward)
  - s2_bwd: Slide 2 active (arrived backward)
- [ ] Use pure CSS (no JavaScript for carousel navigation)
- [ ] Hide all radio inputs with display: none

### Transition Animations

#### Forward Transition (Index → Companies)
- [ ] Duration: 5 seconds (or 2 seconds for faster variant)
- [ ] Animation sequence:
  1. Slide 1 scales down to 90% (0-20% of animation)
  2. Slide 1 slides left to -110% (20-60% of animation)
  3. Slide 2 slides in from right 110% → 0 (0-60% of animation)
  4. Slide 2 scales up 90% → 100% (60-100% of animation)
- [ ] Easing: cubic-bezier(0.77, 0, 0.175, 1)

#### Backward Transition (Companies → Index)
- [ ] Same duration and easing as forward
- [ ] Slide 2 scales up to 106% then slides left
- [ ] Slide 1 slides in from right

### Content Integration Options

#### Option A: iframe Method (Simpler)
- [ ] Embed index.html and companies.html via iframes
- [ ] Pros: Clean separation, no CSS conflicts
- [ ] Cons: iframe overhead, potential interaction issues

#### Option B: Direct Embedding (Recommended)
- [ ] Copy all HTML content directly into carousel structure
- [ ] Namespace all CSS with .slide-1 and .slide-2 prefixes
- [ ] Ensure mode overlay only affects slide-1
- [ ] Fix white screen issue by hiding overlay when slide-2 active

### Navigation
- [ ] Click anywhere on Slide 1 → advance to Slide 2
- [ ] Click back button on Slide 2 → return to Slide 1
- [ ] Click anywhere else on Slide 2 → return to Slide 1

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
Margins: 2% standard, 4% for emphasized areas
Padding: 2% vertical, 0-2% horizontal
Gaps: 0.5rem (locations), 1.5rem (companies), 3rem (larger spacing)
```

### Animation Timing
```
Fast: 0.3s (hovers, simple transitions)
Medium: 0.8s-1s (fades, simple animations)
Slow: 2s-5s (carousel transitions, location carousel)

Easing:
- Smooth: cubic-bezier(0.4, 0, 0.2, 1)
- Custom: cubic-bezier(0.77, 0, 0.175, 1)
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

### CSS
- [ ] Pure CSS animations (avoid JavaScript where possible)
- [ ] Use CSS Grid/Flexbox for layouts
- [ ] Implement CSS custom properties for theme values (optional enhancement)
- [ ] Use transform and opacity for performant animations
- [ ] Leverage :has(), :checked, :target pseudo-classes for state management
- [ ] Ensure proper z-index layering
- [ ] Add transform-style: preserve-3d for 3D effects
- [ ] Set appropriate perspective values (1000px)

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
├── index.html                      # Main landing page
├── companies.html                  # Work experience page
├── links.html                      # External links page
├── carousel-embedded.html          # Combined carousel experience
├── carousel-embedded-original.html # Clean iframe version
├── carousel-reference.html         # Pure CSS carousel demo
└── portfolio-plan.md              # This document
```

---

## Development Workflow

### Phase 1: Core Pages
1. [ ] Build index.html with basic layout
2. [ ] Add location carousel animations
3. [ ] Create companies.html with company list
4. [ ] Add brand color hovers
5. [ ] Build links.html

### Phase 2: Interactions
1. [ ] Implement back buttons on all pages
2. [ ] Add Goldman Sachs flip interaction (optional)
3. [ ] Test all animations and transitions
4. [ ] Verify accessibility features

### Phase 3: Carousel Integration
1. [ ] Create carousel structure with radio buttons
2. [ ] Implement slide transitions
3. [ ] Integrate index and companies content
4. [ ] Namespace all CSS to prevent conflicts
5. [ ] Test navigation flow

### Phase 4: Polish & Testing
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
- [ ] All page transitions work smoothly
- [ ] Location carousel loops through all three cities
- [ ] Back buttons navigate correctly
- [ ] All hover effects trigger properly
- [ ] Carousel navigation works bidirectionally

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

---

## Maintenance Notes

### Adding New Pages
1. Create standalone HTML file
2. Match typography and spacing system
3. Add to carousel if needed (new radio states)
4. Update navigation links
5. Test all transitions

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

*Last Updated: March 25, 2026*  
*Version: 2.3*
