import type { CheckIn, Symptom, Medication, MedCompliance, Insight, MedEffectRating } from '@/types/health';

interface InsightData {
  checkIns: CheckIn[];
  symptoms: Symptom[];
  medications: Medication[];
  compliance: MedCompliance[];
  effectRatings: MedEffectRating[];
}

const MIN_DAYS = 7;

function daysBetween(ts1: number, ts2: number) {
  return Math.abs(ts1 - ts2) / (1000 * 60 * 60 * 24);
}

function getConfidence(days: number, changePct: number): Insight['confidence'] {
  if (days >= 14 && changePct > 30) return 'high';
  if (days >= 7 && changePct > 15) return 'moderate';
  return 'low';
}

export function generateInsights(data: InsightData): Insight[] {
  const { checkIns, symptoms, medications, compliance, effectRatings } = data;
  const insights: Insight[] = [];

  // Check minimum data threshold
  const uniqueDays = new Set(checkIns.map(c => c.date)).size;
  if (uniqueDays < MIN_DAYS) return [];

  // 1. Medication effect on symptoms
  medications.forEach(med => {
    if (!med.startDate) return;
    const medStart = new Date(med.startDate).getTime();
    const before = symptoms.filter(s => s.timestamp < medStart);
    const after = symptoms.filter(s => s.timestamp >= medStart);

    if (before.length >= 3 && after.length >= 3) {
      const avgBefore = before.reduce((a, s) => a + s.severity, 0) / before.length;
      const avgAfter = after.reduce((a, s) => a + s.severity, 0) / after.length;
      const changePct = Math.abs(((avgAfter - avgBefore) / avgBefore) * 100);
      const days = daysBetween(Date.now(), medStart);
      const conf = getConfidence(days, changePct);

      if (changePct > 10) {
        const direction = avgAfter < avgBefore ? 'dropped' : 'increased';
        insights.push({
          id: `med-effect-${med.id}`,
          type: 'medication_effect',
          message: `Average symptom severity ${direction} after starting ${med.name} (${conf} confidence)`,
          confidence: conf,
          relatedMedId: med.id,
          generatedAt: Date.now(),
        });
      }
    }
  });

  // 2. Missed dose correlations
  const missedDates = compliance.filter(c => !c.taken).map(c => c.date);
  if (missedDates.length >= 2) {
    const missedSymptoms = symptoms.filter(s => {
      const sDate = new Date(s.timestamp).toISOString().split('T')[0];
      return missedDates.includes(sDate) ||
        missedDates.some(d => {
          const next = new Date(d);
          next.setDate(next.getDate() + 1);
          return next.toISOString().split('T')[0] === sDate;
        });
    });
    const nonMissedSymptoms = symptoms.filter(s => !missedSymptoms.includes(s));

    if (missedSymptoms.length >= 2 && nonMissedSymptoms.length >= 2) {
      const avgMissed = missedSymptoms.reduce((a, s) => a + s.severity, 0) / missedSymptoms.length;
      const avgNormal = nonMissedSymptoms.reduce((a, s) => a + s.severity, 0) / nonMissedSymptoms.length;

      if (avgMissed > avgNormal * 1.15) {
        const changePct = ((avgMissed - avgNormal) / avgNormal) * 100;
        insights.push({
          id: 'missed-dose-correlation',
          type: 'missed_dose',
          message: `Symptom severity tends to increase after missed doses (${getConfidence(uniqueDays, changePct)} confidence)`,
          confidence: getConfidence(uniqueDays, changePct),
          generatedAt: Date.now(),
        });
      }
    }
  }

  // 3. Temporal patterns (weekday vs weekend)
  if (symptoms.length >= 14) {
    const weekday = symptoms.filter(s => {
      const d = new Date(s.timestamp).getDay();
      return d > 0 && d < 6;
    });
    const weekend = symptoms.filter(s => {
      const d = new Date(s.timestamp).getDay();
      return d === 0 || d === 6;
    });

    if (weekday.length >= 5 && weekend.length >= 3) {
      const avgWeekday = weekday.reduce((a, s) => a + s.severity, 0) / weekday.length;
      const avgWeekend = weekend.reduce((a, s) => a + s.severity, 0) / weekend.length;
      const changePct = Math.abs(((avgWeekend - avgWeekday) / avgWeekday) * 100);

      if (changePct > 15) {
        const worse = avgWeekend > avgWeekday ? 'weekends' : 'weekdays';
        insights.push({
          id: 'temporal-weekly',
          type: 'temporal_pattern',
          message: `Symptoms tend to be worse on ${worse} (${getConfidence(uniqueDays, changePct)} confidence)`,
          confidence: getConfidence(uniqueDays, changePct),
          generatedAt: Date.now(),
        });
      }
    }
  }

  return insights;
}

export function getDaysUntilInsights(checkIns: CheckIn[]): number {
  const uniqueDays = new Set(checkIns.map(c => c.date)).size;
  return Math.max(0, MIN_DAYS - uniqueDays);
}
