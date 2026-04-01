import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Filter } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { useInsights } from '@/hooks/useInsights';
import { TimelineEvent, type TimelineEventData } from '@/components/TimelineEvent';
import { InsightCard } from '@/components/InsightCard';
import { EmptyState } from '@/components/EmptyState';

export default function Timeline() {
  const data = useHealthData();
  const { insights } = useInsights(data.checkIns, data.symptoms, data.medications, data.compliance, data.effectRatings);
  const [focusMode, setFocusMode] = useState(false);
  const [zoomRange, setZoomRange] = useState<'week' | 'month' | 'all'>('all');

  const events = useMemo(() => {
    const items: TimelineEventData[] = [];

    data.symptoms.forEach(s => {
      items.push({
        id: `sym-${s.id}`, type: 'symptom', title: s.name,
        description: s.bodyArea ? `${s.bodyArea}${s.notes ? ' — ' + s.notes : ''}` : s.notes,
        timestamp: s.timestamp, severity: s.severity, isMajor: s.severity >= 4,
      });
    });

    data.medications.forEach(m => {
      items.push({
        id: `med-start-${m.id}`, type: 'medication_start',
        title: `Started ${m.name}`, description: `${m.dosage} · ${m.frequency}`,
        timestamp: new Date(m.startDate).getTime(), isMajor: true,
      });
      if (m.endDate) {
        items.push({
          id: `med-stop-${m.id}`, type: 'medication_stop',
          title: `Stopped ${m.name}`, description: m.discontinuationReason,
          timestamp: new Date(m.endDate).getTime(), isMajor: true,
        });
      }
    });

    data.checkIns.forEach(c => {
      items.push({
        id: `ci-${c.id}`, type: 'checkin',
        title: `Check-in: ${['', '😔', '😕', '😐', '🙂', '😊'][c.mood]}`,
        description: c.note, timestamp: c.timestamp, isMajor: false,
      });
    });

    insights.forEach(i => {
      items.push({
        id: `ins-${i.id}`, type: 'insight', title: 'Pattern detected',
        description: i.message, timestamp: i.generatedAt, isMajor: true,
      });
    });

    items.sort((a, b) => b.timestamp - a.timestamp);

    // Zoom filter
    const now = Date.now();
    const rangeMs = zoomRange === 'week' ? 7*86400000 : zoomRange === 'month' ? 30*86400000 : Infinity;
    const filtered = items.filter(e => now - e.timestamp < rangeMs);

    // Focus mode
    if (focusMode) return filtered.filter(e => e.isMajor);
    return filtered;
  }, [data, insights, focusMode, zoomRange]);

  const isEmpty = data.checkIns.length === 0 && data.symptoms.length === 0 && data.medications.length === 0;

  if (isEmpty) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <EmptyState
          icon="📖"
          title="Your story starts here"
          description="As you log check-ins, symptoms, and medications, your timeline will reveal your health journey."
        />
        {/* Sample preview */}
        <div className="mt-4 opacity-50 pointer-events-none">
          <TimelineEvent event={{ id: 'sample', type: 'insight', title: 'Pattern detected', description: 'After 7 days, insights like this will appear here', timestamp: Date.now(), isMajor: true }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Timeline</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              focusMode ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {focusMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Focus
          </button>
        </div>
      </div>

      {/* Zoom */}
      <div className="flex gap-1.5 mb-4">
        {(['week', 'month', 'all'] as const).map(r => (
          <button key={r} onClick={() => setZoomRange(r)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              zoomRange === r ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No events in this range{focusMode ? ' (try turning off Focus mode)' : ''}</p>
      ) : (
        <div>
          {events.map(event => (
            <TimelineEvent key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
