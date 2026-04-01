

# Medication Section Polish — Final

No changes from the revised plan. User feedback confirms the approach and adds three refinements to incorporate:

1. **Lightweight discontinue Drawer** — medication name, chips, text field only for "Other", single confirm button. No extra chrome.
2. **Mutual exclusion** — `editingMed` and `discontinuingMed` clear each other when set.
3. **Immediate visual result** — on discontinue confirm, close Drawer, med moves from active to past section instantly.

All three are implementation details within the existing plan structure.

---

## Changes by file

### `src/hooks/useHealthData.ts`
- Add `discontinueMedication(id, reason?)` — sets `status: 'discontinued'`, `endDate: today()`, `discontinuationReason`
- Export it in the return object

### `src/components/MedicationCard.tsx`
- Add `onEdit`, `onDiscontinue` props
- Replace `X` icon with `Circle` for untaken compliance
- Make name/details area a tappable button calling `onEdit`, add `ChevronRight` affordance
- Wrap trash icon in `AlertDialog` — "Delete medication? This can't be undone. To preserve history, discontinue instead." Cancel / Delete
- Add `Pause` icon button for discontinue (more prominent than trash)

### `src/pages/Medications.tsx`
- Add `editingMed` and `discontinuingMed` state, mutually exclusive (setting one clears the other)
- **Edit mode**: open existing drawer pre-filled, submit calls `updateMedication`
- **Discontinue Drawer**: med name header, reason chips (Side effects · Not helping · Doctor changed · Completed course · Other), text field appears only when "Other" selected, Confirm button → calls `discontinueMedication`, closes drawer
- **Past meds section**: show Badge ("Discontinued"), end date, reason if provided

| File | Summary |
|------|---------|
| `useHealthData.ts` | `discontinueMedication` function |
| `MedicationCard.tsx` | `onEdit` + `onDiscontinue` props, AlertDialog, Circle icon, ChevronRight |
| `Medications.tsx` | Edit + discontinue flows, mutual exclusion, enhanced past-med cards |

