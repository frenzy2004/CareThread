import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, Sparkles } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { useInsights } from '@/hooks/useInsights';
import { DailyCheckIn } from '@/components/DailyCheckIn';
import { MedicationCard } from '@/components/MedicationCard';
import { InsightCard, InsightPreview } from '@/components/InsightCard';
import { EmptyState } from '@/components/EmptyState';
import { WeeklySummary } from '@/components/WeeklySummary';
import { MOOD_EMOJIS } from '@/types/health';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const data = useHealthData();
  const { insights, daysUntilInsights, topInsight } = useInsights(
    data.checkIns, data.symptoms, data.medications, data.compliance, data.effectRatings
  );

  const yesterdayCheckIn = data.checkIns.find(c => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return c.date === yesterday.toISOString().split('T')[0];
  });

  const isFirstTime = data.checkIns.length === 0 && data.symptoms.length === 0 && data.medications.length === 0;

  if (isFirstTime) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <EmptyState
          icon="🌿"
          title="Let's start your health journey"
          description="CareThread helps you track symptoms, medications, and find patterns across your care. Start with a quick check-in."
          action={
            <div className="w-full">
              <DailyCheckIn
                todayCheckIn={undefined}
                streak={0}
                onCheckIn={data.addCheckIn}
              />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))] space-y-4">
      {/* Daily Check-in */}
      <DailyCheckIn
        todayCheckIn={data.todayCheckIn}
        streak={data.streak}
        onCheckIn={data.addCheckIn}
        lastCheckIn={yesterdayCheckIn}
      />

      {/* Weekly Summary */}
      <WeeklySummary
        checkIns={data.checkIns}
        symptoms={data.symptoms}
        activeMedications={data.activeMedications}
        compliance={data.compliance}
      />

      {/* Med Compliance Quick */}
      {data.activeMedications.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Today's Medications</h3>
          <div className="space-y-2">
            {data.activeMedications.slice(0, 3).map(med => {
              const tc = data.todayCompliance.find(c => c.medicationId === med.id);
              const daysSinceStart = Math.floor(
                (Date.now() - new Date(med.startDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  ratings={data.effectRatings}
                  todayCompliance={tc}
                  onToggleCompliance={(taken) => data.toggleCompliance(med.id, taken)}
                  onRate={(rating) => data.addEffectRating(med.id, rating)}
                  showEffectRating={daysSinceStart >= 7}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Symptoms */}
      {data.symptoms.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold text-foreground">Recent Symptoms</h3>
            <button
              onClick={() => navigate('/symptoms')}
              className="text-xs text-primary font-medium"
            >
              See all
            </button>
          </div>
          <div className="space-y-1.5">
            {data.symptoms.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  {s.bodyArea && <span className="text-xs text-muted-foreground ml-2">{s.bodyArea}</span>}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i < s.severity ? `severity-${s.severity}` : 'bg-muted'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {daysUntilInsights > 0 ? (
          <InsightPreview daysLeft={daysUntilInsights} />
        ) : topInsight ? (
          <>
            <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Top Insight</h3>
            <InsightCard insight={topInsight} />
          </>
        ) : null}
      </motion.div>

      {/* Floating CTA */}
      <button
        onClick={() => {
          if (!data.todayCheckIn) return; // check-in card handles this
          navigate('/symptoms');
        }}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors z-40"
      >
        <Plus className="w-4 h-4" />
        {data.todayCheckIn ? 'Log symptom' : 'Check in first'}
      </button>
    </div>
  );
}
