import { Pill, Flame, Stethoscope, Check, TrendingUp, Calendar } from 'lucide-react';
import { SEVERITY_BG } from '@/lib/constants';

export type TimelineEventType = 'medication_start' | 'medication_stop' | 'symptom' | 'checkin' | 'compliance' | 'insight';

export interface TimelineEventData {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: number;
  severity?: number;
  providerColor?: string;
  isMajor?: boolean;
}

const EVENT_CONFIG: Record<TimelineEventType, { icon: typeof Pill; color: string }> = {
  medication_start: { icon: Pill, color: 'text-secondary' },
  medication_stop: { icon: Pill, color: 'text-muted-foreground' },
  symptom: { icon: Flame, color: 'text-primary' },
  checkin: { icon: Calendar, color: 'text-muted-foreground' },
  compliance: { icon: Check, color: 'text-secondary' },
  insight: { icon: TrendingUp, color: 'text-primary' },
};

interface TimelineEventProps {
  event: TimelineEventData;
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;
  const date = new Date(event.timestamp);

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-px flex-1 bg-border group-last:hidden mt-1" />
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
          <time className="text-[10px] text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </time>
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
        )}
        {event.severity && (
          <div className="flex items-center gap-1 mt-1.5" role="img" aria-label={`Severity ${event.severity} of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < event.severity! ? SEVERITY_BG[event.severity!] : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
