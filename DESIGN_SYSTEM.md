# Premium Mafia Gaming Platform - Design System
## $10,000+ Luxury Noir Aesthetic

---

## 1. COLOR PALETTE (Luxury Noir)

### Primary Colors
- **Signature Gold**: `#D4AF37` (elegant accent, leadership)
- **Premium Light Gold**: `#F0D966` (hover states, emphasis)
- **Subtle Gold**: `#B8860B` (secondary accents, hints)

### Background & Surfaces
- **Deep Black**: `#000000` (primary background)
- **Rich Dark**: `#0A0A0A` (secondary depth)
- **Charcoal**: `#1A1A1A` (surface layer 1)
- **Refined Dark**: `#2A2A2A` (surface layer 2 - cards, inputs)
- **Elevated Dark**: `#3A3A3A` (surface layer 3 - interactive states)
- **Subtle Gray**: `#4A4A4A` (borders, dividers)

### Status Colors (Luxury Versions)
- **Success**: `#4FBF85` (premium green)
- **Error**: `#E84C3D` (deep red)
- **Warning**: `#D4A574` (warm amber)
- **Info**: `#5B9BD5` (sophisticated blue)

### Text Colors
- **Primary Text**: `#E8E8E8` (main content)
- **Secondary Text**: `#A0A0A0` (hints, labels)
- **Tertiary Text**: `#808080` (disabled, captions)
- **Gold Text**: `#D4AF37` (emphasis, headings)

---

## 2. TYPOGRAPHY (Premium Serif System)

### Font Stack
- **Display Font**: Playfair Display (serif, luxury headings)
- **Body Font**: Crimson Text (serif, elegant body)
- **Monospace**: IBM Plex Mono (luxury code/data)

### Type Scale
```
Display Large:    3.5rem / 56px  (Font-weight: 900, Letter-spacing: 0.15em)
Display Medium:   3rem / 48px    (Font-weight: 700, Letter-spacing: 0.1em)
Display Small:    2.5rem / 40px  (Font-weight: 700, Letter-spacing: 0.08em)
Headline Large:   2rem / 32px    (Font-weight: 700, Letter-spacing: 0.05em)
Headline Medium:  1.5rem / 24px  (Font-weight: 700, Letter-spacing: 0.03em)
Title Large:      1.25rem / 20px (Font-weight: 600, Letter-spacing: 0.02em)
Title Medium:     1rem / 16px    (Font-weight: 600, Letter-spacing: 0em)
Body Large:       1.125rem / 18px (Font-weight: 400, Line-height: 1.6)
Body Medium:      1rem / 16px    (Font-weight: 400, Line-height: 1.6)
Body Small:       0.875rem / 14px (Font-weight: 400, Line-height: 1.5)
Label Large:      0.875rem / 14px (Font-weight: 600, Letter-spacing: 0.05em)
Label Medium:     0.75rem / 12px (Font-weight: 600, Letter-spacing: 0.08em)
```

### Line Height & Spacing
- **Headings**: 1.2 (tight, prestigious)
- **Body Text**: 1.6 (readable, premium)
- **Labels**: 1.4 (balanced)

---

## 3. SPACING SYSTEM (8pt Grid)

### Scale
```
xs:  4px / 0.25rem
sm:  8px / 0.5rem
md:  16px / 1rem
lg:  24px / 1.5rem
xl:  32px / 2rem
2xl: 48px / 3rem
3xl: 64px / 4rem
```

### Component Spacing
- **Card Padding**: 32px (lg)
- **Section Gap**: 48px (2xl)
- **Inline Gap**: 16px (md)
- **Button Padding**: 12px 24px (sm lg)
- **Input Height**: 48px (touch-friendly)

---

## 4. ELEVATION & SHADOWS (Premium Depth)

