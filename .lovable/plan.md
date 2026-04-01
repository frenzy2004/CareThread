

# Add Focus Blur/Glow Effect to Interactive Elements

When the user taps on Sign In / Sign Up toggle or focuses an input field, that element gets a subtle frosted-glass blur glow — making it stand out against the transparent card.

## Changes

### `src/pages/Landing.tsx`

**Toggle buttons (Sign In / Sign Up):**
- Active state gets `backdrop-blur-md bg-white/20` — creates a localized frosted glass effect on the selected tab only

**Input fields (Email / Password):**
- On focus, add `focus:backdrop-blur-md focus:bg-white/15 focus:border-white/25` — the field itself becomes slightly frosted when tapped, drawing attention
- Transition smoothly with `transition-all duration-200`

**Submit button:**
- Add `active:backdrop-blur-sm` for a subtle blur on tap

This keeps the card itself fully transparent but gives each interactive element its own glass moment when touched.

