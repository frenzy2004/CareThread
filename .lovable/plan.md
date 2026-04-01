

# Make Mood Emojis Reactive

**`src/components/DailyCheckIn.tsx`** — One file change:

1. Convert each emoji `<button>` to `<motion.button>` with:
   - `whileTap={{ scale: 0.85 }}`
   - `animate={{ scale: selectedMood === value ? 1.15 : 1 }}`
   - `transition={{ type: "spring", stiffness: 400, damping: 12 }}`
   - Remove static `scale-110` from the className

2. Wrap emoji text in `<motion.span>` with:
   - `key={selectedMood === value ? 'selected' : 'idle'}` — this ensures the wiggle plays only on selection change, not every re-render
   - `initial={{ rotate: 0 }}`
   - `animate={{ rotate: selectedMood === value ? [0, -8, 8, -4, 0] : 0 }}`
   - `transition={{ duration: 0.4 }}`

The `key` prop is the critical detail — it forces React to remount the span only when selection state changes, so the wiggle animation fires once on select, not continuously.

No other animations added. Button handles scale, span handles wiggle. Clean separation.

| File | Change |
|------|--------|
| `src/components/DailyCheckIn.tsx` | motion.button + motion.span with spring scale and rotate wiggle |