### Shadow Scale
```
Level 0: None (flat, background)
Level 1: 0 2px 4px rgba(0,0,0,0.8) (subtle, close)
Level 2: 0 4px 8px rgba(0,0,0,0.85) (standard, elevated)
Level 3: 0 8px 16px rgba(0,0,0,0.9) (prominent, cards)
Level 4: 0 12px 24px rgba(0,0,0,0.95) (emphasis, modals)
Level 5: 0 16px 32px rgba(0,0,0,1) (dramatic, premium floats)
```

### Special Effects
- **Gold Glow**: 0 0 20px rgba(212,175,55,0.3) (hover, focus)
- **Border Glow**: 0 0 12px rgba(212,175,55,0.2) (accent emphasis)
- **Soft Focus**: backdrop-filter: blur(8px) (premium surfaces)

---

## 5. BORDERS & DIVIDERS

### Border Scale
- **Thin**: 1px (subtle dividers)
- **Standard**: 2px (interactive focus, accent)
- **Bold**: 3px (primary emphasis)

### Border Radius
```
xs: 4px (small inputs, tags)
sm: 8px (cards, buttons)
md: 12px (modals, sheets)
lg: 16px (large components)
full: 9999px (pills, avatars)
```

### Divider Style
- Color: `#4A4A4A` (subtle gray, not gold)
- Opacity: 0.5 (premium subtlety)
- Use sparingly (luxury = whitespace)

---

## 6. MICRO-INTERACTIONS (Premium Motion)

### Timing & Easing
- **Quick**: 150ms (simple state changes: hover, focus)
- **Standard**: 250ms (moderate transitions: modal open, expand)
- **Smooth**: 350ms (complex: full-page transitions)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) (material ease-out, refined)

### Animations
- **Entrance**: scale(0.95) → scale(1) + opacity 0→1 over 250ms
- **Exit**: scale(1.05) → scale(1) + opacity 1→0 over 150ms
- **Hover**: opacity 1 → 0.8 + shadow increase over 150ms
- **Focus**: gold glow effect over 200ms
- **Loading**: subtle rotation + breathing effect (no jarring spinners)

### Gesture Feedback
- **Press**: Scale 0.98, increased shadow
- **Release**: Scale 1, shadow restores (150ms spring)
- **Long-press**: Haptic feedback + color shift to gold

---

## 7. COMPONENT SPECIFICATIONS

### Buttons (Premium)
- **Primary**: Gold background (`#D4AF37`), black text
- **Secondary**: Gold border (`#D4AF37`), gold text
- **Tertiary**: Gold text on transparent, hover → gold glow
- **Disabled**: Gray (`#4A4A4A`), reduced opacity (0.5)
- **Min Height**: 48px (touch-friendly)
- **Min Width**: 100px (premium spaciousness)
- **Hover Effect**: Slight scale (1.02) + shadow increase + glow

### Cards
- **Background**: `#2A2A2A` gradient to `#1A1A1A`
- **Border**: 2px gold, 50% opacity
- **Padding**: 32px (lg)
- **Shadow**: Level 3 (0 8px 16px)
- **Radius**: 12px (sm)
- **Hover**: Shadow increase to Level 4 + subtle scale (1.01)

### Input Fields
- **Background**: `#3A3A3a`
- **Border**: 2px `#D4AF37`, 70% opacity
- **Focus Border**: 2px `#F0D966`, 100% opacity + gold glow
- **Text**: `#E8E8E8`
- **Placeholder**: `#808080`
- **Height**: 48px (md)
- **Padding**: 12px 16px (sm md)
- **Radius**: 8px (sm)

### Modals & Overlays
- **Scrim**: 50% black (strong premium isolation)
- **Modal Shadow**: Level 5 (dramatic elevation)
- **Animation**: Scale + fade entrance (250ms)
- **Close**: Top-right X, gold color, 40×40px touch target

### Navigation
- **Tab Height**: 56px (md)
- **Tab Padding**: 16px (md)
- **Active Indicator**: Gold bottom border (3px bold)
- **Inactive**: Secondary text color (`#A0A0A0`)
- **Hover**: Text becomes primary (`#E8E8E8`)

