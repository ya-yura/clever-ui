# 🎨 Design System

**Location:** `src/design/`  
**Version:** 1.0.0

## Quick Start

```tsx
import { Button, Card, Badge, Chip, Avatar } from '@/design/components';

// Use components with design tokens
<Card className="space-y-4">
  <h3 className="text-lg font-bold text-content-primary">Title</h3>
  <div className="flex gap-2">
    <Chip label="Filter" variant="primary" active />
    <Chip label="Tag" variant="neutral" />
  </div>
  <Button variant="primary">Action</Button>
</Card>
```

## Structure

```
src/design/
├── tokens.ts           # Design tokens (colors, spacing, typography, motion)
├── components/         # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Chip.tsx       # Interactive badge/pill
│   ├── Avatar.tsx
│   ├── Input.tsx
│   ├── Checkbox.tsx
│   ├── Toggle.tsx
│   ├── ProgressBar.tsx
│   ├── Skeleton.tsx   # NEW: Loading placeholders
│   └── index.ts       # Exports all components
└── README.md          # This file
```

## 📖 Full Documentation

**Comprehensive guidelines:** [`DOCS/DESIGN_SYSTEM_GUIDELINES.md`](../../DOCS/DESIGN_SYSTEM_GUIDELINES.md)

Includes:
- Philosophy & design principles
- Complete token reference
- Component usage & variants
- Accessibility standards
- Motion & animation guidelines
- Spacing & layout rules
- Best practices
- How to extend the system

## 🎨 Live Showcase

Visit: http://localhost:5173/design-system

The showcase demonstrates all components with live examples and code patterns.

## Quick Reference

### Colors
```tsx
// Backgrounds
bg-surface-primary    // #242424 (page bg)
bg-surface-secondary  // #343436 (cards)
bg-surface-tertiary   // #474747 (borders)

// Text
text-content-primary    // #ffffff (headings)
text-content-secondary  // #e3e3dd (body)
text-content-tertiary   // #a7a7a7 (metadata)

// Brand
bg-brand-primary    // #daa420 (golden yellow)
text-brand-dark     // #725a1e (text on brand)

// Status
text-success  // Green
text-warning  // Orange
text-error    // Red
text-info     // Cyan
```

### Spacing
```tsx
p-4      // 16px (standard card padding mobile)
p-6      // 24px (standard card padding desktop)
gap-2    // 8px (icon-text gap)
gap-4    // 16px (grid gap)
space-y-4 // 16px (vertical stack)
```

### Typography
```tsx
text-3xl font-bold  // Page titles
text-xl font-bold   // Card headings
text-base           // Body text
text-sm             // Small text
text-xs             // Captions

text-content-primary   // Headings
text-content-secondary // Body
text-content-tertiary  // Metadata
```

### Common Patterns

**Button with icon:**
```tsx
<Button variant="primary" startIcon={<Check />}>
  Confirm
</Button>
```

**Interactive card:**
```tsx
<Card variant="interactive" onClick={handleClick}>
  <div className="flex justify-between mb-2">
    <h3 className="text-lg font-bold">Title</h3>
    <Badge variant="success" label="Active" />
  </div>
  <p className="text-sm text-content-secondary">Description</p>
</Card>
```

**Form field:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-content-secondary">
    Email
  </label>
  <Input 
    type="email" 
    placeholder="user@example.com"
    icon={<Mail />}
  />
</div>
```

**Filters with chips:**
```tsx
<div className="flex flex-wrap gap-2">
  <Chip 
    label="Active" 
    variant="success" 
    active={isActive}
    onClick={() => setIsActive(!isActive)}
  />
  <Chip label="Pending" variant="warning" />
  <Chip label="Cancelled" variant="error" />
</div>
```

**Loading states with skeletons:**
```tsx
{loading ? (
  <>
    <Skeleton variant="text" width="60%" height={24} />
    <SkeletonText lines={3} />
    <SkeletonCard hasAvatar />
  </>
) : (
  <RealContent />
)}
```

## Rules

1. ✅ Always use components from this library
2. ✅ Use Tailwind utility classes with design tokens
3. ❌ Never hardcode colors, sizes, or spacing
4. ❌ Never recreate components inline
5. ✅ Follow accessibility guidelines (WCAG AA)
6. ✅ Maintain minimum 44×44px touch targets

## Need Help?

- **Full docs:** `DOCS/DESIGN_SYSTEM_GUIDELINES.md`
- **Showcase:** http://localhost:5173/design-system
- **Issues:** Open a GitHub issue with `design-system` label

