import { useMemo } from 'react';
import { generateInsights, getDaysUntilInsights } from '@/lib/insights';
import type { CheckIn, Symptom, Medication, MedCompliance, MedEffectRating } from '@/types/health';

export function useInsights(
  checkIns: CheckIn[],
  symptoms: Symptom[],
  medications: Medication[],
  compliance: MedCompliance[],
  effectRatings: MedEffectRating[],
) {
  const insights = useMemo(
    () => generateInsights({ checkIns, symptoms, medications, compliance, effectRatings }),
    [checkIns, symptoms, medications, compliance, effectRatings],
  );

  const daysUntilInsights = useMemo(
    () => getDaysUntilInsights(checkIns),
    [checkIns],
  );

  const topInsight = insights[0] || null;

  return { insights, daysUntilInsights, topInsight };
}