---

## 8. ACCESSIBILITY (Premium A11y)

### Contrast Ratios
- Primary text vs background: 7.5:1 (AAA, premium clarity)
- Secondary text vs background: 5.2:1 (AA, comfortable)
- Gold accent vs dark surface: 6:1 (AA, visible)
- Interactive elements: 4.5:1 minimum (AA)

### Touch Targets
- Minimum: 44×44px (iOS HIG)
- Recommended: 48×48px (Android Material)
- Spacing: 8px+ minimum gap between targets

### Keyboard Navigation
- Tab order: logical, left-to-right
- Focus states: 2px gold ring, 3px offset
- Skip links: Hidden but accessible
- Modal trap: Focus contained within modal

### Screen Reader Support
- Semantic HTML: `<button>`, `<input>`, `<nav>`
- ARIA labels: All icon-only buttons
- Live regions: Status updates, notifications
- Heading hierarchy: h1 → h6 sequential, no skips

### Reduced Motion
- `prefers-reduced-motion`: Disable entrance/exit animations
- Keep functionality intact (no animation = instant)
- Hover feedback still works (opacity change instead of scale)

---

## 9. RESPONSIVE DESIGN (Mobile-First)

### Breakpoints
```
Mobile:   320px - 767px
Tablet:   768px - 1023px
Desktop:  1024px+
TV/Ultra: 1440px+
```

### Mobile-First Strategy
1. **320px**: Stack vertically, full-width cards
2. **428px**: Slightly increased padding (16px → 20px)
3. **768px**: 2-column layouts, sidebar navigation
4. **1024px**: 3-column layouts, full premium spacing
5. **1440px**: Max-width containers (1280px), generous margins

### Safe Areas
- Top: Respect status bar + notch (16px+ padding)
- Bottom: Respect home indicator (16px+ padding)
- Sides: Minimum 16px padding on mobile, 32px on desktop

### Text Sizing
- Mobile body: 16px minimum (no iOS auto-zoom)
- Desktop body: 18px (more spacious)
- Never disable zoom (accessibility requirement)

---

## 10. DARK MODE CONSIDERATIONS

### Theme Application
- **Always Dark**: This is a luxury dark-mode-only platform
- **Surfaces**: Subtle elevation via darkness gradient (not lightness)
- **Accents**: Gold remains signature (platform-wide)
- **Text**: High contrast (primary light on dark)

### Contrast Verification
- Test ALL text colors against actual backgrounds
- Use real mock-ups, not theoretical color pairs
- AAA contrast (7:1+) for body text, AA (4.5:1) minimum for labels
- Never trust light-mode contrast values for dark mode

### Borders & Dividers
- Subtle gray (`#4A4A4A`) for functional dividers
- Gold (`#D4AF37`) for accent/interactive states only
- Avoid too many dividers (luxury = whitespace)

---

## 11. DESIGN TOKENS (CSS Variables)

