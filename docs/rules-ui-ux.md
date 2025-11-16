# UI/UX Design Rules
## AI Results Risk Prototype

**Purpose:** Ensure consistent user interface patterns, visual design, and user experience across all features.

---

## 1. Color Palette

### 1.1 Primary Colors
```css
--sc-green: #4F958B;           /* Primary brand color - buttons, accents, borders */
--sc-text: #1a1a1a;            /* Primary text */
--sc-text-muted: #6b7280;      /* Secondary text */
--sc-bg: #e5e7eb;              /* Page background */
```

### 1.2 Risk Level Colors
```css
--risk-low: #16a34a;           /* Green - low risk */
--risk-moderate: #f59e0b;      /* Amber - moderate risk */
--risk-high: #dc2626;          /* Red - high risk */
```

### 1.3 Status Colors
```css
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### 1.4 Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

---

## 2. Typography

### 2.1 Font Family
- **Primary**: System font stack
- **Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### 2.2 Font Sizes
```css
--font-xs: 0.75rem;     /* 12px - small labels */
--font-sm: 0.85rem;     /* 13.6px - body text, secondary */
--font-base: 0.9rem;    /* 14.4px - body text */
--font-md: 0.95rem;     /* 15.2px - section headers */
--font-lg: 1.05rem;     /* 16.8px - patient name */
--font-xl: 1.15rem;     /* 18.4px - page headers */
```

### 2.3 Font Weights
```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### 2.4 Line Heights
```css
--line-tight: 1.25;
--line-normal: 1.5;
--line-relaxed: 1.75;
```

---

## 3. Spacing System

### 3.1 Spacing Scale (based on 0.25rem = 4px)
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
```

### 3.2 Component Padding
- **Cards**: 1rem (16px)
- **Sections**: 0.9-1rem (14.4-16px)
- **Buttons**: 0.6rem vertical, 1rem horizontal
- **Inputs**: 0.6rem all sides

### 3.3 Component Margins
- **Section spacing**: 1rem between sections
- **Card spacing**: 0.75rem between cards
- **Grid gap**: 0.75rem for card grids

---

## 4. Component Patterns

### 4.1 Patient Banner
**Purpose:** Display patient demographics, alerts, and overall risk

**Structure:**
```html
<section class="sc-patient-banner">
  <div class="sc-patient-banner-main">
    <div class="sc-patient-info">
      <h2 class="sc-patient-banner-name">{Name}</h2>
      <div class="sc-patient-demographics">
        DoB • MRN • Sex • NHS No
      </div>
    </div>
    <div class="sc-patient-alerts">
      {Allergy badges} {Alert badges}
    </div>
    <div class="sc-overall-risk-compact">
      Overall risk badge + score
    </div>
  </div>
  <div class="sc-patient-banner-sub">
    Presenting complaint
  </div>
</section>
```

**Styling:**
- 3px solid green border
- Gradient background (white to #fafbfc)
- 4px green accent bar on top
- Green-tinted shadow
- Alerts: max 3 badges, truncate with count

### 4.2 Collapsible Sections
**Purpose:** Organize information hierarchically

**Structure:**
```html
<section class="sc-card">
  <div class="sc-section-header-collapsible" onClick={toggle}>
    <h3 class="sc-section-title">{Title}</h3>
    <div class="sc-collapse-controls">
      {Warning indicator if collapsed}
      <span class="sc-collapse-icon">{▼ or ▶}</span>
    </div>
  </div>
  {expanded && <Content />}
</section>
```

**Behavior:**
- Click header to toggle
- Show ⚠️ indicator when collapsed if abnormal results
- Smooth expand/collapse
- Arrow rotates: ▼ = expanded, ▶ = collapsed

### 4.3 Risk Cards
**Purpose:** Display individual risk assessments

**Structure:**
```html
<div class="sc-risk-card sc-risk-card--{level}">
  <div class="sc-risk-card-header">
    <h4 class="sc-risk-title">{Title} risk: {LEVEL}</h4>
    <div class="sc-risk-score">
      <span class="sc-risk-score-label">Score</span>
      <span class="sc-risk-score-value">{0.00}</span>
    </div>
  </div>
  {guideline && <p class="sc-risk-guideline">{Guideline}</p>}
  <ul class="sc-risk-factors">
    {factors.map(f => <li>{f}</li>)}
  </ul>
</div>
```

**Styling:**
- Border color matches risk level
- Left accent bar (4px) in risk color
- Low: green border, moderate: amber, high: red
- Score displayed prominently

### 4.4 Badge System
**Purpose:** Display status, risk levels, scores

**Types:**
```html
<!-- Risk Level Badge -->
<span class="sc-risk-badge sc-risk-badge--{low|moderate|high}">
  {LEVEL}
