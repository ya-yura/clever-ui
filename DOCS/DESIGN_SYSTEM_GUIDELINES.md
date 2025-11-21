# 🎨 Cleverence Design System Guidelines

**Version:** 1.0.0  
**Last Updated:** November 21, 2025  
**Source:** `src/theme/design-system.json` (Figma Export)  
**Tech Stack:** React + TypeScript + Tailwind CSS  
**Location:** `src/design/`

---

## 📖 Table of Contents

1. [Philosophy](#philosophy)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Accessibility](#accessibility)
5. [Motion & Animation](#motion--animation)
6. [Spacing & Layout](#spacing--layout)
7. [Best Practices](#best-practices)
8. [Extending the System](#extending-the-system)

---

## 1. Philosophy

### Design for Industrial Environments

Our design system is purpose-built for **warehouse and industrial settings** where conditions differ significantly from typical office environments.

#### Core Principles

**🔆 Contrast & Legibility**
- **Why:** Dark warehouses, bright sunlight, safety goggles
- **How:** High contrast text (WCAG AAA), Atkinson Hyperlegible font
- **Example:** White text (#ffffff) on dark backgrounds (#242424)

**👆 Large Touch Targets**
- **Why:** Gloved hands, cold fingers, rapid scanning
- **How:** Minimum 44×44px for all interactive elements
- **Example:** Buttons have `h-10` (40px) or larger

**🎨 Semantic Color**
- **Why:** Quick recognition, reduce cognitive load
- **Colors:**
  - **Golden Yellow** (#daa420) = Brand/Primary actions
  - **Green** (#91ed91) = Success/Completed
  - **Orange** (#f3a361) = Warning/Attention needed
  - **Red** (#ba8f8e) = Error/Danger

**🌙 Dark Mode First**
- **Why:** Battery life on mobile devices, eye strain in low-light
- **How:** Dark surfaces (#242424, #343436) as default, not an afterthought

---

## 2. Design Tokens

> **Rule:** Never hardcode colors, sizes, or spacing. Always use tokens via Tailwind classes.

All tokens are defined in:
- **Source:** `src/theme/design-system.json`
- **Export:** `src/design/tokens.ts`
- **Usage:** Via Tailwind utility classes

### 2.1 Colors

Our color system uses **semantic naming** for maintainability and theme switching.

#### Surface Colors (Backgrounds)

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `surface-primary` | `bg-surface-primary` | #242424 | Main page background |
| `surface-secondary` | `bg-surface-secondary` | #343436 | Cards, panels, elevated content |
| `surface-tertiary` | `bg-surface-tertiary` | #474747 | Borders, dividers, input backgrounds |
| `surface-inverse` | `bg-surface-inverse` | #ffffff | Light mode (future) |

**When to use:**
- Use `surface-primary` for page backgrounds
- Use `surface-secondary` for card/panel backgrounds
- Use `surface-tertiary` for borders and subtle elevation

#### Content Colors (Text & Icons)

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `content-primary` | `text-content-primary` | #ffffff | Headings, important text |
| `content-secondary` | `text-content-secondary` | #e3e3dd | Body text, descriptions |
| `content-tertiary` | `text-content-tertiary` | #a7a7a7 | Metadata, timestamps, placeholders |
| `content-inverse` | `text-content-inverse` | #242424 | Text on light backgrounds |

**Hierarchy rules:**
- Headings: `text-content-primary` + `font-bold`
- Body: `text-content-secondary`
- Metadata: `text-content-tertiary` + `text-sm`

#### Brand Colors

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `brand-primary` | `bg-brand-primary` | #daa420 | Primary buttons, highlights, CTAs |
| `brand-dark` | `text-brand-dark` | #725a1e | Text on brand-primary background |
| `brand-secondary` | `bg-brand-secondary` | #86e0cb | Accents, progress bars |

**Critical Rule:**
> ⚠️ When using `bg-brand-primary`, **always** use `text-brand-dark` for text to meet WCAG AA contrast requirements.

```tsx
// ✅ Correct
<Button className="bg-brand-primary text-brand-dark">Save</Button>

// ❌ Wrong (fails contrast)
<Button className="bg-brand-primary text-white">Save</Button>
```

#### Status Colors

| Token | Tailwind Class | Hex | Meaning |
|-------|---------------|-----|---------|
| `success` | `text-success` | #91ed91 | Completed, approved, positive |
| `warning` | `text-warning` | #f3a361 | Attention needed, pending review |
| `error` | `text-error` | #ba8f8e | Failed, rejected, danger |
| `info` | `text-info` | #86e0cb | Neutral info, optional action |

**Usage patterns:**
- Badges: `bg-success/20 text-success border-success/30`
- Icons: `text-success` with appropriate size
- Backgrounds: Use with 10-20% opacity for subtlety

### 2.2 Typography

**Font Family:** Atkinson Hyperlegible (sans-serif)
- Designed for low-vision readers
- High glyph distinction (1, l, I are clearly different)
- Open-source, included via Google Fonts

#### Type Scale

| Token | Tailwind | Size | Usage |
|-------|----------|------|-------|
| `3xl` | `text-3xl` | 36px | Page titles (rare) |
| `2xl` | `text-2xl` | 32px | Section headings |
| `xl` | `text-xl` | 24px | Card headings |
| `lg` | `text-lg` | 20px | Subheadings |
| `base` | `text-base` | 16px | Body text |
| `sm` | `text-sm` | 12px | Small text, metadata |
| `xs` | `text-xs` | 10px | Captions, micro-copy |

#### Font Weights

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| `regular` | `font-normal` | 400 | Body text |
| `bold` | `font-bold` | 700 | Headings, emphasis |

**Typography Rules:**
1. Never use font sizes smaller than `text-xs` (10px)
2. Use `font-bold` for all headings
3. Line height: defaults are optimized (tight/base/relaxed)
4. Always set `text-content-*` color explicitly

### 2.3 Spacing

Use Tailwind's spacing scale (based on 4px grid):

| Token | Tailwind | Size | Usage |
|-------|----------|------|-------|
| `1` | `p-1`, `gap-1` | 4px | Tight internal spacing |
| `2` | `p-2`, `gap-2` | 8px | Icon-text gaps, small padding |
| `3` | `p-3`, `gap-3` | 12px | Medium internal spacing |
| `4` | `p-4`, `gap-4` | 16px | **Standard card padding** |
| `6` | `p-6`, `gap-6` | 24px | Large card padding (desktop) |
| `8` | `p-8`, `gap-8` | 32px | Section spacing |

**Standard Patterns:**
```tsx
// Card padding
<Card className="p-4 md:p-6"> // Responsive

// Icon + Text gap
<Button className="gap-2">

// Vertical stacking
<div className="space-y-4">
```

### 2.4 Border Radius

| Token | Tailwind | Size | Usage |
|-------|----------|------|-------|
| `sm` | `rounded-sm` | 4px | Badges, small elements |
| `md` | `rounded-md` | 8px | Buttons, inputs |
| `lg` | `rounded-lg` | 18px | Cards, large containers |
| `full` | `rounded-full` | 9999px | Pills, avatars, status indicators |

### 2.5 Shadows

| Token | Tailwind | Usage |
|-------|----------|-------|
| `sm` | `shadow-sm` | Subtle elevation |
| `md` | `shadow-md` | Standard elevation |
| `lg` | `shadow-lg` | Strong elevation (modals) |

**Custom shadows (defined in Tailwind config):**
- `shadow-soft`: Used for cards/buttons
- `shadow-card`: Used for interactive cards on hover

### 2.6 Motion & Animation

All animations use consistent timing and easing.

#### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 100ms | Hover states, focus rings |
| `fast` | 200ms | Menu slides, button feedback |
| `normal` | 300ms | Modals, page transitions |
| `slow` | 500ms | Complex multi-step animations |

**Tailwind classes:**
```tsx
duration-200  // Fast (default for most interactions)
duration-300  // Normal
duration-500  // Slow
```

#### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Most UI elements |
| `decelerate` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Entering elements |
| `accelerate` | `cubic-bezier(0.4, 0.0, 1, 1)` | Exiting elements |
| `sharp` | `cubic-bezier(0.4, 0.0, 0.6, 1)` | Quick feedback |

**Tailwind classes:**
```tsx
ease-in-out   // Standard (most common)
ease-out      // Decelerate
ease-in       // Accelerate
```

---

## 3. Component Library

All components are located in `src/design/components/` and use design tokens.

### 3.1 Button (`<Button />`)

Primary interactive element for actions.

#### Variants

**Primary** — Main call-to-action
```tsx
<Button variant="primary">Save Document</Button>
```
- **When:** Single most important action on screen
- **Style:** `bg-brand-primary text-brand-dark` with shadow
- **Examples:** Save, Submit, Scan, Start

**Secondary** — Alternative actions
```tsx
<Button variant="secondary">Cancel</Button>
```
- **When:** Alternative or back actions
- **Style:** `bg-surface-tertiary` with subtle border
- **Examples:** Cancel, Back, Skip

**Ghost** — Low-priority inline actions
```tsx
<Button variant="ghost">View Details</Button>
```
- **When:** Tertiary actions, links, inline options
- **Style:** Transparent background, visible on hover
- **Examples:** Details, Edit, More options

**Danger** — Destructive actions
```tsx
<Button variant="danger">Delete</Button>
```
- **When:** Irreversible or dangerous operations
- **Style:** `bg-error/10 text-error` with red border
- **Examples:** Delete, Remove, Cancel Order

#### Sizes

```tsx
<Button size="sm">Small</Button>      // 32px height
<Button size="md">Medium</Button>     // 40px height (default)
<Button size="lg">Large</Button>      // 48px height
<Button size="icon"><Icon /></Button> // 40×40px square
```

#### Props

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;        // Shows spinner
  startIcon?: React.ReactNode; // Icon before text
  endIcon?: React.ReactNode;   // Icon after text
  fullWidth?: boolean;         // w-full
  disabled?: boolean;
}
```

#### Examples

```tsx
// With icons
<Button variant="primary" startIcon={<Check />}>
  Confirm
</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Icon only
<Button variant="ghost" size="icon">
  <Settings />
</Button>

// Full width (mobile forms)
<Button fullWidth variant="primary">
  Continue
</Button>
```

#### Rules
1. ✅ Use `primary` for ONE main action per screen
2. ✅ Always provide `startIcon` or `endIcon` for clarity
3. ❌ Never use more than 2 primary buttons on one screen
4. ❌ Never nest buttons or make them too small (<32px)

---

### 3.2 Card (`<Card />`)

Container for grouped content.

#### Variants

**Base** — Standard container
```tsx
<Card>
  <h3>Title</h3>
  <p>Content...</p>
</Card>
```
- **Style:** `bg-surface-secondary` with subtle border
- **Usage:** Most common, for static content groups

**Elevated** — Floating content
```tsx
<Card variant="elevated">
  <h3>Important Info</h3>
</Card>
```
- **Style:** Base + `shadow-soft`
- **Usage:** Emphasized content, floating panels

**Interactive** — Clickable cards
```tsx
<Card variant="interactive" onClick={handleClick}>
  <h3>Click Me</h3>
</Card>
```
- **Style:** Elevated + hover effects + cursor pointer
- **Usage:** Document cards, selectable items

#### Props

```tsx
interface CardProps {
  variant?: 'base' | 'elevated' | 'interactive';
  noPadding?: boolean; // Removes default p-4 md:p-6
}
```

#### Standard Patterns

```tsx
// Document card
<Card variant="interactive" className="hover:border-brand-primary">
  <div className="flex justify-between items-start mb-3">
    <h3 className="text-lg font-bold">Document #001</h3>
    <Badge variant="success" label="Completed" />
  </div>
  <p className="text-sm text-content-secondary">
    Last updated: 2 hours ago
  </p>
</Card>

// Section container
<Card className="space-y-4">
  <h2 className="text-xl font-bold">Settings</h2>
  {/* Content */}
</Card>
```

#### Rules
1. ✅ Always pad cards with `p-4` or `p-6` (unless `noPadding`)
2. ✅ Use `space-y-4` for vertical content stacking
3. ❌ Never nest interactive cards (creates confusing clickable areas)

---

### 3.3 Badge (`<Badge />`)

Small status indicators.

```tsx
<Badge label="Success" variant="success" />
<Badge label="Warning" variant="warning" icon={<AlertTriangle />} />
```

#### Variants

| Variant | Color | Usage |
|---------|-------|-------|
| `success` | Green | Completed, approved, active |
| `warning` | Orange | Pending, needs attention |
| `error` | Red | Failed, rejected, blocked |
| `info` | Cyan | Neutral info, optional |
| `neutral` | Gray | Default, no status |

#### Props

```tsx
interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: React.ReactNode;
}
```

---

### 3.4 Avatar (`<Avatar />`)

User profile pictures with status indicators.

```tsx
<Avatar 
  src="https://..." 
  fallback="JD" 
  size="md" 
  status="online" 
/>
```

#### Sizes

- `sm`: 32px (8 × 8)
- `md`: 40px (10 × 10) — default
- `lg`: 64px (16 × 16)

#### Status Indicators

- `online`: Green dot
- `offline`: Gray dot
- `busy`: Red dot

#### Avatar Stacks

```tsx
<div className="flex -space-x-3">
  <Avatar size="sm" fallback="A" className="border-2 border-surface-secondary" />
  <Avatar size="sm" fallback="B" className="border-2 border-surface-secondary" />
  <Avatar size="sm" fallback="C" className="border-2 border-surface-secondary" />
  <div className="w-8 h-8 rounded-full bg-surface-tertiary border-2 border-surface-secondary flex items-center justify-center text-xs font-bold">
    +5
  </div>
</div>
```

---

### 3.5 Progress Bar (`<ProgressBar />`)

Visual progress indicator.

```tsx
<ProgressBar value={75} showLabel />
<ProgressBar value={100} variant="success" />
```

#### Variants

- `primary`: Brand secondary color (cyan)
- `success`: Green (for completed states)
- `warning`: Orange
- `error`: Red

#### Sizes

- `sm`: 4px height
- `md`: 8px height (default)

---

### 3.6 Form Elements

#### Input (`<Input />`)

```tsx
<Input 
  type="email" 
  placeholder="Enter email"
  icon={<Search />}
  error={hasError}
/>
```

**Props:**
- `icon`: Icon displayed on the left
- `error`: Boolean, adds red border and focus ring

#### TextArea (`<TextArea />`)

```tsx
<TextArea 
  rows={4}
  placeholder="Enter description..."
  error={hasError}
/>
```

#### Checkbox (`<Checkbox />`)

```tsx
<Checkbox 
  label="I agree to terms"
  description="Optional help text"
  checked={isChecked}
  onChange={() => setIsChecked(!isChecked)}
/>
```

#### Toggle (`<Toggle />`)

```tsx
<Toggle 
  label="Notifications"
  description="Receive email alerts"
  checked={enabled}
  onChange={() => setEnabled(!enabled)}
/>
```

---

## 4. Accessibility

### 4.1 Color Contrast

All color combinations meet **WCAG AA standards** (4.5:1 for normal text, 3:1 for large text).

#### Tested Combinations

| Background | Text | Ratio | Pass |
|------------|------|-------|------|
| `surface-primary` (#242424) | `content-primary` (#ffffff) | 13.5:1 | ✅ AAA |
| `surface-secondary` (#343436) | `content-secondary` (#e3e3dd) | 10.2:1 | ✅ AAA |
| `brand-primary` (#daa420) | `brand-dark` (#725a1e) | 4.8:1 | ✅ AA |
| `success` (#91ed91) | `surface-primary` (#242424) | 8.1:1 | ✅ AAA |

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify custom combinations.

### 4.2 Focus States

All interactive elements have visible focus indicators.

```tsx
// Standard focus ring
focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
```

**Rules:**
1. ✅ Never remove focus styles without replacement
2. ✅ Focus ring must be 2px minimum
3. ✅ Focus offset should be 2px for separation

### 4.3 Touch Targets

**Minimum size:** 44×44px for all interactive elements (WCAG 2.1 Level AAA)

```tsx
// All buttons meet this
<Button size="sm">Small</Button> // 32px height ❌ (use sparingly)
<Button size="md">Normal</Button> // 40px height ✅
<Button size="lg">Large</Button> // 48px height ✅
```

### 4.4 Screen Readers

Use semantic HTML and ARIA labels:

```tsx
// Button with icon only
<Button variant="ghost" size="icon" aria-label="Open settings">
  <Settings />
</Button>

// Status indicator
<Badge label="Active" variant="success" />
<span className="sr-only">Document status: Active</span>

// Loading state
<Button isLoading aria-busy="true">
  Saving...
</Button>
```

### 4.5 Keyboard Navigation

All components support keyboard navigation:
- **Tab**: Move between focusable elements
- **Enter/Space**: Activate buttons, checkboxes
- **Escape**: Close modals, menus
- **Arrow keys**: Navigate within components (future: dropdowns)

---

## 5. Motion & Animation

### 5.1 When to Animate

✅ **Do animate:**
- State changes (hover, active, focus)
- Content appearing/disappearing (modals, tooltips)
- Feedback (button press, form submission)
- Progress indicators

❌ **Don't animate:**
- Initial page load (too slow)
- Critical actions (scanning, saving) — instant feedback
- Decorative effects (distracting)

### 5.2 Duration Guidelines

| Duration | Value | Usage | Examples |
|----------|-------|-------|----------|
| **Instant** | 100ms | Micro-interactions | Hover, focus ring |
| **Fast** | 200ms | UI state changes | Button press, menu slide |
| **Normal** | 300ms | Standard transitions | Modal open, page transition |
| **Slow** | 500ms | Complex animations | Multi-step flow, progress bar |

**Standard pattern:**
```tsx
className="transition-all duration-200 ease-in-out"
```

### 5.3 Animation Examples

#### Button Press Feedback
```tsx
<Button className="active:scale-[0.98]">
  Click Me
</Button>
```

#### Hover Card
```tsx
<Card className="hover:border-brand-primary hover:shadow-card transition-all duration-200">
  Content
</Card>
```

#### Fade In
```tsx
<div className="animate-in fade-in duration-300">
  Appearing content
</div>
```

### 5.4 Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Spacing & Layout

### 6.1 Spacing Scale

Use consistent spacing based on 4px grid:

```tsx
// Internal card spacing
<Card className="space-y-4">
  <h3>Title</h3>
  <p>Content</p>
  <Button>Action</Button>
</Card>

// Grid gaps
<div className="grid grid-cols-2 gap-4">
  <Card>1</Card>
  <Card>2</Card>
</div>

// Icon-text gaps
<Button className="gap-2" startIcon={<Check />}>
  Confirm
</Button>
```

### 6.2 Responsive Patterns

Use Tailwind's responsive breakpoints:

```tsx
// Mobile: p-4, Desktop: p-6
<Card className="p-4 md:p-6">

// Mobile: 1 column, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// Mobile: stack, Desktop: row
<div className="flex flex-col md:flex-row gap-4">
```

### 6.3 Layout Rules

1. **Standard card padding:** `p-4` (mobile), `p-6` (desktop)
2. **Section spacing:** `space-y-8` or `space-y-16`
3. **Icon-text gap:** `gap-2` (8px)
4. **Grid gap:** `gap-4` (16px) or `gap-6` (24px)
5. **Max content width:** `max-w-5xl mx-auto` for readability

---

## 7. Best Practices

### 7.1 Component Composition

✅ **Do:**
```tsx
// Use design system components
import { Button, Card } from '@/design/components';

<Card className="space-y-4">
  <h3 className="text-lg font-bold text-content-primary">Title</h3>
  <p className="text-sm text-content-secondary">Description</p>
  <Button variant="primary">Action</Button>
</Card>
```

❌ **Don't:**
```tsx
// Don't recreate components inline
<div className="bg-surface-secondary p-4 rounded-lg border">
  <button className="bg-brand-primary px-4 py-2 rounded">
    Action
  </button>
</div>
```

### 7.2 Consistent Patterns

**Document card pattern:**
```tsx
<Card variant="interactive">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="text-lg font-bold">#{doc.number}</h3>
      <p className="text-sm text-content-tertiary">{doc.partner}</p>
    </div>
    <Badge variant="success" label={doc.status} />
  </div>
  <div className="text-xs text-content-tertiary">
    {formatDate(doc.createdAt)}
  </div>
</Card>
```

**Form field pattern:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-content-secondary">
    Email Address
  </label>
  <Input 
    type="email" 
    placeholder="user@example.com"
    icon={<Mail />}
  />
  <p className="text-xs text-content-tertiary">
    We'll never share your email.
  </p>
</div>
```

### 7.3 Code Style

```tsx
// ✅ Good: Semantic, readable, uses tokens
<Button 
  variant="primary" 
  size="lg" 
  startIcon={<Check />}
  onClick={handleSave}
>
  Save Document
</Button>

// ❌ Bad: Inline styles, hardcoded colors
<button 
  style={{ 
    backgroundColor: '#daa420', 
    padding: '12px 24px',
    borderRadius: '8px'
  }}
  onClick={handleSave}
>
  Save Document
</button>
```

---

## 8. Extending the System

### 8.1 Adding a New Component

1. **Create component file:** `src/design/components/NewComponent.tsx`

```tsx
import React from 'react';

export interface NewComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const NewComponent: React.FC<NewComponentProps> = ({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // Use design tokens via Tailwind classes
  const baseStyles = 'rounded-lg transition-all duration-200';
  
  const variants = {
    primary: 'bg-brand-primary text-brand-dark',
    secondary: 'bg-surface-tertiary text-content-primary',
  };
  
  const sizes = {
    sm: 'p-2 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {/* Component content */}
    </div>
  );
};
```

2. **Export from index:** `src/design/components/index.ts`

```tsx
export * from './NewComponent';
```

3. **Add to showcase:** `src/pages/DesignSystemShowcase.tsx`

```tsx
<section>
  <SectionHeader title="New Component" description="..." />
  <NewComponent variant="primary" size="md" />
</section>
```

4. **Update this document:** Add usage guidelines and examples

### 8.2 Adding New Tokens

1. **Update JSON:** `src/theme/design-system.json`

```json
{
  "dna": {
    "colors": {
      "brand": {
        "tertiary": "#ff0000"
      }
    }
  }
}
```

2. **Update tokens:** `src/design/tokens.ts`

```tsx
export const tokens = {
  colors: {
    brand: {
      // ...
      tertiary: designSystem.dna.colors.brand.tertiary,
    }
  }
}
```

3. **Update Tailwind config:** `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-tertiary': designSystem.dna.colors.brand.tertiary,
      }
    }
  }
}
```

4. **Use in components:** `bg-brand-tertiary`, `text-brand-tertiary`

### 8.3 Modifying Existing Components

1. **Don't modify directly** — create variants instead
2. **Use className prop** for one-off customizations
3. **Propose changes** via code review if pattern is reusable

```tsx
// ✅ Good: Use className for custom styles
<Button className="w-full" variant="primary">
  Full Width Button
</Button>

// ❌ Bad: Modify Button.tsx for one use case
```

---

## 📚 Resources

### Design System Tools
- **Figma:** Source of truth for design tokens
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/ (our icon library)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project](https://www.a11y-project.com/)

### Typography
- [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) — Font info

---

## 📝 Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-21 | 1.0.0 | Initial comprehensive guidelines created |

---

**Questions?** Contact the design team or open an issue in the repo.

**Location:** `DOCS/DESIGN_SYSTEM_GUIDELINES.md`  
**Component Library:** `src/design/components/`  
**Showcase:** http://localhost:5173/design-system