```css
/* Colors */
--color-primary: #D4AF37;
--color-primary-hover: #F0D966;
--color-primary-subtle: #B8860B;
--color-bg-primary: #000000;
--color-bg-secondary: #0A0A0A;
--color-surface-1: #1A1A1A;
--color-surface-2: #2A2A2A;
--color-surface-3: #3A3A3A;
--color-border: #4A4A4A;
--color-text-primary: #E8E8E8;
--color-text-secondary: #A0A0A0;
--color-text-tertiary: #808080;

/* Typography */
--font-display: 'Playfair Display', serif;
--font-body: 'Crimson Text', serif;
--font-mono: 'IBM Plex Mono', monospace;
--text-xs: 12px;
--text-sm: 14px;
--text-md: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Shadows */
--shadow-1: 0 2px 4px rgba(0,0,0,0.8);
--shadow-2: 0 4px 8px rgba(0,0,0,0.85);
--shadow-3: 0 8px 16px rgba(0,0,0,0.9);
--shadow-4: 0 12px 24px rgba(0,0,0,0.95);
--shadow-5: 0 16px 32px rgba(0,0,0,1);
--glow-gold: 0 0 20px rgba(212,175,55,0.3);

/* Sizing */
--touch-target: 48px;
--input-height: 48px;
--button-height: 48px;

/* Transitions */
--duration-quick: 150ms;
--duration-standard: 250ms;
--duration-smooth: 350ms;
--easing-premium: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 12. PREMIUM QUALITY CHECKLIST

- [ ] No emojis (SVG icons only)
- [ ] Consistent icon family (Heroicons, Lucide)
- [ ] Official brand assets (logo, imagery)
- [ ] Gold accent used strategically, not everywhere
- [ ] Generous whitespace (luxury = emptiness)
- [ ] Micro-interactions feel refined (150-350ms)
- [ ] Touch targets minimum 44×44px, ideally 48×48px
- [ ] ALL text contrast 4.5:1+ (AA minimum, AAA preferred)
- [ ] Reduced motion respected (animations optional)
- [ ] Mobile, tablet, desktop tested
- [ ] Dark mode verified independently
- [ ] No layout shift on load (CLS < 0.1)
- [ ] Fonts preloaded (no invisible text)
- [ ] Images optimized (WebP/AVIF)
- [ ] Scroll performance smooth (60fps)
- [ ] Button feedback within 100ms
- [ ] Error messages clear + actionable
- [ ] Keyboard navigation complete
- [ ] Screen reader labels descriptive

---

## 13. ANTI-PATTERNS (What NOT To Do)

❌ **Don't** use emojis for navigation or system controls  
❌ **Don't** mix multiple icon families  
❌ **Don't** randomly recolor official logos  
❌ **Don't** use gold everywhere (dilutes impact)  
❌ **Don't** cramped spacing (luxury needs breathing room)  
❌ **Don't** animations >500ms or <100ms  
❌ **Don't** hover-only interactions (breaks mobile)  
❌ **Don't** gray-on-gray text (accessibility failure)  
❌ **Don't** change navigation placement by page  
❌ **Don't** horizontal scroll on mobile  
❌ **Don't** disable zoom or change viewport meta  
❌ **Don't** mix light + dark mode (test both independently)  
❌ **Don't** layout shifts / cumulative layout shift  
❌ **Don't** slow image loading (use WebP, lazy load)  
❌ **Don't** button feedback >100ms (feels laggy)  
❌ **Don't** unlabeled form inputs  
❌ **Don't** icon-only buttons without aria-labels  

---

## 14. IMPLEMENTATION PRIORITY

1. **Phase 1** (Critical): Colors, Typography, Spacing (foundation)
2. **Phase 2** (High): Buttons, Cards, Inputs, Navigation
3. **Phase 3** (Medium): Micro-interactions, Hover effects, Focus states
4. **Phase 4** (Polish): Shadows, Glows, Transitions, Animation stagger
5. **Phase 5** (Optimization): Image optimization, Font loading, Performance

---

## 15. SUCCESS METRICS (Premium Quality)

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Contrast Ratio**: 5+:1 minimum (AAA preferred)
- **Time to Interactive**: <2.5s on 4G
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Accessibility**: WCAG 2.1 AA minimum, AAA preferred
- **Mobile Performance**: 60fps scrolling, <100ms tap feedback
- **Dark Mode**: Independent contrast verification (not inferred)
- **SEO**: Meta tags, structured data, semantic HTML

---

**Designer's Note:**  
This premium noir aesthetic emphasizes *restraint* and *intentionality*. Every gold accent, every animation, every shadow serves a purpose. The goal is to create an interface that feels expensive through refined simplicity, not through decoration or excess.

Gold is signature. Whitespace is premium. Motion is meaningful. Contrast is crystal clear.
