

# PDF Export Improvements — Final

## Structure

Two-tier layout with a visual divider between tiers.

**Header**
- Existing colored banner
- Add explicit generated date/time: "Generated on: 1 April 2026"
- Add explicit date range: "Date range: 3 March 2026 – 1 April 2026"

**Tier 1 — Summary**
1. Mood overview + trend table (by day for 7d, by week for 14d/30d)
2. Current Medications & Adherence (grouped as one story — meds table then adherence table with minimal gap)
3. Symptom summary (aggregated counts)

**— Subtle divider line + "Additional Context" label —**

**Tier 2 — Additional Context**
4. Discontinued medications (name, dosage, end date, reason)
5. Providers / Care Team
6. Patient-Reported Medication Response (doctor) / How Meds Are Working (patient)
7. Recent check-in notes (last 7 with notes, oldest→newest, truncate at ~200 chars)
8. Recent symptom timeline (last 10, displayed oldest→newest, date/name/severity/body area/notes)

## Key details

- **Empty states**: neutral per section. Patient: "No symptoms were logged in this period." Doctor: "No symptom data recorded for this period."
- **Note wrapping**: autoTable column styles with max width, truncate at ~200 chars with ellipsis
- **Efficacy title**: Doctor → "Patient-Reported Medication Response", Patient → "How Meds Are Working"
- **Tier divider**: thin line + small gray italic text "Additional Context" centered, between Tier 1 and Tier 2
- **ExportPDF.tsx**: pass `providers`, disable button + inline message when zero total entries
- **ExportData interface**: add `providers: Provider[]`

## Files

| File | Changes |
|------|---------|
| `src/lib/pdf-export.ts` | Header date/range, two-tier structure with divider, 4 new sections, mood trend, neutral empty states, note truncation, renamed efficacy heading |
| `src/components/ExportPDF.tsx` | Pass providers, disable when no data with message |

