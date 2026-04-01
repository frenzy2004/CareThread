

# Weekly Summary Card — Final Refined Plan

## Component: `src/components/WeeklySummary.tsx`

Warm "This week at a glance" card between Daily Check-in and Today's Medications. Shown when 2+ check-in days exist in the last 7.

### 2x2 grid + footer

| Check-ins | Avg Mood |
|-----------|----------|
| 5 of 7 days | 🙂 3.8 |
| **Symptoms** | **Compliance** |
| 12 symptoms logged | Took most doses |
| ↗ Mood trending upward |

### Key refinements

**Symptom wording**: Use `"{n} symptoms logged"` or `"{n} entries this week"` if zero symptoms — never just a bare number.

**Compliance tiers** (fixed in code):
- 100% → "Took all doses"
- 80–99% → "Took most doses"
- 40–79% → "Some doses missed"
- <40% → "Several doses missed"

Denominator: only count days where `today >= med.startDate` within the 7-day window per active med.

**Mood trend deadband** (±0.3):
- diff > 0.3 → "Mood trending upward" ↗
- diff < -0.3 → "Mood trending downward" ↘
- otherwise → "Mood holding steady" →

Comparison: average mood of days 1–3 vs days 4–7 of the week.

### Visibility
Hidden when <2 check-in days in the last 7.

## Files
- **New**: `src/components/WeeklySummary.tsx`
- **Modified**: `src/pages/Dashboard.tsx` — render after DailyCheckIn, pass health data props

