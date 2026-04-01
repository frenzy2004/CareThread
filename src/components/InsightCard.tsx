import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { Insight } from '@/types/health';

const CONFIDENCE_STYLES = {
  high: { bg: 'bg-secondary/15', text: 'text-secondary', label: 'High confidence' },
  moderate: { bg: 'bg-primary/10', text: 'text-primary', label: 'Moderate confidence' },
  low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Low confidence' },
};

const TYPE_ICONS = {
  medication_effect: TrendingUp,
  missed_dose: TrendingDown,
  temporal_pattern: Clock,
  provider_correlation: Shield,
};

interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
}

export function InsightCard({ insight, compact = false }: InsightCardProps) {
  const style = CONFIDENCE_STYLES[insight.confidence];
  const Icon = TYPE_ICONS[insight.type];

  if (compact) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl ${style.bg}`}>
        <Icon className={`w-4 h-4 mt-0.5 ${style.text}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{insight.message}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border border-border ${style.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${style.bg}`}>
          <Icon className={`w-4 h-4 ${style.text}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">{insight.message}</p>
          <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function InsightPreview({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Insights coming soon</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {daysLeft} more day{daysLeft !== 1 ? 's' : ''} of tracking until your first insights appear
      </p>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary/60 h-1.5 rounded-full transition-all"
          style={{ width: `${Math.max(10, ((7 - daysLeft) / 7) * 100)}%` }}
        />
      </div>
    </div>
  );
}
