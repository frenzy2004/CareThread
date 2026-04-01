import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CheckIn, Symptom, Medication, MedCompliance, MedEffectRating } from '@/types/health';
import { MOOD_EMOJIS } from '@/types/health';

interface ExportData {
  checkIns: CheckIn[];
  symptoms: Symptom[];
  medications: Medication[];
  compliance: MedCompliance[];
  effectRatings: MedEffectRating[];
}

type ExportMode = 'patient' | 'doctor';

function filterByDays(items: { timestamp?: number; date?: string }[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter(i => {
    const t = i.timestamp || new Date(i.date || '').getTime();
    return t >= cutoff;
  });
}

export function generatePDF(data: ExportData, mode: ExportMode, days: number) {
  const doc = new jsPDF();
  const isDoctor = mode === 'doctor';
  const primaryColor: [number, number, number] = [196, 112, 75]; // terracotta RGB
  const sageColor: [number, number, number] = [124, 154, 130];

  const checkIns = filterByDays(data.checkIns, days) as CheckIn[];
  const symptoms = filterByDays(data.symptoms, days) as Symptom[];
  const recentCompliance = filterByDays(data.compliance, days) as MedCompliance[];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(isDoctor ? 'CareThread — Clinical Summary' : 'CareThread — Health Summary', 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const rangeLabel = `Last ${days} days — Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  doc.text(rangeLabel, 14, 23);

  let y = 36;

  // Section helper
  const section = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setTextColor(...primaryColor);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += 2;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 6;
    doc.setTextColor(61, 44, 44); // foreground
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  };

  // --- Mood Overview ---
  if (checkIns.length > 0) {
    section(isDoctor ? 'Mood Assessment' : 'How You\'ve Been Feeling');
    const avgMood = checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length;
    if (isDoctor) {
      doc.text(`Average mood score: ${avgMood.toFixed(1)} / 5 (n=${checkIns.length})`, 14, y);
    } else {
      const emoji = MOOD_EMOJIS.find(m => m.value === Math.round(avgMood));
      doc.text(`Your average mood: ${avgMood.toFixed(1)} / 5 ${emoji ? emoji.label : ''} over ${checkIns.length} check-ins`, 14, y);
    }
    y += 10;
  }

  // --- Medications ---
  const activeMeds = data.medications.filter(m => m.status === 'active');
  if (activeMeds.length > 0) {
    section(isDoctor ? 'Current Medications' : 'Your Medications');
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
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Compliance ---
  if (recentCompliance.length > 0 && activeMeds.length > 0) {
    section(isDoctor ? 'Medication Adherence' : 'Taking Your Meds');
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
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // --- Symptoms ---
  if (symptoms.length > 0) {
    section(isDoctor ? 'Symptom Summary' : 'Symptom Patterns');
    // Aggregate
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
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Effect Ratings ---
  if (data.effectRatings.length > 0 && activeMeds.length > 0) {
    section(isDoctor ? 'Perceived Efficacy' : 'How Meds Are Working');
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
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Footer
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
