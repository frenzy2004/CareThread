import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CheckIn, Symptom, Medication, MedCompliance } from '@/types/health';
import { MOOD_EMOJIS } from '@/types/health';

interface WeeklySummaryProps {
  checkIns: CheckIn[];
  symptoms: Symptom[];
  activeMedications: Medication[];
  compliance: MedCompliance[];
}

function getComplianceLabel(rate: number): string {
  if (rate >= 1) return 'Took all doses';
  if (rate >= 0.8) return 'Took most doses';
  if (rate >= 0.4) return 'Some doses missed';
  return 'Several doses missed';
}

function getMoodEmoji(avg: number): string {
  const rounded = Math.round(avg) as 1 | 2 | 3 | 4 | 5;
  return MOOD_EMOJIS.find(m => m.value === rounded)?.emoji ?? '😐';
}

export function WeeklySummary({ checkIns, symptoms, activeMedications, compliance }: WeeklySummaryProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Last 7 days date strings
    const last7Dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      last7Dates.push(d.toISOString().split('T')[0]);
    }

    // Check-ins in last 7 days
    const weekCheckIns = checkIns.filter(c => last7Dates.includes(c.date));
    const checkInCount = weekCheckIns.length;

    if (checkInCount < 2) return null;

    // Average mood
    const avgMood = weekCheckIns.reduce((s, c) => s + c.mood, 0) / checkInCount;

    // Mood trend: first half (days 4-7 ago) vs second half (days 0-3 ago)
    const firstHalf = weekCheckIns.filter(c => {
      const idx = last7Dates.indexOf(c.date);
      return idx >= 4; // older days
    });
    const secondHalf = weekCheckIns.filter(c => {
      const idx = last7Dates.indexOf(c.date);
      return idx >= 0 && idx <= 3; // recent days
    });
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, c) => s + c.mood, 0) / firstHalf.length : avgMood;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, c) => s + c.mood, 0) / secondHalf.length : avgMood;
    const moodDiff = secondAvg - firstAvg;

    let trendLabel: string;
    let TrendIcon: typeof TrendingUp;
    if (moodDiff > 0.3) {
      trendLabel = 'Mood trending upward';
      TrendIcon = TrendingUp;
    } else if (moodDiff < -0.3) {
      trendLabel = 'Mood trending downward';
      TrendIcon = TrendingDown;
    } else {
      trendLabel = 'Mood holding steady';
      TrendIcon = Minus;
    }

    // Symptoms in last 7 days
    const weekSymptoms = symptoms.filter(s => {
      const d = new Date(s.timestamp).toISOString().split('T')[0];
      return d >= sevenDaysAgoStr && d <= todayStr;
    });

    // Compliance calculation respecting start dates
    let totalExpected = 0;
    let totalTaken = 0;
    for (const med of activeMedications) {
      for (const dateStr of last7Dates) {
        if (dateStr >= med.startDate) {
          totalExpected++;
          const record = compliance.find(c => c.medicationId === med.id && c.date === dateStr);
          if (record?.taken) totalTaken++;
        }
      }
    }
    const complianceRate = totalExpected > 0 ? totalTaken / totalExpected : -1;

    return {
      checkInCount,
      avgMood: Math.round(avgMood * 10) / 10,
      moodEmoji: getMoodEmoji(avgMood),
      symptomCount: weekSymptoms.length,
      complianceLabel: complianceRate >= 0 ? getComplianceLabel(complianceRate) : null,
      trendLabel,
      TrendIcon,
    };
  }, [checkIns, symptoms, activeMedications, compliance]);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.3 }}
      className="bg-card rounded-2xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <CalendarCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">This week at a glance</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Check-ins */}
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Check-ins</p>
          <p className="text-sm font-semibold text-foreground">{stats.checkInCount} of 7 days</p>
        </div>

        {/* Average Mood */}
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Average mood</p>
          <p className="text-sm font-semibold text-foreground">
            {stats.moodEmoji} {stats.avgMood}
          </p>
        </div>

        {/* Symptoms */}
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
          <p className="text-sm font-semibold text-foreground">
            {stats.symptomCount === 0 ? 'None this week' : `${stats.symptomCount} symptoms logged`}
          </p>
        </div>

        {/* Compliance */}
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Medications</p>
          <p className="text-sm font-semibold text-foreground">
            {stats.complianceLabel ?? 'No meds tracked'}
          </p>
        </div>
      </div>

      {/* Mood trend footer */}
      <div className="mt-3 flex items-center gap-1.5 px-1">
        <stats.TrendIcon className="w-3.5 h-3.5 text-secondary-foreground" />
        <span className="text-xs text-muted-foreground">{stats.trendLabel}</span>
      </div>
    </motion.div>
  );
}
