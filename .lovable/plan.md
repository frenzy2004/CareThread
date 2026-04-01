

# Plan: PDF Export + Symptom Trend Charts

Two features in one update: (1) Doctor Summary PDF export with Patient/Doctor view toggle, (2) Recharts-based severity trend charts on the Symptoms page.

---

## 1. Symptom Trend Charts (Symptoms Page)

Add a "Trends" section above the symptom list in `src/pages/Symptoms.tsx`:

- **Weekly severity chart**: Area/line chart using `recharts` showing average daily severity over the last 14 days
- **Symptom frequency bar chart**: Horizontal bars showing top 5 most-logged symptoms with count
- **Toggle**: "List" vs "Trends" view tabs at the top so charts don't clutter the log view
- Uses the warm severity color palette (gold → terracotta gradient)
- Only shows when there are 3+ symptom entries (otherwise too little data)

**Files modified**: `src/pages/Symptoms.tsx`

---

## 2. PDF Export with Patient/Doctor Mode

Create a new export component and utility:

### `src/lib/pdf-export.ts`
- Uses `jspdf` + `jspdf-autotable` for client-side PDF generation
- Two modes controlled by a `mode: 'patient' | 'doctor'` parameter:

| Aspect | Patient View | Doctor View |
|--------|-------------|-------------|
| Language | Warm, friendly | Clinical, concise |
| Emojis | Mood emojis shown | No emojis, numeric scale |
| Layout | Narrative with insights | Summary tables only |
| Sections | Trends, insights, notes | Meds table, severity stats, timeline |

- Sections: header with date range, current medications table, symptom summary (top symptoms + avg severity), check-in mood trend, compliance stats
- Branded with CareThread warm colors (terracotta accents in headers)

### `src/components/ExportPDF.tsx`
- Modal/card UI triggered from Settings page
- Date range picker (last 7/14/30 days or custom)
- Patient View / Doctor View toggle (styled warm switch)
- "Generate PDF" button → downloads file

### `src/pages/Settings.tsx`
- Add "Share with Doctor" section with the ExportPDF component between the data overview and backup sections

**New files**: `src/lib/pdf-export.ts`, `src/components/ExportPDF.tsx`
**Modified files**: `src/pages/Settings.tsx`
**New dependency**: `jspdf`, `jspdf-autotable`

---

## Implementation Order

1. Add `jspdf` + `jspdf-autotable` dependencies
2. Build symptom trend charts in Symptoms page
3. Build PDF generation utility (`pdf-export.ts`)
4. Build ExportPDF component with mode toggle
5. Wire into Settings page

