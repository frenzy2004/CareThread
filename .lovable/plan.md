

# Comprehensive Fix — Implementation Plan

## Priority 1: Shared State + Tailwind Fix

### 1a. Create `src/contexts/HealthDataContext.tsx`
- React context wrapping `useHealthData()` — called once, exposed via `useHealthDataContext()` hook
- Throws clear error if used outside provider

### 1b. Update `src/App.tsx`
- Wrap content with `<HealthDataProvider>` inside `<BrowserRouter>`

### 1c. Migrate all consumers
Replace `useHealthData()` → `useHealthDataContext()` in:
- `Dashboard.tsx`, `Symptoms.tsx`, `Medications.tsx`, `Timeline.tsx`, `Settings.tsx`, `ExportPDF.tsx`

### 1d. Severity class fix
Create shared map in `src/lib/constants.ts`:
```ts
export const SEVERITY_BG: Record<number, string> = {
  1: 'bg-severity-1', 2: 'bg-severity-2', ...
};
```
Replace all `severity-${n}` dynamic strings in `Dashboard.tsx`, `Symptoms.tsx`, `TimelineEvent.tsx` with map lookups. Add safelist to `tailwind.config.ts`.

---

## Priority 2: Symptom Editing, Accessibility, Timeline

### 2a. Symptom editing
- Add `updateSymptom(id, updates)` to `useHealthData.ts`
- `Symptoms.tsx`: add `editingSymptom` state. Tapping a card opens drawer pre-filled. Title switches to "Edit Symptom". Submit calls update vs add based on state.

### 2b. Accessibility
- **`DailyCheckIn.tsx`**: `role="group"` + `aria-label="Select your mood"` on mood container. `aria-label={label}` + `aria-pressed={selectedMood === value}` on each mood button.
- **`MedicationCard.tsx`**: `aria-label` on compliance toggle, discontinue, delete buttons (include medication name).
- **`Symptoms.tsx`**: `aria-label` on delete buttons. `sr-only` spans on severity dots.
- **`TimelineEvent.tsx`**: `sr-only` span for severity dots.
- **`BottomNav.tsx`**: `aria-label` on nav links.

### 2c. Timeline cleanup
- Default `focusMode` to `true`
- Rename label: `"Key events"` / `"All events"` toggle text
- Update empty state message to reference "Key events" instead of "Focus"

---

## Priority 3: Provider Management, Dashboard Cleanup

### 3a. Provider management in `Settings.tsx`
- "Care Team" section: add form (name + specialty), provider list with color dots, delete button
- Block delete if any medication references the provider (show toast)
- Add `deleteProvider` to `useHealthData.ts`

### 3b. Provider selector in `Medications.tsx`
- Add optional provider dropdown in the add/edit medication drawer
- Show provider name on medication cards if assigned

### 3c. Dashboard med cards
- Don't pass `onEdit` to `MedicationCard` on Dashboard — removes chevron/tappable hint
- Keep cards lightweight: compliance toggle + effect rating only

---

## Files Summary

| File | Action |
|------|--------|
| `src/contexts/HealthDataContext.tsx` | **Create** |
| `src/lib/constants.ts` | **Create** — severity map |
| `src/hooks/useHealthData.ts` | Add `updateSymptom`, `deleteProvider` |
| `src/App.tsx` | Wrap with provider |
| `src/pages/Dashboard.tsx` | Context hook, severity map, remove med card edit |
| `src/pages/Symptoms.tsx` | Context hook, edit flow, severity map, a11y |
| `src/pages/Medications.tsx` | Context hook, provider selector |
| `src/pages/Timeline.tsx` | Context hook, default key events, rename |
| `src/pages/Settings.tsx` | Context hook, provider management |
| `src/components/ExportPDF.tsx` | Context hook |
| `src/components/MedicationCard.tsx` | Aria-labels |
| `src/components/DailyCheckIn.tsx` | Aria-labels, aria-pressed |
| `src/components/TimelineEvent.tsx` | Severity map, sr-only text |
| `src/components/BottomNav.tsx` | Aria-labels |
| `tailwind.config.ts` | Safelist severity classes |