</span>

<!-- Alert Badge -->
<div class="sc-alert-badge sc-alert-{allergy|risk}">
  {Icon} {Text}
</div>

<!-- Assessment Score Badge -->
<span class="sc-assessment-score-badge">
  Score: {value}
</span>
```

**Styling:**
- Rounded (12px border-radius for badges)
- Color-coded by type
- Bold, uppercase for risk levels
- Icon + text for alerts

### 4.5 Data Tables
**Purpose:** Display structured data (NEWS2, labs)

**Structure:**
```html
<table class="sc-news2-table">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Value</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody>
    <tr class={abnormal && "sc-news2-row-abnormal"}>
      <td class="sc-news2-param">{Parameter}</td>
      <td class="sc-news2-value">{Value}</td>
      <td class="sc-news2-score">
        <span class="sc-news2-score-badge sc-news2-score-{0-3}">
          {score}
        </span>
      </td>
    </tr>
  </tbody>
</table>
```

**Styling:**
- 2px green border
- Zebra striping for rows
- Score badges color-coded (0=green, 1=yellow, 2=orange, 3=red)
- Abnormal rows highlighted

### 4.6 Imaging Cards
**Purpose:** Display imaging reports

**Structure:**
```html
<div class="sc-imaging-card">
  <div class="sc-imaging-header">
    <span class="sc-imaging-type">{Type}</span>
    <span class="sc-imaging-date">{Date}</span>
  </div>
  <div class="sc-imaging-findings">{Findings}</div>
  <div class="sc-imaging-footer">
    <span class="sc-imaging-reporter">Reporter: {Name}</span>
  </div>
</div>
```

**Styling:**
- 3px left border in green
- Findings in readable paragraph format
- Reporter in italic, muted color
- Hover effect: subtle shadow increase

### 4.7 Assessment Cards
**Purpose:** Display clinical assessments

**Structure:**
```html
<div class="sc-assessment-card">
  <div class="sc-assessment-header">
    <span class="sc-assessment-type">{Type}</span>
    <span class="sc-assessment-score-badge">Score: {value}</span>
  </div>
  <div class="sc-assessment-meta">
    <span class="sc-assessment-date">{Date}</span>
    <span class="sc-assessment-assessor">by {Name}</span>
  </div>
  {notes && <div class="sc-assessment-notes">{Notes}</div>}
