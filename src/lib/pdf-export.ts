import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CheckIn, Symptom, Medication, MedCompliance, MedEffectRating, Provider } from '@/types/health';
import { MOOD_EMOJIS } from '@/types/health';

export interface ExportData {
  checkIns: CheckIn[];
  symptoms: Symptom[];
  medications: Medication[];
  compliance: MedCompliance[];
  effectRatings: MedEffectRating[];
  providers: Provider[];
}

type ExportMode = 'patient' | 'doctor';

function filterByDays<T extends { timestamp?: number; date?: string }>(items: T[], days: number): T[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter(i => {
    const t = i.timestamp || new Date(i.date || '').getTime();
    return t >= cutoff;
  });
}

function truncate(text: string, max = 200): string {
  if (!text || text.length <= max) return text || '';
  return text.slice(0, max) + '…';
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getISOWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `Week ${week}`;
}

export function generatePDF(data: ExportData, mode: ExportMode, days: number) {
  const doc = new jsPDF();
  const isDoctor = mode === 'doctor';
  const primaryColor: [number, number, number] = [196, 112, 75];
  const sageColor: [number, number, number] = [124, 154, 130];
  const fgColor: [number, number, number] = [61, 44, 44];

  const checkIns = filterByDays(data.checkIns, days);
  const symptoms = filterByDays(data.symptoms, days);
  const recentCompliance = filterByDays(data.compliance, days);

  const now = new Date();
  const rangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // ── Header ──
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(isDoctor ? 'CareThread — Clinical Summary' : 'CareThread — Health Summary', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${formatDate(now)}`, 14, 21);
  doc.text(`Date range: ${formatDate(rangeStart)} – ${formatDate(now)}`, 14, 27);

  let y = 40;

  // ── Section helper ──
  const section = (title: string) => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setTextColor(...primaryColor);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += 2;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 6;
    doc.setTextColor(...fgColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  };

  const emptyMsg = (patientMsg: string, doctorMsg: string) => {
    doc.setTextColor(150, 140, 130);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(isDoctor ? doctorMsg : patientMsg, 14, y);
    y += 8;
    doc.setTextColor(...fgColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const updateY = () => {
    y = (doc as any).lastAutoTable.finalY + 8;
  };

  // ══════════════════════════════════════════
  // TIER 1 — SUMMARY
  // ══════════════════════════════════════════

  // ── 1. Mood Overview + Trend ──
  section(isDoctor ? 'Mood Assessment' : 'How You\'ve Been Feeling');

  if (checkIns.length > 0) {
    const avgMood = checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length;
    if (isDoctor) {
      doc.text(`Average mood score: ${avgMood.toFixed(1)} / 5 (n=${checkIns.length})`, 14, y);
    } else {
      const emoji = MOOD_EMOJIS.find(m => m.value === Math.round(avgMood));
      doc.text(`Your average mood: ${avgMood.toFixed(1)} / 5 ${emoji ? emoji.label : ''} over ${checkIns.length} check-ins`, 14, y);
    }
    y += 8;

    // Mood trend table
    if (days <= 7) {
      // By day
      const sorted = [...checkIns].sort((a, b) => a.timestamp - b.timestamp);
      autoTable(doc, {
        startY: y,
        head: [isDoctor ? ['Date', 'Mood Score'] : ['Date', 'Mood']],
        body: sorted.map(c => {
          const d = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const emoji = MOOD_EMOJIS.find(m => m.value === c.mood);
          return isDoctor ? [d, `${c.mood}/5`] : [d, `${emoji?.label || ''} (${c.mood}/5)`];
        }),
        theme: 'grid',
        headStyles: { fillColor: sageColor, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      updateY();
    } else {
      // By week
      const weekMap: Record<string, { total: number; count: number }> = {};
      [...checkIns].sort((a, b) => a.timestamp - b.timestamp).forEach(c => {
        const wk = getISOWeekLabel(c.date);
        if (!weekMap[wk]) weekMap[wk] = { total: 0, count: 0 };
        weekMap[wk].total += c.mood;
        weekMap[wk].count++;
      });
      autoTable(doc, {
        startY: y,
        head: [isDoctor ? ['Week', 'Avg Mood', 'Check-ins'] : ['Week', 'Average Mood', 'Check-ins']],
        body: Object.entries(weekMap).map(([wk, d]) => {
          const avg = (d.total / d.count).toFixed(1);
          const emoji = MOOD_EMOJIS.find(m => m.value === Math.round(d.total / d.count));
          return isDoctor ? [wk, `${avg}/5`, `${d.count}`] : [wk, `${emoji?.label || ''} (${avg}/5)`, `${d.count}`];
        }),
        theme: 'grid',
        headStyles: { fillColor: sageColor, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      updateY();
    }
  } else {
    emptyMsg('No mood check-ins were logged in this period.', 'No mood data recorded for this period.');
  }

  // ── 2. Current Medications & Adherence ──
  const activeMeds = data.medications.filter(m => m.status === 'active');
  section(isDoctor ? 'Current Medications & Adherence' : 'Your Medications & Adherence');

  if (activeMeds.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [isDoctor
        ? ['Medication', 'Class', 'Dosage', 'Frequency', 'Start Date']
        : ['Medication', 'Dosage', 'How Often', 'Started']
      ],
      body: activeMeds.map(m => isDoctor
        ? [m.name, m.drugClass || '—', m.dosage, m.frequency, m.startDate]
        : [m.name, m.dosage, m.frequency, m.startDate]
      ),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 3; // minimal gap

    // Adherence sub-table
    if (recentCompliance.length > 0) {
      const medAdherence = activeMeds.map(med => {
        const records = recentCompliance.filter(c => c.medicationId === med.id);
        const taken = records.filter(c => c.taken).length;
        const pct = records.length > 0 ? Math.round((taken / records.length) * 100) : 0;
        return { name: med.name, pct, taken, total: records.length };
      }).filter(m => m.total > 0);

      if (medAdherence.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [isDoctor ? ['Medication', 'Adherence %', 'Taken', 'Tracked Days'] : ['Medication', 'Adherence', 'Days Taken']],
          body: medAdherence.map(m => isDoctor
            ? [m.name, `${m.pct}%`, `${m.taken}/${m.total}`, `${m.total}`]
            : [m.name, `${m.pct}%`, `${m.taken} of ${m.total} days`]
          ),
          theme: 'grid',
          headStyles: { fillColor: sageColor, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        });
        updateY();
      }
    }
  } else {
    emptyMsg('No active medications recorded.', 'No active medications on file.');
  }

  // ── 3. Symptom Summary ──
  section(isDoctor ? 'Symptom Summary' : 'Symptom Patterns');

  if (symptoms.length > 0) {
    const counts: Record<string, { count: number; totalSev: number }> = {};
    symptoms.forEach(s => {
      if (!counts[s.name]) counts[s.name] = { count: 0, totalSev: 0 };
      counts[s.name].count++;
      counts[s.name].totalSev += s.severity;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count).slice(0, 10);

    autoTable(doc, {
      startY: y,
      head: [isDoctor
        ? ['Symptom', 'Occurrences', 'Avg Severity', 'Body Area']
        : ['Symptom', 'Times Logged', 'Avg Severity']
      ],
      body: sorted.map(([name, d]) => {
        const avgSev = (d.totalSev / d.count).toFixed(1);
        const areas = [...new Set(symptoms.filter(s => s.name === name && s.bodyArea).map(s => s.bodyArea))].join(', ');
        return isDoctor
          ? [name, `${d.count}`, `${avgSev}/5`, areas || '—']
          : [name, `${d.count}`, `${avgSev}/5`];
      }),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    updateY();
  } else {
    emptyMsg('No symptoms were logged in this period.', 'No symptom data recorded for this period.');
  }

  // ══════════════════════════════════════════
  // TIER DIVIDER
  // ══════════════════════════════════════════
  if (y > 255) { doc.addPage(); y = 20; }
  y += 4;
  doc.setDrawColor(180, 170, 160);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  y += 5;
  doc.setTextColor(150, 140, 130);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const dividerText = 'Additional Context';
  const dividerWidth = doc.getTextWidth(dividerText);
  doc.text(dividerText, (210 - dividerWidth) / 2, y);
  y += 8;
  doc.setTextColor(...fgColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // ══════════════════════════════════════════
  // TIER 2 — ADDITIONAL CONTEXT
  // ══════════════════════════════════════════

  // ── 4. Discontinued Medications ──
  const discontinuedMeds = data.medications.filter(m => m.status === 'discontinued');
  if (discontinuedMeds.length > 0) {
    section(isDoctor ? 'Discontinued Medications' : 'Past Medications');
    autoTable(doc, {
      startY: y,
      head: [isDoctor
        ? ['Medication', 'Dosage', 'End Date', 'Reason']
        : ['Medication', 'Dosage', 'Stopped', 'Reason']
      ],
      body: discontinuedMeds.map(m => [
        m.name,
        m.dosage,
        m.endDate || '—',
        m.discontinuationReason || '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: { 3: { cellWidth: 50 } },
    });
    updateY();
  }

  // ── 5. Providers / Care Team ──
  if (data.providers.length > 0) {
    section(isDoctor ? 'Treating Providers' : 'Your Care Team');
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Specialty']],
      body: data.providers.map(p => [p.name, p.specialty]),
      theme: 'grid',
      headStyles: { fillColor: sageColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    updateY();
  }

  // ── 6. Medication Response / Efficacy ──
  if (data.effectRatings.length > 0 && activeMeds.length > 0) {
    section(isDoctor ? 'Patient-Reported Medication Response' : 'How Meds Are Working');
    const medRatings = activeMeds.map(med => {
      const ratings = data.effectRatings.filter(r => r.medicationId === med.id);
      const latest = ratings[0];
      const betterCount = ratings.filter(r => r.rating === 'better').length;
      const worseCount = ratings.filter(r => r.rating === 'worse').length;
      return { name: med.name, latest: latest?.rating || '—', better: betterCount, worse: worseCount, total: ratings.length };
    }).filter(m => m.total > 0);

    if (medRatings.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [isDoctor
          ? ['Medication', 'Latest Rating', 'Better %', 'Worse %', 'n']
          : ['Medication', 'Latest', 'Helped', 'Worse']
        ],
        body: medRatings.map(m => isDoctor
          ? [m.name, m.latest, m.total > 0 ? `${Math.round(m.better / m.total * 100)}%` : '—', m.total > 0 ? `${Math.round(m.worse / m.total * 100)}%` : '—', `${m.total}`]
          : [m.name, m.latest, `${m.better} times`, `${m.worse} times`]
        ),
        theme: 'grid',
        headStyles: { fillColor: sageColor, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      updateY();
    }
  }

  // ── 7. Recent Check-in Notes ──
  const notedCheckIns = checkIns
    .filter(c => c.note && c.note.trim())
    .sort((a, b) => a.timestamp - b.timestamp) // oldest first
    .slice(-7); // last 7

  if (notedCheckIns.length > 0) {
    section(isDoctor ? 'Recent Patient Notes' : 'Your Recent Notes');
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Mood', 'Note']],
      body: notedCheckIns.map(c => {
        const d = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const moodLabel = isDoctor ? `${c.mood}/5` : (MOOD_EMOJIS.find(m => m.value === c.mood)?.label || `${c.mood}/5`);
        return [d, moodLabel, truncate(c.note!, 200)];
      }),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: { 2: { cellWidth: 110 } },
    });
    updateY();
  }

  // ── 8. Recent Symptom Timeline ──
  const recentSymptoms = [...symptoms]
    .sort((a, b) => a.timestamp - b.timestamp) // oldest first among selected
    .slice(-10);

  if (recentSymptoms.length > 0) {
    section(isDoctor ? 'Recent Symptom Timeline' : 'Recent Symptom Log');
    autoTable(doc, {
      startY: y,
      head: [isDoctor
        ? ['Date', 'Symptom', 'Severity', 'Body Area', 'Notes']
        : ['Date', 'Symptom', 'Severity', 'Notes']
      ],
      body: recentSymptoms.map(s => {
        const d = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const notes = truncate(s.notes || '', 200);
        return isDoctor
          ? [d, s.name, `${s.severity}/5`, s.bodyArea || '—', notes || '—']
          : [d, s.name, `${s.severity}/5`, notes || '—'];
      }),
      theme: 'grid',
      headStyles: { fillColor: sageColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: isDoctor ? { 4: { cellWidth: 50 } } : { 3: { cellWidth: 60 } },
    });
    updateY();
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 140, 130);
    doc.text('Generated by CareThread — for informational purposes only', 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, 180, 290);
  }

  doc.save(`carethread-${mode}-${days}d-${new Date().toISOString().split('T')[0]}.pdf`);
}
