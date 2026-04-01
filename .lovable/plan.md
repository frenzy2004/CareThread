

# Mobile Polish — Revised Plan

Incorporating your feedback: no global `html` safe-area padding. Each fixed/positioned element handles its own insets. Page wrappers handle bottom spacing.

---

## 1. Viewport Meta

**`index.html`** — Add `viewport-fit=cover` to the existing viewport meta tag. This enables `env(safe-area-inset-*)` values on iOS/Android.

## 2. Bottom Nav — Own Inset Handling

**`src/components/BottomNav.tsx`** — Add `pb-[env(safe-area-inset-bottom)]` to the nav container. The nav already has `h-16`; the safe area padding extends below it so the home bar never overlaps buttons.

## 3. Floating CTA — Own Inset Handling

**`src/pages/Dashboard.tsx`** line 145 — Change `bottom-20` to `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]`. Keep `md:bottom-6` for desktop. Using 5.5rem as a starting point (nav is 4rem + some breathing room). May need visual tuning after implementation.

## 4. Page Container Bottom Padding

Update `pb-24` on each page wrapper to `pb-[calc(6rem+env(safe-area-inset-bottom))]` so content scrolls clear of the bottom nav + safe area:

- `src/pages/Dashboard.tsx` line 51
- `src/pages/Symptoms.tsx` — page container
- `src/pages/Medications.tsx` — page container
- `src/pages/Timeline.tsx` — page container
- `src/pages/Settings.tsx` — page container

## 5. Bottom Sheet Drawers for Forms

**`src/pages/Symptoms.tsx`**:
- Import `Drawer, DrawerContent, DrawerHeader, DrawerTitle` from `@/components/ui/drawer`
- Replace the inline `showForm && <motion.div>` card with `<Drawer open={showForm} onOpenChange={setShowForm}>`
- Move the form markup into `<DrawerContent>` with a scrollable inner container (`overflow-y-auto max-h-[85vh]`) to handle keyboard-open scenarios
- Keep form logic identical

**`src/pages/Medications.tsx`**:
- Same pattern: wrap the "Add Medication" form in a `<Drawer>` bottom sheet
- Scrollable content area for when keyboard pushes content up

### Drawer content guidelines
- `max-h-[85vh]` with `overflow-y-auto` on the form wrapper inside DrawerContent — prevents full-screen takeover and handles keyboard visibility
- Compact internal spacing (`space-y-3`, `p-4`)
- No changes to form fields or validation logic

## Files Modified

| File | Change |
|------|--------|
| `index.html` | Add `viewport-fit=cover` to meta |
| `src/components/BottomNav.tsx` | Safe area bottom padding on nav |
| `src/pages/Dashboard.tsx` | CTA inset fix + page pb |
| `src/pages/Symptoms.tsx` | Drawer form + page pb |
| `src/pages/Medications.tsx` | Drawer form + page pb |
| `src/pages/Timeline.tsx` | Page pb |
| `src/pages/Settings.tsx` | Page pb |

No new dependencies. No global CSS changes. Each element owns its own safe-area spacing.