</div>
```

**Styling:**
- Grid layout (300px min, responsive)
- Notes in highlighted box with left accent
- Score badge in green
- Hover effect for interactivity

---

## 5. Layout Rules

### 5.1 Page Structure
```
┌─────────────────────────────────────────┐
│ Header (gradient green, rounded bottom) │
├─────────────┬───────────────────────────┤
│  Sidebar    │  Main Content Area        │
│  (patients) │  (patient details)        │
│             │                           │
│             │                           │
└─────────────┴───────────────────────────┘
```

### 5.2 Sidebar
- **Width**: 260px fixed
- **Background**: #fafbfc
- **Border**: 3px solid green on right
- **Content**: Patient list, scrollable

### 5.3 Main Content
- **Padding**: 1.5rem
- **Max-width**: None (fluid)
- **Background**: #e5e7eb
- **Overflow**: Auto scroll

### 5.4 Section Ordering
1. Patient Banner (always first)
2. Condition-specific risk
3. NICE/NHSE Diagnosis Scoring (conditional)
4. Imaging & Investigations (conditional)
5. Clinical Assessments (conditional)
6. Laboratory Results
7. Vitals & NEWS2

---

## 6. Interaction Patterns

### 6.1 Hover States
- **Cards**: Increase shadow on hover
- **Buttons**: Darken by 10%
- **Collapsible headers**: Show background color on hover
- **Patient list items**: Show background on hover

### 6.2 Active States
- **Selected patient**: Green gradient, 2px green border, shadow
- **Active button**: Pressed appearance, darker background
- **Expanded section**: Arrow points down (▼)

### 6.3 Loading States
- **Spinner**: Green rotating circle
- **Skeleton**: Subtle animation, gray background
- **Message**: "Loading patient details..."

### 6.4 Error States
- **Color**: Red background
- **Icon**: ⚠️ or error icon
- **Message**: Clear, actionable text
- **Retry**: Button to retry action

### 6.5 Empty States
- **Message**: "No data available"
- **Styling**: Gray text, centered
- **Icon**: Optional placeholder icon

---

## 7. Responsive Behavior

### 7.1 Breakpoints
```css
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
```

### 7.2 Layout Changes
- **<1024px**: Stack sidebar above content
- **<768px**: Single column layout, full-width cards
- **<640px**: Reduce padding, smaller fonts

### 7.3 Component Adaptation
- **Risk grid**: 3 cols → 2 cols → 1 col
- **Assessment grid**: Responsive columns (min 300px)
- **Tables**: Horizontal scroll if needed
- **Patient banner**: Stack elements vertically on mobile

---

## 8. Accessibility

### 8.1 Color Contrast
- **Normal text**: 4.5:1 minimum (WCAG AA)
- **Large text**: 3:1 minimum
- **Interactive elements**: 3:1 minimum

### 8.2 Focus Indicators
- **Outline**: 2px solid blue
- **Offset**: 2px
- **Visible on**: All focusable elements

### 8.3 ARIA Labels
- **Collapsible sections**: aria-expanded
- **Buttons**: aria-label for icon-only
- **Status**: aria-live for dynamic updates

### 8.4 Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons, toggle sections
- **Escape**: Close modals (if any)

---

## 9. Animation & Transitions

### 9.1 Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 9.2 Duration
```css
--duration-fast: 150ms;    /* Hover, focus */
--duration-base: 200ms;    /* Collapsible sections */
--duration-slow: 300ms;    /* Page transitions */
```

### 9.3 Animation Rules
- **Hover effects**: 150ms ease
- **Expand/collapse**: 200ms ease-in-out
- **Loading spinners**: 1s linear infinite
- **Warning pulse**: 2s ease-in-out infinite

---

## 10. Icon Usage

### 10.1 Icons
- **Collapse indicator**: ▼ (expanded), ▶ (collapsed)
- **Warning**: ⚠️
- **Allergy**: ⚠️
- **Abnormal result**: ▲ (high), ▼ (low)

### 10.2 Icon Sizing
- **Small**: 0.85rem
- **Medium**: 1rem
- **Large**: 1.25rem

### 10.3 Icon Colors
- **Inherit**: Match parent text color
- **Warning**: Amber
- **Error**: Red
- **Success**: Green

---

## 11. Borders & Shadows

### 11.1 Border Widths
```css
--border-thin: 1px;
--border-normal: 2px;
--border-thick: 3px;
--border-accent: 4px;  /* Left accent on cards */
```

### 11.2 Border Radius
```css
--radius-sm: 4px;     /* Inputs, small elements */
--radius-md: 6px;     /* Cards, sections */
--radius-lg: 12px;    /* Badges, pills */
--radius-xl: 20px;    /* Header bottom */
```

### 11.3 Shadows
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(79, 149, 139, 0.15);
--shadow-lg: 0 4px 12px rgba(79, 149, 139, 0.25);
```

---

## 12. Content Guidelines

### 12.1 Text Content
- **Concise**: Use clear, medical terminology
- **Scannable**: Break into short paragraphs/lists
- **Consistent**: Use same terms throughout
- **Actionable**: Provide clear next steps

### 12.2 Date/Time Format
- **Display**: DD MMM YYYY HH:MM (e.g., "15 Nov 2024 08:30")
- **Locale**: British format (en-GB)
- **Time**: 24-hour format

### 12.3 Number Format
- **Decimals**: 2 decimal places for scores
- **Large numbers**: Use commas for thousands
- **Units**: Always include units (mg/L, mmol/L, etc.)

### 12.4 Capitalization
- **Headings**: Sentence case
- **Risk levels**: UPPERCASE
- **Buttons**: Sentence case
- **Labels**: Sentence case

---

## 13. Error Handling

### 13.1 Error Messages
- **Clear**: Explain what went wrong
- **Helpful**: Suggest how to fix
- **Non-technical**: Avoid jargon
- **Contextual**: Show where error occurred

### 13.2 Error Display
```html
<div class="sc-error-message">
  <span class="sc-error-icon">⚠️</span>
  <div class="sc-error-content">
    <div class="sc-error-title">Error loading patient data</div>
    <div class="sc-error-description">
      Unable to connect to server. Please check your connection and try again.
    </div>
  </div>
  <button class="sc-error-retry">Retry</button>
</div>
```

---

## 14. Performance Guidelines

### 14.1 Image Optimization
- **Logos**: SVG where possible
- **Photos**: WebP with JPEG fallback
- **Icons**: Inline SVG or icon font

### 14.2 Animation Performance
- **Use**: transform, opacity (GPU-accelerated)
- **Avoid**: width, height, top, left
- **Will-change**: Sparingly, for animations only

### 14.3 Render Optimization
- **Lazy load**: Images below fold
- **Debounce**: Search input
- **Virtualize**: Long lists (if >100 items)

---

**This document defines the UI/UX standards for the AI Results Risk Prototype. All new features and modifications must adhere to these patterns to ensure consistency and maintain the professional clinical appearance.**

